import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eraser, Send } from "lucide-react";
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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const baseWidth = 550;
    const baseHeight = 550;
    const scaleX = rect.width / baseWidth;
    const scaleY = rect.height / baseHeight;

    (strokes || []).forEach((stroke) => {
      if (!stroke?.from || !stroke?.to) return;
      ctx.beginPath();
      ctx.moveTo(stroke.from.x * scaleX, stroke.from.y * scaleY);
      ctx.lineTo(stroke.to.x * scaleX, stroke.to.y * scaleY);
      ctx.strokeStyle = stroke.color || '#00D4FF';
      ctx.lineWidth = (stroke.width || 18) * Math.min(scaleX, scaleY);
      ctx.stroke();
    });
  }, [strokes]);

  return <canvas ref={canvasRef} className="h-full w-full" style={{ aspectRatio: '3 / 2' }} />;
}

function SharedSketchCanvas({ remoteCanvases }) {
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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const baseWidth = 550;
    const baseHeight = 550;
    const scaleX = rect.width / baseWidth;
    const scaleY = rect.height / baseHeight;

    (remoteCanvases || []).forEach((entry) => {
      (entry?.strokes || []).forEach((stroke) => {
        if (!stroke?.from || !stroke?.to) return;
        ctx.beginPath();
        ctx.moveTo(stroke.from.x * scaleX, stroke.from.y * scaleY);
        ctx.lineTo(stroke.to.x * scaleX, stroke.to.y * scaleY);
        ctx.strokeStyle = stroke.color || '#00D4FF';
        ctx.lineWidth = (stroke.width || 18) * Math.min(scaleX, scaleY);
        ctx.stroke();
      });
    });
  }, [remoteCanvases]);

  return <canvas ref={canvasRef} className="h-full w-full rounded-[10px]" />;
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
  const [activeTool, setActiveTool] = useState("pencil"); // "pencil" | "eraser"
  const [eraserSize, setEraserSize] = useState(36);
  const [isHeld, setIsHeld] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState('');
  const roundEnded = useRef(false);
  const wsRef = useRef(null);
  const solvedForRoundRef = useRef(false);
  const currentUser = getCurrentUser();
  const username = currentUser?.username || 'player';

  const { confidence: modelConfidence, predictedWord, topPredictions, modelReady } = useQuickDrawPrediction({
    canvasRef,
    targetWord: currentWord || WORD,
    active: !roundEnded.current,
    roundStartedAt,
  });
  const confidence = modelReady ? modelConfidence : inkConfidence;

  useEffect(() => {
    setIsHeld(false);
  }, [currentWord]);

  useEffect(() => {
    if (!roomCode) return;

    if (!username) return;

    // Check if this is a new room or same room
    const storedRoomCode = sessionStorage.getItem('gameRoomCode');
    const isNewRoom = storedRoomCode !== roomCode;

    if (isNewRoom) {
      // New game - clear everything
      setChatMessages([]);
      setRemoteCanvases([]);
      setPlayers([]);
      sessionStorage.setItem('gameRoomCode', roomCode);
      sessionStorage.removeItem('gameChatMessages');
    } else {
      // Same room after reload - restore chat from sessionStorage
      const stored = sessionStorage.getItem('gameChatMessages');
      if (stored) {
        try {
          setChatMessages(JSON.parse(stored));
        } catch (e) {
          setChatMessages([]);
        }
      }
    }

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

        if (data.type === 'playerLeft' && data.username) {
          // If current player left the game, redirect to dashboard
          if (data.leftGame && data.username === username) {
            navigate('/dashboard', { state: { leftGame: true, roomId: roomCode } });
            return;
          }
          // Otherwise just remove from players list
          setPlayers((prev) => prev.filter((playerEntry) => playerEntry.username !== data.username));
        }

        if (data.type === 'chat' && data.message) {
          setChatMessages((prev) => [...prev, data.message]);
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

  // Persist chat messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('gameChatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

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

  function sendChatMessage(e) {
    e.preventDefault();
    if (!chatDraft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: 'chat', text: chatDraft.trim() }));
    setChatDraft('');
  }

  useEffect(() => {
    if (!modelReady || !roomCode || !currentWord || !username || solvedForRoundRef.current) return;

    const normalizedTargetWord = currentWord || WORD;
    const topThreeIncludesTarget = (topPredictions || []).slice(0, 3).some((prediction) =>
      isPredictionMatch(prediction?.label, normalizedTargetWord)
    );

    if (topThreeIncludesTarget) {
      setIsHeld(true);
      roundEnded.current = true;
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

          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[12px] font-semibold text-primary">
                  Round {currentRound}/{totalRounds}
                </span>
                <span className="font-mono text-[15px] text-warning">
                  00:{String(secondsLeft).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {activeTool === "eraser" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5">
                    <span className="text-[12px] text-muted">Eraser</span>
                    <input
                      type="range"
                      min="12"
                      max="80"
                      step="2"
                      value={eraserSize}
                      onChange={(event) => setEraserSize(Number(event.target.value))}
                      className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-primary"
                    />
                    <span className="min-w-[2.2rem] text-right text-[12px] font-medium text-white">{eraserSize}px</span>
                  </div>
                ) : null}
                {/* Tool Selector */}
                <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
                  <button
                    onClick={() => setActiveTool("pencil")}
                    className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                      activeTool === "pencil"
                        ? "bg-primary text-white"
                        : "text-muted hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    Draw
                  </button>
                  <button
                    onClick={() => setActiveTool("eraser")}
                    className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                      activeTool === "eraser"
                        ? "bg-primary text-white"
                        : "text-muted hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    Eraser
                  </button>
                </div>

                <button
                  onClick={() => {
                    canvasRef.current?.clear();
                    setActiveTool("pencil"); // Reset to pencil tool on clear
                  }}
                  className="flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-white"
                >
                  <Eraser size={14} /> Clear
                </button>
              </div>
            </div>
            <div className="mx-auto flex w-full max-w-[550px] items-center justify-center aspect-square mt-2">
              <GameCanvas
                ref={canvasRef}
                onConfidenceChange={setInkConfidence}
                locked={roundEnded.current || isHeld}
                socketRef={wsRef}
                roomId={roomCode}
                clearSignal={currentRound}
                activeTool={activeTool}
                eraserSize={eraserSize}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <h3 className="mb-3 text-[14px] font-semibold">Shared live sketches</h3>
            <div className="mb-3 h-28 overflow-hidden rounded-[10px] border border-white/[0.06] bg-[#0a0e24]">
              <SharedSketchCanvas remoteCanvases={remoteCanvases} />
            </div>
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
            <h3 className="mb-3 text-[14px] font-semibold">Game chat</h3>
            <div className="mb-3 flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
              {chatMessages.length > 0 ? (
                chatMessages.map((message, index) => (
                  <div key={`${message.timestamp || index}-${index}`} className="text-[12.5px] leading-5">
                    <span className={`font-semibold ${message.system ? 'text-muted' : 'text-secondary'}`}>{message.name}: </span>
                    <span className={message.system ? 'text-white/70' : 'text-white/[0.85]'}>{message.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-[12px] text-muted">No chat yet.</div>
              )}
            </div>
            <form onSubmit={sendChatMessage} className="flex gap-2">
              <input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="Say something…"
                className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/[0.25] focus:border-primary/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !chatDraft.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

          <Button
            variant="ghost"
            className="justify-center"
            onClick={() => {
              // Close WebSocket to trigger leave broadcast to other players
              if (wsRef.current) {
                wsRef.current.close();
              }
              // Clear session storage for this game
              sessionStorage.removeItem('gameRoomCode');
              sessionStorage.removeItem('gameChatMessages');
              navigate('/dashboard', { state: { leftGame: true, roomId: roomCode } });
            }}
          >
            Leave sprint
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
