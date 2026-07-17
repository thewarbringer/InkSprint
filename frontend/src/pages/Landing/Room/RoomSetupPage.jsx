import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, Users } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import Button from "../../../components/common/Button.jsx";
import { PUBLIC_ROOMS } from "../../../constants/appData.js";
import { getCurrentUser, getUserToken } from "../../../utils/auth.js";

const PLAYER_COUNTS = [2, 4, 6];
const MIN_PLAYERS_TO_START = 2;
const MAX_PLAYERS_PER_ROOM = 6;

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
  const [players, setPlayers] = useState(6);
  const [isPrivate, setIsPrivate] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [joinCode, setJoinCode] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  const token = getUserToken();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (tab === "join") {
      fetchAvailableGames();
    }
  }, [tab]);

  async function fetchAvailableGames() {
    setIsLoadingGames(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/active-game/available`
      );
      const result = await response.json();
      if (response.ok) {
        setAvailableGames(result.games || []);
      } else {
        console.error('Failed to fetch available games');
        setAvailableGames([]);
      }
    } catch (err) {
      console.error('Error fetching available games:', err);
      setAvailableGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitError(null);

    if (players < MIN_PLAYERS_TO_START) {
      setSubmitError(`Select at least ${MIN_PLAYERS_TO_START} players to create a room.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/active-game/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomName,
          maxPlayers: players,
          rounds,
          privateRoom: isPrivate ? 'yes' : 'no',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to create the room.');
      }

      navigate(`/lobby/${result.game.roomId}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function joinRoom(roomId) {
    if (!token) {
      setSubmitError('You must be logged in to join a room.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/active-game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to join room.');
      }

      navigate(`/lobby/${roomId}`);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode?.trim()) {
      setSubmitError('Please enter a room code to join.');
      return;
    }
    await joinRoom(joinCode.trim().toUpperCase());
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

          <Field label="Max players">
            <PillGroup options={PLAYER_COUNTS} value={players} onChange={setPlayers} />
            <p className="mt-2 text-[12px] text-muted">Supports up to {MAX_PLAYERS_PER_ROOM} players, and the room requires at least {MIN_PLAYERS_TO_START} players before the game can start.</p>
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

          {submitError && (
            <p className="mb-4 text-[13.5px] text-danger">{submitError}</p>
          )}
          <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
            {isSubmitting ? 'Creating room…' : 'Create room →'}
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

          <h3 className="mb-4 text-[15px] font-semibold">Available Games</h3>
          {isLoadingGames ? (
            <div className="text-[14px] text-muted">Loading available games...</div>
          ) : availableGames.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {availableGames.map((game) => (
                <div
                  key={game.roomId}
                  className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5"
                >
                  <div>
                    <div className="text-[14.5px] font-semibold">{game.roomName}</div>
                    <div className="mt-1 flex items-center gap-3 text-[12px] text-muted">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {game.players?.length || 0}/{game.maxPlayers}
                      </span>
                      <span>{game.rounds} rounds</span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => joinRoom(game.roomId)}>
                    Join
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[14px] text-muted">No games available at the moment. Create one or try again later.</div>
          )}
        </motion.div>
      )}
    </AppShell>
  );
}
