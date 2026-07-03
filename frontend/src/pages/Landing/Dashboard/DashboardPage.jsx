import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Flame, Clock, Sparkles, Zap, Users2 } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import { StatCard, ProgressBar, Avatar, Badge } from "../../../components/common/UIAtoms.jsx";
import { staggerContainer, fadeInUp } from "../../../animations/variants.js";
import { CURRENT_USER, DASHBOARD_STATS, RECENT_MATCHES, FRIENDS, DAILY_CHALLENGE } from "../../../constants/appData.js";
import { getCurrentUser } from "../../../utils/auth.js";

const ICONS = { Target, Flame, Clock, Sparkles };

export default function DashboardPage() {
  const currentUser = getCurrentUser() || CURRENT_USER;

  return (
    <AppShell title={`Welcome back, ${currentUser.username}`} subtitle="Here's where you left off.">
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
            {DASHBOARD_STATS.map((s) => (
              <motion.div key={s.label} variants={fadeInUp}>
                <StatCard icon={ICONS[s.icon]} label={s.label} value={s.value} />
              </motion.div>
            ))}
          </motion.div>

          {/* Recent matches */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <h3 className="mb-4 text-[15px] font-semibold">Recent matches</h3>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {RECENT_MATCHES.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge tone={m.result === "win" ? "success" : "danger"}>
                      {m.result === "win" ? "WIN" : "LOSS"}
                    </Badge>
                    <span className="font-mono text-[13.5px]">{m.word}</span>
                  </div>
                  <div className="flex items-center gap-5 text-[12.5px] text-muted">
                    <span>{m.time}</span>
                    <span className="text-success">{m.xp}</span>
                    <span>{m.ago}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Profile card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={CURRENT_USER.username} gradient={CURRENT_USER.avatarGrad} size={48} />
              <div>
                <div className="text-[15px] font-semibold">{CURRENT_USER.username}</div>
                <div className="text-[12.5px] text-muted">{CURRENT_USER.tag} · Lv. {CURRENT_USER.level}</div>
              </div>
            </div>
            <div className="mb-1.5 flex justify-between text-[12px] text-muted">
              <span>XP</span>
              <span className="font-mono">{CURRENT_USER.xp.toLocaleString()} / {CURRENT_USER.xpToNext.toLocaleString()}</span>
            </div>
            <ProgressBar value={CURRENT_USER.xp} max={CURRENT_USER.xpToNext} />
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
