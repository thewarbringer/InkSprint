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

const SMALL_CANVAS_WIDTH = 550;
const SMALL_CANVAS_HEIGHT = 550;
const LARGE_CANVAS_WIDTH = 550;
const LARGE_CANVAS_HEIGHT = 550;

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
  const activePointerId = useRef(null);
  const inkAmount = useRef(0);
  const startTime = useRef(performance.now());
  const lastPoint = useRef(null);
  const strokesRef = useRef([]);
  const isEmptyRef = useRef(true);
  const [isEmpty, setIsEmpty] = useState(true);

  function resetCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 550;
    const height = 550;
    canvas.width = Math.round(width * (window.devicePixelRatio || 1));
    canvas.height = Math.round(height * (window.devicePixelRatio || 1));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    inkAmount.current = 0;
    startTime.current = performance.now();
    lastPoint.current = null;
    strokesRef.current = [];
    isDrawing.current = false;
    activePointerId.current = null;
    isEmptyRef.current = true;
    setIsEmpty(true);
    onConfidenceChange?.(0);
  }

  useImperativeHandle(ref, () => ({
    clear() {
      resetCanvas();
    },
    getCanvas() {
      return canvasRef.current;
    },
    getStrokes() {
      return strokesRef.current;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function sizeCanvas() {
      const width = 550;
      const height = 550;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 18;
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    return () => window.removeEventListener("resize", sizeCanvas);
  }, []);

  function getPoint(e) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function sendStroke(stroke) {
    if (!socketRef?.current || socketRef.current.readyState !== WebSocket.OPEN || !roomId) return;
    socketRef.current.send(JSON.stringify({ type: 'drawStroke', stroke }));
  }

  function endStroke() {
    if (!isDrawing.current) return;

    isDrawing.current = false;
    if (activePointerId.current !== null) {
      try {
        canvasRef.current?.releasePointerCapture(activePointerId.current);
      } catch {
        // Ignore if the pointer is already released.
      }
      activePointerId.current = null;
    }
  }

  function handlePointerDown(e) {
    if (locked || e.button !== 0) return;
    e.preventDefault();

    const point = getPoint(e);
    if (!point) return;

    isDrawing.current = true;
    activePointerId.current = e.pointerId;
    isEmptyRef.current = false;
    setIsEmpty(false);
    lastPoint.current = point;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!isDrawing.current || locked || e.pointerId !== activePointerId.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPoint.current) return;

    const point = getPoint(e);
    const prev = lastPoint.current;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    const dist = Math.hypot(point.x - prev.x, point.y - prev.y);
    inkAmount.current += dist;
    lastPoint.current = point;

    const stroke = {
      from: prev,
      to: point,
    };

    strokesRef.current.push(stroke);
    sendStroke(stroke);

    const elapsed = performance.now() - startTime.current;
    onConfidenceChange?.(computeConfidence(inkAmount.current, elapsed));
  }

  function handlePointerUp(e) {
    if (e?.pointerId !== undefined && e.pointerId !== activePointerId.current) return;
    endStroke();
  }

  function handlePointerCancel(e) {
    if (e?.pointerId !== undefined && e.pointerId !== activePointerId.current) return;
    endStroke();
  }

  function handleLostPointerCapture(e) {
    if (e?.pointerId !== undefined && e.pointerId !== activePointerId.current) return;
    endStroke();
  }

  useEffect(() => {
    if (clearSignal !== undefined) {
      resetCanvas();
    }
  }, [clearSignal]);

  useEffect(() => {
    if (!canvasRef.current || !onRemoteStroke) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

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
    <div className="relative mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e24]" style={{ width: 550, height: 550, maxWidth: "100%" }}>
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-black/[0.25]">
          Start drawing here
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        className={`h-full w-full touch-none bg-white ${locked ? "cursor-not-allowed" : "cursor-crosshair"}`}
        style={{ width: 550, height: 550, maxWidth: "100%" }}
      />
    </div>
  );
});

export default GameCanvas;
