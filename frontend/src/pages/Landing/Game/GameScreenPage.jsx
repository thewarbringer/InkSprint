import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eraser } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import GameCanvas from "../../../components/game/GameCanvas.jsx";
import PredictionPanel from "../../../components/game/PredictionPanel.jsx";
import { Avatar } from "../../../components/common/UIAtoms.jsx";
import { getCurrentUser, getUserToken } from "../../../utils/auth.js";

const ROUND_SECONDS = 45;
const WIN_THRESHOLD = 92;
const WORD = "ROCKET";

function RemotePreviewCanvas({ strokes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 2;

    const baseWidth = 600;
    const baseHeight = 400;
    const scaleX = rect.width / baseWidth;
    const scaleY = rect.height / baseHeight;

    (strokes || []).forEach((stroke) => {
      if (!stroke?.from || !stroke?.to) return;
      ctx.beginPath();
      ctx.moveTo(stroke.from.x * scaleX, stroke.from.y * scaleY);
      ctx.lineTo(stroke.to.x * scaleX, stroke.to.y * scaleY);
      ctx.stroke();
    });
  }, [strokes]);

  return <canvas ref={canvasRef} className="h-full w-full" style={{ aspectRatio: '3 / 2' }} />;
}

export default function GameScreenPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [confidence, setConfidence] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [remoteCanvases, setRemoteCanvases] = useState([]);
  const roundEnded = useRef(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!roomCode) return;

    const currentUser = getCurrentUser();
    const username = currentUser?.username;
    if (!username) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const wsBaseUrl = baseUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    const ws = new WebSocket(`${wsBaseUrl}?roomId=${encodeURIComponent(roomCode)}&username=${encodeURIComponent(username)}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'drawStroke' && data.stroke && data.username !== username) {
          setRemoteCanvases((prev) => {
            const existing = prev.find((item) => item.username === data.username);
            if (existing) {
              return prev.map((item) => item.username === data.username ? { ...item, strokes: [...item.strokes, data.stroke] } : item);
            }
            return [...prev, { username: data.username, strokes: [data.stroke] }];
          });
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
    if (!roomCode) return;

    const pollGameState = async () => {
      try {
        const token = getUserToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/active-game/${roomCode}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.game) {
          navigate('/play');
          return;
        }

        if (result.game?.state === 'over' || result.game?.state === 'ended') {
          navigate(`/results/${roomCode}`);
          return;
        }

        if (result.game?.state === 'started') {
          const nextRoundsDone = result.game.roundsDone || 0;
          const nextTotalRounds = result.game.rounds || 1;
          const nextTimerSeconds = result.game.timerSeconds ?? ROUND_SECONDS;
          setCurrentRound(Math.min(nextRoundsDone + 1, nextTotalRounds));
          setTotalRounds(nextTotalRounds);
          setSecondsLeft(nextTimerSeconds);
          return;
        }

        navigate('/play');
      } catch (error) {
        console.error(error);
      }
    };

    pollGameState();
    const interval = setInterval(pollGameState, 500);

    return () => clearInterval(interval);
  }, [navigate, roomCode]);

  // Win check
  useEffect(() => {
    if (confidence >= WIN_THRESHOLD && !roundEnded.current) {
      roundEnded.current = true;
      const t = setTimeout(() => navigate(`/results/${roomCode}`), 1200);
      return () => clearTimeout(t);
    }
  }, [confidence, navigate, roomCode]);

  useEffect(() => {
    roundEnded.current = false;
    setConfidence(0);
    setRemoteCanvases([]);
  }, [currentRound]);

  return (
    <AppShell title="Sprint in progress" subtitle={`Room ${roomCode}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between">
            <PredictionPanel word={WORD} confidence={confidence} />
          </div>

          <div className="flex h-[320px] flex-col gap-3 sm:h-[420px] lg:h-[520px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[12px] font-semibold text-primary">
                  Round {currentRound}/{totalRounds}
                </span>
                <span className="font-mono text-[15px] text-warning">
                  00:{String(secondsLeft).padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={() => canvasRef.current?.clear()}
                className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-white"
              >
                <Eraser size={14} /> Clear
              </button>
            </div>
            <div className="mx-auto flex h-[320px] w-[320px] max-w-full items-center justify-center sm:h-[480px] sm:w-[720px]">
              <GameCanvas
                ref={canvasRef}
                onConfidenceChange={setConfidence}
                locked={roundEnded.current}
                socketRef={wsRef}
                roomId={roomCode}
                clearSignal={currentRound}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <h3 className="mb-3 text-[14px] font-semibold">Live sketches</h3>
            <div className="flex flex-col gap-3">
              {remoteCanvases.length === 0 ? (
                <div className="text-[12.5px] text-muted">No other players are drawing yet.</div>
              ) : (
                remoteCanvases.map((item) => (
                  <div key={item.username} className="rounded-[12px] border border-white/[0.08] bg-[#0a0e24] p-2">
                    <div className="mb-1 text-[12px] font-medium text-white/80">{item.username}</div>
                    <div className="mx-auto h-24 w-full max-w-[180px] rounded-[10px] border border-white/[0.06] bg-[#0a0e24]">
                      <RemotePreviewCanvas strokes={item.strokes} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <h3 className="mb-3 text-[14px] font-semibold">Round scores</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-muted">You</span>
                <span className="font-mono font-semibold">0</span>
              </div>
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
