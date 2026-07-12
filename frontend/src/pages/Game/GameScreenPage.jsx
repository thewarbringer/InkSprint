import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eraser } from "lucide-react";
import AppShell from "../../components/layout/AppShell.jsx";
import Button from "../../components/common/Button.jsx";
import GameCanvas from "../../components/game/GameCanvas.jsx";
import PredictionPanel from "../../components/game/PredictionPanel.jsx";
import { Avatar, ProgressBar } from "../../components/common/UIAtoms.jsx";
import { GAME_OPPONENTS } from "../../constants/appData.js";
import useQuickDrawPrediction from "../../hooks/useQuickDrawPrediction.js";
import { isPredictionMatch } from "../../utils/predictions.js";


export default function GameScreenPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const [word, setWord] = useState("");

  const [inkConfidence, setInkConfidence] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [roundLocked, setRoundLocked] = useState(false);
  const [opponents, setOpponents] = useState(
    GAME_OPPONENTS.map((o) => ({ ...o, confidence: 0 }))
  );
  const roundEnded = useRef(false);

  // Real model prediction — only takes over once a trained model is found
  // at public/models/quickdraw/. Until then, modelReady stays false and
  // we use GameCanvas's built-in ink-coverage heuristic instead, so the
  // game is fully playable before training is done.
  const { confidence: modelConfidence, predictedWord, topPredictions, modelReady } = useQuickDrawPrediction({
    canvasRef,
    targetWord: word,
    active: !roundLocked,
    previewCanvasRef,
  });

  const confidence = modelReady ? modelConfidence : inkConfidence;

  useEffect(() => {
    if (!roomCode) return;

    const ws = new WebSocket(`${import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws').replace(/^https/, 'wss') || 'ws://localhost:3000'}?roomId=${encodeURIComponent(roomCode)}&username=${encodeURIComponent('player')}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if ((data.type === 'start' || data.type === 'roundAdvance') && data.word) {
          setWord(data.word);
        }
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomCode]);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/active-game/${roomCode}`);
        const result = await response.json().catch(() => ({}));
        if (result?.game?.currentWord) {
          setWord(result.game.currentWord);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (roomCode) {
      fetchGameState();
    }
  }, [roomCode]);

  // Round timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          if (!roundEnded.current) {
            roundEnded.current = true;
            setRoundLocked(true);
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
    const normalizedTargetWord = word?.trim();
    const topFiveIncludesTarget = (topPredictions || []).slice(0, 5).some((prediction) =>
      isPredictionMatch(prediction?.label, normalizedTargetWord)
    );

    if (modelReady && topFiveIncludesTarget && !roundEnded.current) {
      roundEnded.current = true;
      alert(`You guessed "${word}"!`);
      setRoundLocked(true);
      const t = setTimeout(() => navigate(`/results/${roomCode}`), 1200);
      return () => clearTimeout(t);
    }
  }, [modelReady, navigate, roomCode, topPredictions, word]);

  return (
    <AppShell
      title="Sprint in progress"
      subtitle={`Room ${roomCode}${modelReady ? "" : " · using placeholder recognition (train the model to enable real AI)"}`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <PredictionPanel
              word={word}
              confidence={confidence}
              predictedWord={predictedWord}
              topPredictions={topPredictions}
            />
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
              <GameCanvas ref={canvasRef} onConfidenceChange={setInkConfidence} locked={roundLocked} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <h3 className="mb-3 text-[14px] font-semibold">Normalized preview</h3>
            <div className="mb-4 flex items-center justify-center rounded-xl border border-white/[0.08] bg-black/15 p-3">
              <canvas
                ref={previewCanvasRef}
                width={112}
                height={112}
                className="rounded-lg border border-white/[0.08] bg-white"
                style={{ imageRendering: "pixelated", width: 112, height: 112 }}
              />
            </div>
            <p className="text-[12px] text-muted">The processed 28×28 sketch will appear here as you draw.</p>
          </div>

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

          <Button variant="ghost" className="justify-center" onClick={() => navigate(`/dashboard`)}>
            Leave sprint
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
