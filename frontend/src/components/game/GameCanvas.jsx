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

const GameCanvas = forwardRef(function GameCanvas({ onConfidenceChange, locked }, ref) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const inkAmount = useRef(0);
  const startTime = useRef(performance.now());
  const lastPoint = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      inkAmount.current = 0;
      startTime.current = performance.now();
      setIsEmpty(true);
      onConfidenceChange?.(0);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function sizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#00D4FF";
      ctx.lineWidth = 4;
      ctx.shadowColor = "rgba(0,212,255,0.5)";
      ctx.shadowBlur = 6;
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    return () => window.removeEventListener("resize", sizeCanvas);
  }, []);

  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e) {
    if (locked) return;
    isDrawing.current = true;
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

    const elapsed = performance.now() - startTime.current;
    onConfidenceChange?.(computeConfidence(inkAmount.current, elapsed));
  }

  function handlePointerUp() {
    isDrawing.current = false;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e24]">
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
      />
    </div>
  );
});

export default GameCanvas;
