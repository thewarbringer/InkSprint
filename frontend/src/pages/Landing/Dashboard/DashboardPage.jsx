import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Flame, Clock, Sparkles, Users2 } from "lucide-react";
import AppShell from "../../../components/layout/AppShell.jsx";
import { StatCard, Badge } from "../../../components/common/UIAtoms.jsx";
import { staggerContainer, fadeInUp } from "../../../animations/variants.js";
import { CURRENT_USER, DASHBOARD_STATS, RECENT_MATCHES } from "../../../constants/appData.js";
import { getCurrentUser } from "../../../utils/auth.js";

const ICONS = { Target, Flame, Clock, Sparkles };

export default function DashboardPage() {
  const currentUser = getCurrentUser() || CURRENT_USER;
  const visibleStats = (DASHBOARD_STATS || []).filter((s) => !["Avg recognition", "Current streak"].includes(s.label));

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

      </div>
    </AppShell>
  );
}
