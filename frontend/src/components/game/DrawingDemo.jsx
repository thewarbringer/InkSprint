import { useEffect, useRef, useState } from "react";
import { DEMO_WORDS, DEMO_PATHS } from "../../constants/landingContent.js";

const WIN_THRESHOLD = 92;
const DRAW_DURATION_MS = 3200;
const WIN_PAUSE_MS = 1600;

export default function DrawingDemo() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const wordIndexRef = useRef(0);

  const [word, setWord] = useState(DEMO_WORDS[0]);
  const [confidence, setConfidence] = useState(0);
  const [opp1, setOpp1] = useState(0);
  const [opp2, setOpp2] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let cancelled = false;

    function sizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    function runCycle() {
      if (cancelled) return;

      const currentWord = DEMO_WORDS[wordIndexRef.current % DEMO_WORDS.length];
      wordIndexRef.current += 1;
      setWord(currentWord);
      setWon(false);
      setConfidence(0);
      setOpp1(0);
      setOpp2(0);
      setSecondsLeft(7);

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const segments = [];
      DEMO_PATHS[currentWord].forEach((stroke) => {
        for (let i = 0; i < stroke.length - 1; i++) {
          segments.push([stroke[i], stroke[i + 1]]);
        }
      });
      const totalSegments = segments.length;
      const startTime = performance.now();
      let winTriggered = false;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#00D4FF";
      ctx.lineWidth = 3.2;
      ctx.shadowColor = "rgba(0,212,255,0.6)";
      ctx.shadowBlur = 8;

      function frame(now) {
        if (cancelled) return;
        const t = Math.min(1, (now - startTime) / DRAW_DURATION_MS);
        const target = Math.floor(t * totalSegments);

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        for (let i = 0; i < Math.max(target, 1) && i < totalSegments; i++) {
          const [p1, p2] = segments[i];
          ctx.moveTo(p1[0] * w, p1[1] * h);
          ctx.lineTo(p2[0] * w, p2[1] * h);
        }
        ctx.stroke();

        const conf = Math.max(
          0,
          Math.min(100, Math.pow(t, 1.6) * 100 + Math.sin(t * 30) * 2)
        );
        setConfidence(conf);
        setOpp1(Math.max(0, Math.min(92, Math.pow(t * 0.85, 1.6) * 100)));
        setOpp2(Math.max(0, Math.min(85, Math.pow(t * 0.72, 1.6) * 100)));
        setSecondsLeft(Math.max(0, 7 - Math.floor(t * 7)));

        if (conf >= WIN_THRESHOLD && !winTriggered) {
          winTriggered = true;
          setWon(true);
          frameRef.current = setTimeout(runCycle, WIN_PAUSE_MS);
          return;
        }

        if (t < 1) {
          frameRef.current = requestAnimationFrame(frame);
        } else if (!winTriggered) {
          setWon(true);
          frameRef.current = setTimeout(runCycle, WIN_PAUSE_MS);
        }
      }

      frameRef.current = requestAnimationFrame(frame);
    }

    runCycle();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", sizeCanvas);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        clearTimeout(frameRef.current);
      }
    };
  }, []);

  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mb-3.5 flex items-center justify-between px-1">
        <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 font-mono text-[12.5px] text-muted">
          WORD: <span className="text-white">{word}</span>
        </span>
        <span className="font-mono text-[13px] text-warning">
          00:0{secondsLeft}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#0a0e24]">
        <canvas ref={canvasRef} className="block h-[260px] w-full" />
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-bg/70 backdrop-blur-sm transition-opacity duration-300 ${
            won ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="text-[34px] text-success" style={{ textShadow: "0 0 20px rgba(0,255,156,0.7)" }}>
            ✓ RECOGNIZED
          </div>
          <div className="font-mono text-[14px] tracking-[0.05em] text-white">
            YOU WIN THE ROUND
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[12.5px] text-muted">
          <span>
            Your AI confidence{" "}
            <b className="font-mono text-white">{Math.round(confidence)}%</b>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary to-success shadow-glow-success transition-[width] duration-150 ease-linear"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-2">
        <OpponentRow gradient="from-danger to-warning" value={opp1} />
        <OpponentRow gradient="from-secondary to-primary" value={opp2} />
      </div>
    </div>
  );
}

function OpponentRow({ gradient, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`h-5 w-5 flex-shrink-0 rounded-[6px] bg-gradient-to-br ${gradient}`} />
      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-white/[0.28] transition-[width] duration-150 ease-linear"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
