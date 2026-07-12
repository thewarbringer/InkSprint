import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eraser } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import GameCanvas from "../../../components/game/GameCanvas.jsx";
import PredictionPanel from "../../../components/game/PredictionPanel.jsx";
import { Avatar } from "../../../components/common/UIAtoms.jsx";
import { getCurrentUser, getUserToken } from "../../../utils/auth.js";
import useQuickDrawPrediction from "../../../hooks/useQuickDrawPrediction.js";
import { isPredictionMatch } from "../../../utils/predictions.js";

const ROUND_SECONDS = 45;
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

  const [inkConfidence, setInkConfidence] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [remoteCanvases, setRemoteCanvases] = useState([]);
  const [players, setPlayers] = useState([]);
  const [notification, setNotification] = useState('');
  const [roundStartedAt, setRoundStartedAt] = useState(Date.now());
  const roundEnded = useRef(false);
  const wsRef = useRef(null);
  const solvedForRoundRef = useRef(false);
  const currentUser = getCurrentUser();
  const username = currentUser?.username;

  const { confidence: modelConfidence, predictedWord, topPredictions, modelReady } = useQuickDrawPrediction({
    canvasRef,
    targetWord: currentWord || WORD,
    active: !roundEnded.current,
    roundStartedAt,
  });
  const confidence = modelReady ? modelConfidence : inkConfidence;
  const isHeld = players.some((playerEntry) => playerEntry.username === username && playerEntry.hold);

  useEffect(() => {
    if (!roomCode) return;

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

        if (Array.isArray(data.players)) {
          setPlayers(data.players);
        }

        if (data.type === 'roundSolved' && data.player) {
          if (data.message) {
            setNotification(data.message);
            window.setTimeout(() => setNotification(''), 2500);
          }

          if (Array.isArray(data.strokes) && data.player?.username) {
            setRemoteCanvases((prev) => {
              const existing = prev.find((item) => item.username === data.player.username);
              if (existing) {
                return prev.map((item) => item.username === data.player.username ? { ...item, strokes: data.strokes } : item);
              }
              return [...prev, { username: data.player.username, strokes: data.strokes }];
            });
          }

          setPlayers((prev) => prev.map((playerEntry) => playerEntry.username === data.player.username ? {
            ...playerEntry,
            scores: data.player.scores,
          } : playerEntry));
        }

        if ((data.type === 'start' || data.type === 'roundAdvance' || data.type === 'roundWord') && data.word) {
          setCurrentWord(data.word);
          setRoundStartedAt(Date.now());
          solvedForRoundRef.current = false;
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
          const nextWord = result.game.currentWord || result.game.word || '';
          setCurrentRound(Math.min(nextRoundsDone + 1, nextTotalRounds));
          setTotalRounds(nextTotalRounds);
          setSecondsLeft(nextTimerSeconds);
          if (Array.isArray(result.game.players)) {
            setPlayers(result.game.players);
          }
          if (nextWord) {
            setCurrentWord(nextWord);
          }
          setRoundStartedAt(Date.now());
          solvedForRoundRef.current = false;
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

  useEffect(() => {
    roundEnded.current = false;
    setInkConfidence(0);
    setRemoteCanvases([]);
    solvedForRoundRef.current = false;
  }, [currentRound]);

  useEffect(() => {
    if (!modelReady || !roomCode || !currentWord || !username || solvedForRoundRef.current) return;

    const normalizedTargetWord = currentWord || WORD;
    const topThreeIncludesTarget = (topPredictions || []).slice(0, 3).some((prediction) =>
      isPredictionMatch(prediction?.label, normalizedTargetWord)
    );

    if (topThreeIncludesTarget) {
      solvedForRoundRef.current = true;
      const strokes = canvasRef.current?.getStrokes?.() || [];
      wsRef.current?.send(JSON.stringify({ type: 'solveRound', strokes }));
    }
  }, [currentWord, modelReady, roomCode, topPredictions, username]);

  return (
    <AppShell title="Sprint in progress" subtitle={`Room ${roomCode}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between">
            <PredictionPanel
              word={currentWord || WORD}
              confidence={confidence}
              predictedWord={predictedWord}
              topPredictions={topPredictions}
              isHeld={isHeld}
            />
          </div>

          {notification ? (
            <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-[13px] text-success">
              {notification}
            </div>
          ) : null}

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
                onConfidenceChange={setInkConfidence}
                locked={roundEnded.current || isHeld}
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
              {players.length === 0 ? (
                <div className="text-[12.5px] text-muted">No players are in the room yet.</div>
              ) : (
                players.map((playerEntry) => (
                  <div key={playerEntry.username} className="rounded-[12px] border border-white/[0.08] bg-[#0a0e24] p-2">
                    <div className="mb-1 flex items-center justify-between text-[12px] font-medium text-white/80">
                      <span>{playerEntry.username}</span>
                    </div>
                    <div className="mb-2 text-[13px] font-mono text-white">{playerEntry.scores || 0}</div>
                    {remoteCanvases.find((item) => item.username === playerEntry.username) ? (
                      <div className="h-24 w-full rounded-[10px] border border-white/[0.06] bg-[#0a0e24]">
                        <RemotePreviewCanvas strokes={remoteCanvases.find((item) => item.username === playerEntry.username)?.strokes || []} />
                      </div>
                    ) : null}
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
