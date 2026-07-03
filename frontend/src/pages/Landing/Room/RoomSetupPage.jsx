import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, Users } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import { PUBLIC_ROOMS } from "../../../constants/appData.js";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const MODES = ["Classic", "Blitz", "Ranked"];
const PLAYER_COUNTS = [2, 4, 6, 8];

function Field({ label, children }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-[13.5px] font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-[8px] border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
            value === opt
              ? "border-primary/60 bg-primary/[0.18] text-white"
              : "border-white/[0.08] bg-white/[0.04] text-muted hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function RoomSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "join" ? "join" : "create");

  const [roomName, setRoomName] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [mode, setMode] = useState("Classic");
  const [players, setPlayers] = useState(6);
  const [isPrivate, setIsPrivate] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [joinCode, setJoinCode] = useState("");

  function handleCreate(e) {
    e.preventDefault();
    navigate(`/lobby/${(roomName || "SPRINT").slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`);
  }

  function handleJoin(e) {
    e.preventDefault();
    navigate(`/lobby/${joinCode || "SPRT-DEMO"}`);
  }

  return (
    <AppShell title="Play" subtitle="Create a custom room or join one already running.">
      <div className="mb-8 inline-flex rounded-[12px] border border-white/[0.08] bg-white/[0.04] p-1">
        <button
          onClick={() => setTab("create")}
          className={`rounded-[9px] px-5 py-2 text-[14px] font-medium transition-colors ${
            tab === "create" ? "bg-white/[0.09] text-white" : "text-muted"
          }`}
        >
          Create Room
        </button>
        <button
          onClick={() => setTab("join")}
          className={`rounded-[9px] px-5 py-2 text-[14px] font-medium transition-colors ${
            tab === "join" ? "bg-white/[0.09] text-white" : "text-muted"
          }`}
        >
          Join Room
        </button>
      </div>

      {tab === "create" ? (
        <motion.form
          onSubmit={handleCreate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[560px] rounded-2xl border border-white/[0.08] bg-white/[0.05] p-7"
        >
          <Field label="Room name">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Casual Fridays"
              className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 text-[14.5px] text-white placeholder:text-white/[0.25] focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </Field>

          <Field label="Difficulty">
            <PillGroup options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          </Field>

          <Field label="Game mode">
            <PillGroup options={MODES} value={mode} onChange={setMode} />
          </Field>

          <Field label="Max players">
            <PillGroup options={PLAYER_COUNTS} value={players} onChange={setPlayers} />
          </Field>

          <Field label={`Rounds — ${rounds}`}>
            <input
              type="range"
              min={3}
              max={10}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>

          <div className="mb-7 flex items-center justify-between rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <div>
              <div className="text-[14px] font-medium">Private room</div>
              <div className="text-[12px] text-muted">Only people with the code can join</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPrivate}
              onClick={() => setIsPrivate((v) => !v)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                isPrivate ? "bg-primary" : "bg-white/[0.12]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  isPrivate ? "translate-x-[22px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center">
            Create room →
          </Button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <form
            onSubmit={handleJoin}
            className="mb-8 flex max-w-[560px] flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-7 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Room code</label>
              <div className="relative">
                <Hash size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="SPRT-42A"
                  className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-3.5 font-mono text-[14.5px] text-white placeholder:text-white/[0.25] focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
            </div>
            <Button type="submit" variant="primary">Join →</Button>
          </form>

          <h3 className="mb-4 text-[15px] font-semibold">Public rooms</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PUBLIC_ROOMS.map((room) => (
              <div
                key={room.code}
                className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5"
              >
                <div>
                  <div className="text-[14.5px] font-semibold">{room.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-[12px] text-muted">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {room.players}
                    </span>
                    <span>{room.difficulty}</span>
                    <span>{room.mode}</span>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => navigate(`/lobby/${room.code}`)}>
                  Join
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AppShell>
  );
}
