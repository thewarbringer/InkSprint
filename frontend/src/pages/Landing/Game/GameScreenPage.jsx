import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eraser } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import GameCanvas from "../../../components/game/GameCanvas.jsx";
import PredictionPanel from "../../../components/game/PredictionPanel.jsx";
import { Avatar, ProgressBar } from "../../../components/common/UIAtoms.jsx";
import { GAME_OPPONENTS } from "../../../constants/appData.js";

const ROUND_SECONDS = 30;
const WIN_THRESHOLD = 92;
const WORD = "ROCKET";

export default function GameScreenPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [confidence, setConfidence] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [opponents, setOpponents] = useState(
    GAME_OPPONENTS.map((o) => ({ ...o, confidence: 0 }))
  );
  const roundEnded = useRef(false);

  // Round timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          if (!roundEnded.current) {
            roundEnded.current = true;
            navigate(`/results/${roomCode}`);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, roomCode]);

  // Simulate opponents' AI confidence slowly climbing (placeholder for
  // real multiplayer state coming over a websocket/room channel).
  useEffect(() => {
    const interval = setInterval(() => {
      setOpponents((prev) =>
        prev.map((o) => ({
          ...o,
          confidence: Math.min(90, o.confidence + Math.random() * 6),
        }))
      );
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Win check
  useEffect(() => {
    if (confidence >= WIN_THRESHOLD && !roundEnded.current) {
      roundEnded.current = true;
      const t = setTimeout(() => navigate(`/results/${roomCode}`), 1200);
      return () => clearTimeout(t);
    }
  }, [confidence, navigate, roomCode]);

  return (
    <AppShell title="Sprint in progress" subtitle={`Room ${roomCode}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <PredictionPanel word={WORD} confidence={confidence} />
          </div>

          <div className="flex h-[420px] flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[15px] text-warning">
                00:{String(secondsLeft).padStart(2, "0")}
              </span>
              <button
                onClick={() => canvasRef.current?.clear()}
                className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-white"
              >
                <Eraser size={14} /> Clear
              </button>
            </div>
            <div className="flex-1">
              <GameCanvas ref={canvasRef} onConfidenceChange={setConfidence} locked={roundEnded.current} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <h3 className="mb-4 text-[14px] font-semibold">Opponents</h3>
            <div className="flex flex-col gap-4">
              {opponents.map((o) => (
                <div key={o.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={o.name} gradient={o.grad} size={26} />
                      <span className="text-[13px] font-medium">{o.name}</span>
                    </div>
                    <span className="text-[11.5px] text-muted">{Math.round(o.confidence)}%</span>
                  </div>
                  <ProgressBar value={o.confidence} gradient="from-white/[0.4] to-white/[0.2]" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <h3 className="mb-3 text-[14px] font-semibold">Round scores</h3>
            <div className="flex flex-col gap-2.5">
              {[{ name: "You", score: 3 }, ...opponents.map((o) => ({ name: o.name, score: o.score }))].map(
                (p) => (
                  <div key={p.name} className="flex items-center justify-between text-[13.5px]">
                    <span className="text-muted">{p.name}</span>
                    <span className="font-mono font-semibold">{p.score}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <Button variant="ghost" className="justify-center" onClick={() => navigate(`/lobby/${roomCode}`)}>
            Leave sprint
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
