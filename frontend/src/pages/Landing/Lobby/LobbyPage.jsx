import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, Crown, Send } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import { Avatar, Badge } from "../../../components/common/UIAtoms.jsx";
import { LOBBY_PLAYERS, LOBBY_CHAT } from "../../../constants/appData.js";

export default function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState(LOBBY_PLAYERS);
  const [messages, setMessages] = useState(LOBBY_CHAT);
  const [draft, setDraft] = useState("");

  const you = players.find((p) => p.isYou);
  const allReady = players.every((p) => p.ready);

  function toggleReady() {
    setPlayers((prev) => prev.map((p) => (p.isYou ? { ...p, ready: !p.ready } : p)));
  }

  function copyInvite() {
    navigator.clipboard?.writeText(`inksprint.ai/join/${roomCode}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { name: "quickpen", text: draft.trim() }]);
    setDraft("");
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
            {players.map((p) => (
              <div
                key={p.name}
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
            ))}
          </motion.div>

          <div className="mt-6 flex gap-3">
            <Button variant={you?.ready ? "ghost" : "primary"} onClick={toggleReady} className="flex-1 justify-center">
              {you?.ready ? "Not ready" : "I'm ready"}
            </Button>
            {you?.isHost && (
              <Button
                variant="primary"
                disabled={!allReady}
                onClick={() => navigate(`/game/${roomCode}`)}
                className="flex-1 justify-center disabled:opacity-40"
              >
                Start game
              </Button>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="flex h-[420px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Room chat</h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className="text-[13.5px]">
                <span className="font-semibold text-secondary">{m.name}: </span>
                <span className="text-white/[0.85]">{m.text}</span>
              </div>
            ))}
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
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary text-white"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
