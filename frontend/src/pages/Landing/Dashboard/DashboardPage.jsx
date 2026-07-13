import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Flame, Clock, Sparkles, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../../components/layout/AppShell.jsx";
import { StatCard, Badge } from "../../../components/common/UIAtoms.jsx";
import { staggerContainer, fadeInUp } from "../../../animations/variants.js";
import { CURRENT_USER } from "../../../constants/appData.js";
import { fetchCurrentUser, getCurrentUser, setUserSession } from "../../../utils/auth.js";

const ICONS = { Target, Flame, Clock, Sparkles };

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser() || CURRENT_USER);
  // derive stats from currentUser (fallbacks kept for safety)
  const stats = [
    { label: "Games played", value: String(Array.isArray(currentUser.gamesHistory) ? currentUser.gamesHistory.length : (currentUser.gamesPlayed || currentUser.totalGames || 0)), icon: "Target" },
    (() => {
      const gamesPlayed = Array.isArray(currentUser.gamesHistory) ? currentUser.gamesHistory.length : (currentUser.gamesPlayed || currentUser.totalGames || 0);
      const wins = Array.isArray(currentUser.gamesHistory) ? currentUser.gamesHistory.filter(g => g.result === 'win').length : (typeof currentUser.wins === 'number' ? currentUser.wins : 0);
      const winRate = (typeof currentUser.winRate === 'number' && currentUser.winRate >= 0) ? currentUser.winRate : (gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0);
      return { label: "Win rate", value: `${winRate}%`, icon: "Flame" };
    })(),
    (() => {
      const raw = currentUser.avgRecognition || currentUser.avgRecognitionTime || null;
      const formatted = raw == null ? '—' : (typeof raw === 'number' ? `${raw}s` : String(raw));
      return { label: "Avg. recognition", value: formatted, icon: "Clock" };
    })(),
    { label: "Current streak", value: String(currentUser.currentStreak || '—'), icon: "Sparkles" },
  ];
  const visibleStats = stats;
  const recentGames = useMemo(() => {
    const games = Array.isArray(currentUser.gamesHistory) ? currentUser.gamesHistory : [];
    return games
      .slice()
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, 5)
      .map((game) => ({
        roomName: game.roomName || game.roomId || "Private room",
        roomId: game.roomId || "",
        result: game.result === "win" ? "win" : "loss",
        score: game.score ?? 0,
        playedAt: game.playedAt,
      }));
  }, [currentUser.gamesHistory]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const freshUser = await fetchCurrentUser();
      if (!isMounted) return;

      if (freshUser) {
        setCurrentUser(freshUser);
        setUserSession({ user: freshUser });
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppShell title={`Welcome back, ${currentUser.username}`} subtitle="Here's where you left off.">
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div variants={fadeInUp} initial="hidden" animate="show">
          <Link
            to="/play?tab=create"
            className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-br from-primary/[0.16] to-accent/[0.08] p-6 transition-transform hover:-translate-y-1"
          >
            <Sparkles className="mb-4 text-secondary" size={22} />
            <div>
              <div className="text-[16px] font-semibold">Create Game</div>
              <div className="text-[13px] text-muted">Set up a private room and invite players</div>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="show">
          <Link
            to="/play?tab=join"
            className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 transition-transform hover:-translate-y-1"
          >
            <Users2 className="mb-4 text-secondary" size={22} />
            <div>
              <div className="text-[16px] font-semibold">Join Game</div>
              <div className="text-[13px] text-muted">Jump into an existing room by code</div>
            </div>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Stats */}
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {visibleStats.map((s) => (
              <motion.div key={s.label} variants={fadeInUp}>
                <StatCard icon={ICONS[s.icon]} label={s.label} value={s.value} />
              </motion.div>
            ))}
          </motion.div>

          {/* Recent matches */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <h3 className="mb-4 text-[15px] font-semibold">Recent matches</h3>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {recentGames.length > 0 ? recentGames.map((m, i) => (
                <div key={`${m.roomName}-${i}`} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge tone={m.result === "win" ? "success" : "danger"}>
                      {m.result === "win" ? "WIN" : "LOSS"}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-mono text-[13.5px]">{m.roomName}</span>
                      {m.roomId ? <span className="text-[11px] text-muted">Room {m.roomId}</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-[12.5px] text-muted">
                    <Link to={`/results/${encodeURIComponent(m.roomId)}`} className="text-secondary hover:text-secondary/80">
                      View results
                    </Link>
                    <span>{m.score} pts</span>
                    <span>{new Date(m.playedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="py-3 text-[13px] text-muted">No games played yet.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
