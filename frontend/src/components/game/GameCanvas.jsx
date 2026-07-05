import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * Drawable canvas for the Game Screen.
 *
 * IMPORTANT: `computeConfidence` below is a STAND-IN for the real on-device
 * model. It estimates confidence from how much ink has been drawn, purely so
 * the UI has something live to react to. Replace the inside of this function
 * (or better, replace the whole confidence loop) with a call out to your
 * TensorFlow.js model — e.g. run canvas.toDataURL() / ImageData through the
 * model on an interval and setConfidence(prediction.score * 100).
 */
function computeConfidence(inkAmount, elapsedMs) {
  const coverage = Math.min(1, inkAmount / 4200);
  const timeBonus = Math.min(1, elapsedMs / 9000);
  const raw = coverage * 70 + timeBonus * 30;
  return Math.max(0, Math.min(97, raw));
}

const SMALL_CANVAS_WIDTH = 320;
const SMALL_CANVAS_HEIGHT = 320;
const LARGE_CANVAS_WIDTH = 720;
const LARGE_CANVAS_HEIGHT = 480;

function getCanvasSize() {
  if (typeof window === "undefined") {
    return { width: LARGE_CANVAS_WIDTH, height: LARGE_CANVAS_HEIGHT };
  }

  return window.innerWidth < 640
    ? { width: SMALL_CANVAS_WIDTH, height: SMALL_CANVAS_HEIGHT }
    : { width: LARGE_CANVAS_WIDTH, height: LARGE_CANVAS_HEIGHT };
}

const GameCanvas = forwardRef(function GameCanvas({ onConfidenceChange, locked, socketRef, roomId, onRemoteStroke, clearSignal }, ref) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const inkAmount = useRef(0);
  const startTime = useRef(performance.now());
  const lastPoint = useRef(null);
  const isEmptyRef = useRef(true);
  const [isEmpty, setIsEmpty] = useState(true);

  function resetCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = getCanvasSize();
    ctx.clearRect(0, 0, width, height);
    inkAmount.current = 0;
    startTime.current = performance.now();
    lastPoint.current = null;
    isDrawing.current = false;
    isEmptyRef.current = true;
    setIsEmpty(true);
    onConfidenceChange?.(0);
  }

  useImperativeHandle(ref, () => ({
    clear() {
      resetCanvas();
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function sizeCanvas() {
      const { width, height } = getCanvasSize();
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#00D4FF";
      ctx.lineWidth = 4;
      ctx.shadowColor = "rgba(0,212,255,0.5)";
      ctx.shadowBlur = 6;
      ctx.clearRect(0, 0, width, height);
    }

    sizeCanvas();
  }, []);

  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const { width, height } = getCanvasSize();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function sendStroke(stroke) {
    if (!socketRef?.current || socketRef.current.readyState !== WebSocket.OPEN || !roomId) return;
    socketRef.current.send(JSON.stringify({ type: 'drawStroke', stroke }));
  }

  function handlePointerDown(e) {
    if (locked) return;
    isDrawing.current = true;
    isEmptyRef.current = false;
    setIsEmpty(false);
    lastPoint.current = getPoint(e);
    canvasRef.current.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!isDrawing.current || locked) return;
    const ctx = canvasRef.current.getContext("2d");
    const point = getPoint(e);
    const prev = lastPoint.current;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    const dist = Math.hypot(point.x - prev.x, point.y - prev.y);
    inkAmount.current += dist;
    lastPoint.current = point;

    sendStroke({
      from: prev,
      to: point,
    });

    const elapsed = performance.now() - startTime.current;
    onConfidenceChange?.(computeConfidence(inkAmount.current, elapsed));
  }

  function handlePointerUp() {
    isDrawing.current = false;
  }

  useEffect(() => {
    if (clearSignal !== undefined) {
      resetCanvas();
    }
  }, [clearSignal]);

  useEffect(() => {
    if (!canvasRef.current || !onRemoteStroke) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawRemoteStroke = (stroke) => {
      if (!stroke?.from || !stroke?.to) return;
      ctx.beginPath();
      ctx.moveTo(stroke.from.x, stroke.from.y);
      ctx.lineTo(stroke.to.x, stroke.to.y);
      ctx.stroke();
    };

    onRemoteStroke(drawRemoteStroke);
  }, [onRemoteStroke]);

  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e24]">
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-white/[0.2]">
          Start drawing here
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`h-full w-full touch-none ${locked ? "cursor-not-allowed" : "cursor-crosshair"}`}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
});

export default GameCanvas;
