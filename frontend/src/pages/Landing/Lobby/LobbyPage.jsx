import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, Crown, Send } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import { Avatar, Badge } from "../../../components/common/UIAtoms.jsx";
import { getCurrentUser, getUserToken } from "../../../utils/auth.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [gameState, setGameState] = useState('waiting');

  const currentUser = getCurrentUser();
  const token = getUserToken();
  const currentUsername = currentUser?.username;
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  const you = players.find((p) => p.isYou);
  const allReady = players.length > 0 && players.every((p) => p.ready);

  async function toggleReady() {
    if (!you) return;

    const nextReadyState = you.ready ? 'no' : 'yes';
    setLoadError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/active-game/${roomCode}/ready`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ready: nextReadyState }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to update ready state.');
      }

      const lobbyPlayers = (result.game.players || []).map((player, index) => ({
        name: player.username,
        ready: player.ready === 'yes',
        isHost: index === 0,
        isYou: player.username === currentUsername,
        grad: 'from-primary to-secondary',
      }));

      setPlayers(lobbyPlayers);
    } catch (err) {
      console.error(err);
      setLoadError(err.message || 'Unable to update ready state.');
    }
  }

  function copyInvite() {
    navigator.clipboard?.writeText(`inksprint.ai/join/${roomCode}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function fetchLobbyPlayers() {
    if (!token) {
      setLoadError('You must be logged in to view the lobby.');
      setPlayers([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/active-game/${roomCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to load room details.');
      }

      const nextState = result.game?.state || 'waiting';
      setGameState(nextState);

      if (nextState === 'started') {
        navigate(`/game/${roomCode}`);
        return;
      }

      if (nextState === 'over') {
        navigate(`/results/${roomCode}`);
        return;
      }

      const lobbyPlayers = (result.game.players || []).map((player, index) => ({
        name: player.username,
        ready: player.ready === 'yes',
        isHost: index === 0,
        isYou: player.username === currentUsername,
        grad: 'from-primary to-secondary',
      }));

      setPlayers(lobbyPlayers);
      setLoadError(null);
    } catch (err) {
      console.error(err);
      setLoadError(err.message || 'Unable to load room details.');
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchLobbyPlayers().finally(() => setIsLoading(false));

    pollRef.current = setInterval(() => {
      fetchLobbyPlayers();
    }, 500);

    return () => {
      clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [roomCode, token, currentUsername]);

  useEffect(() => {
    if (!token || !currentUsername) return;

    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}?roomId=${encodeURIComponent(roomCode)}&username=${encodeURIComponent(currentUsername)}`);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        return;
      }

      if (data.type === 'start') {
        navigate(`/game/${roomCode}`);
        return;
      }

      if (data.type === 'chat' && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [roomCode, token, currentUsername]);

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = JSON.stringify({ type: 'chat', text: draft.trim() });
    wsRef.current.send(payload);
    setDraft("");
  }

  async function startGame() {
    if (!token) {
      setLoadError('You must be logged in to start the game.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/active-game/${roomCode}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to start the game.');
      }

      navigate(`/game/${roomCode}`);
    } catch (err) {
      console.error(err);
      setLoadError(err.message || 'Unable to start the game.');
    }
  }

  return (
    <AppShell title="Lobby" subtitle={`Room ${roomCode}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
            <div>
              <div className="text-[12px] text-muted">Room code</div>
              <div className="font-mono text-[18px] font-semibold">{roomCode}</div>
            </div>
            <Button variant="ghost" onClick={copyInvite}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy invite link"}
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {isLoading ? (
              <div className="text-[14px] text-muted">Loading room players…</div>
            ) : loadError ? (
              <div className="text-[14px] text-danger">{loadError}</div>
            ) : players.length === 0 ? (
              <div className="text-[14px] text-muted">No players have joined yet.</div>
            ) : (
              players.map((p) => (
                <div
                  key={`${p.name}-${p.isHost ? 'host' : 'guest'}`}
                  className={`flex items-center justify-between rounded-2xl border p-4 ${
                    p.isYou ? "border-primary/40 bg-primary/[0.08]" : "border-white/[0.08] bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} gradient={p.grad} size={38} />
                    <div>
                      <div className="flex items-center gap-1.5 text-[14px] font-semibold">
                        {p.name}
                        {p.isHost && <Crown size={13} className="text-warning" />}
                      </div>
                      {p.isYou && <div className="text-[11.5px] text-muted">You</div>}
                    </div>
                  </div>
                  <Badge tone={p.ready ? "success" : "muted"}>{p.ready ? "Ready" : "Waiting"}</Badge>
                </div>
              ))
            )}
          </motion.div>

          <div className="mt-6 flex gap-3">
            <Button variant={you?.ready ? "ghost" : "primary"} onClick={toggleReady} className="flex-1 justify-center">
              {you?.ready ? "Not ready" : "I'm ready"}
            </Button>
            {you?.isHost && (
              <Button
                variant="primary"
                disabled={!allReady}
                onClick={startGame}
                className="flex-1 justify-center disabled:opacity-40"
              >
                Start game
              </Button>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="flex h-[420px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Room chat</h3>
            <div className="text-[12px] text-muted">{wsConnected ? 'Live' : 'Offline'}</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length > 0 ? (
              messages.map((m, i) => (
                <div key={i} className="text-[13.5px]">
                  <span className="font-semibold text-secondary">{m.name}: </span>
                  <span className="text-white/[0.85]">{m.text}</span>
                </div>
              ))
            ) : null}
          </div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Say something…"
              className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[13.5px] text-white placeholder:text-white/[0.25] focus:border-primary/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!wsConnected || !draft.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
