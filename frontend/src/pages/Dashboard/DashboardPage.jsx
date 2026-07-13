import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Flame, Clock, Sparkles, Zap, Users2 } from "lucide-react";
import { useMemo } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import { StatCard, Badge } from "../../components/common/UIAtoms.jsx";
import { staggerContainer, fadeInUp } from "../../animations/variants.js";
import {
  CURRENT_USER,
  DASHBOARD_STATS,
  FRIENDS,
  DAILY_CHALLENGE,
} from "../../constants/appData.js";
import { getUserSession } from "../../utils/auth.js";

const ICONS = { Target, Flame, Clock, Sparkles };

export default function DashboardPage() {
  const user = getUserSession()?.user || CURRENT_USER;
  const userTag = user.tag || (user.totalGames === undefined ? "New member" : `${user.totalGames} games`);
  const recentGames = useMemo(() => {
    const games = Array.isArray(user.gamesHistory) ? user.gamesHistory : [];
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
  }, [user.gamesHistory]);

  const stats = [
    // Games played derived from gamesHistory when available
    { label: "Games played", value: String(Array.isArray(user.gamesHistory) ? user.gamesHistory.length : (user.gamesPlayed || user.totalGames || 0)), icon: "Target" },
    // Win rate: use user.winRate if provided otherwise compute from gamesHistory
    (() => {
      const gamesPlayed = Array.isArray(user.gamesHistory) ? user.gamesHistory.length : (user.gamesPlayed || user.totalGames || 0);
      const wins = Array.isArray(user.gamesHistory) ? user.gamesHistory.filter(g => g.result === 'win').length : 0;
      const winRate = (typeof user.winRate === 'number' && user.winRate >= 0) ? user.winRate : (gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0);
      return { label: "Win rate", value: `${winRate}%`, icon: "Flame" };
    })(),
    // Avg recognition: prefer an explicit user field, otherwise show fallback
    (() => {
      const raw = user.avgRecognition || user.avgRecognitionTime || null;
      const formatted = raw == null ? '—' : (typeof raw === 'number' ? `${raw}s` : String(raw));
      return { label: "Avg. recognition", value: formatted, icon: "Clock" };
    })(),
    { label: "Current streak", value: String(user.currentStreak || '—'), icon: "Sparkles" },
  ];

  return (
    <AppShell title={`Welcome back, ${user.username}`} subtitle="Here's where you left off.">
      {/* Quick actions */}
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <motion.div variants={fadeInUp}>
          <Link
            to="/play"
            className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-br from-primary/[0.16] to-accent/[0.08] p-6 transition-transform hover:-translate-y-1"
          >
            <Zap className="mb-4 text-secondary" size={22} />
            <div>
              <div className="text-[16px] font-semibold">Quick Play</div>
              <div className="text-[13px] text-muted">Jump into a public room now</div>
            </div>
          </Link>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Link
            to="/play?tab=create"
            className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 transition-transform hover:-translate-y-1"
          >
            <Sparkles className="mb-4 text-secondary" size={22} />
            <div>
              <div className="text-[16px] font-semibold">Create Room</div>
              <div className="text-[13px] text-muted">Set up a custom private match</div>
            </div>
          </Link>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Link
            to="/play?tab=join"
            className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 transition-transform hover:-translate-y-1"
          >
            <Users2 className="mb-4 text-secondary" size={22} />
            <div>
              <div className="text-[16px] font-semibold">Join Room</div>
              <div className="text-[13px] text-muted">Enter a code or browse rooms</div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Stats */}
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((s) => (
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

        <div className="flex flex-col gap-6">
          {/* Profile card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={user.username} gradient={user.avatarGrad || 'from-secondary to-primary'} size={48} />
              <div>
                <div className="text-[15px] font-semibold">{user.username}</div>
                <div className="text-[12.5px] text-muted">{userTag} · Lv. {user.level || 1}</div>
              </div>
            </div>
            <div className="mb-1.5 flex justify-between text-[12px] text-muted">
              <span>XP</span>
              <span className="font-mono">{(user.xp || 0).toLocaleString()} / {(user.xpToNext || 30000).toLocaleString()}</span>
            </div>
            <ProgressBar value={user.xp || 0} max={user.xpToNext || 30000} />
          </div>

          {/* Daily challenge */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-accent/[0.14] to-secondary/[0.06] p-6">
            <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-secondary">
              Daily challenge
            </div>
            <div className="mb-4 text-[14.5px] font-medium">{DAILY_CHALLENGE.title}</div>
            <ProgressBar value={DAILY_CHALLENGE.progress} max={DAILY_CHALLENGE.target} gradient="from-accent to-secondary" />
            <div className="mt-2 flex justify-between text-[12px] text-muted">
              <span>{DAILY_CHALLENGE.progress}/{DAILY_CHALLENGE.target} rounds</span>
              <span>{DAILY_CHALLENGE.reward}</span>
            </div>
          </div>

          {/* Friends */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <h3 className="mb-4 text-[15px] font-semibold">Friends</h3>
            <div className="flex flex-col gap-3.5">
              {FRIENDS.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={f.name} size={32} />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg ${
                        f.status === "online" ? "bg-success" : "bg-white/[0.2]"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-medium">{f.name}</div>
                    <div className="text-[11.5px] text-muted">{f.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
