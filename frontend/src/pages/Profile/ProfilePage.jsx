import { motion } from "framer-motion";
import { Award } from "lucide-react";
import AppShell from "../../components/layout/AppShell.jsx";
import { Avatar, ProgressBar, Badge, StatCard } from "../../components/common/UIAtoms.jsx";
import { staggerContainer, fadeInUp } from "../../animations/variants.js";
import { CURRENT_USER, PROFILE_BADGES, PROFILE_HISTORY } from "../../constants/appData.js";
import { getUserSession } from "../../utils/auth.js";
import { Target, Flame, Trophy, Heart } from "lucide-react";

export default function ProfilePage() {
  const user = getUserSession()?.user || CURRENT_USER;
  const userTag = user.tag || (user.totalGames === undefined ? "New member" : `${user.totalGames} games`);
  return (
    <AppShell title="Profile" subtitle="Your stats, badges, and match history.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 text-center">
            <Avatar name={user.username} gradient={user.avatarGrad || 'from-secondary to-primary'} size={80} />
            <div className="mx-auto mt-4 mb-1 flex justify-center text-[19px] font-bold">
              {user.username}
            </div>
            <Badge tone="success">{userTag}</Badge>
            <p className="mx-auto mt-4 max-w-[240px] text-[13px] leading-relaxed text-muted">
              Speed-drawing enthusiast. Favorite category: {user.favoriteCategory || 'All'}.
            </p>
            <div className="mt-5 text-left">
              <div className="mb-1.5 flex justify-between text-[12px] text-muted">
                <span>Level {user.level || 1}</span>
                <span className="font-mono">{(user.xp || 0).toLocaleString()} / {(user.xpToNext || 30000).toLocaleString()}</span>
              </div>
              <ProgressBar value={user.xp || 0} max={user.xpToNext || 30000} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Target} label="Games played" value={user.gamesPlayed || user.totalGames || 0} />
            <StatCard icon={Flame} label="Win rate" value={`${user.winRate || 0}%`} />
            <StatCard icon={Trophy} label="Rank" value="#2" />
            <StatCard icon={Heart} label="Favorite" value={user.favoriteCategory || 'All'} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <h3 className="mb-4 text-[15px] font-semibold">Badges &amp; achievements</h3>
            <motion.div
              variants={staggerContainer(0.05)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {PROFILE_BADGES.map((b) => (
                <motion.div
                  key={b.title}
                  variants={fadeInUp}
                  className={`rounded-[14px] border p-4 text-center ${
                    b.earned
                      ? "border-warning/30 bg-warning/[0.08]"
                      : "border-white/[0.06] bg-white/[0.02] opacity-50"
                  }`}
                >
                  <Award className={`mx-auto mb-2 ${b.earned ? "text-warning" : "text-muted"}`} size={22} />
                  <div className="text-[13px] font-semibold">{b.title}</div>
                  <div className="mt-1 text-[11px] text-muted">{b.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <h3 className="mb-4 text-[15px] font-semibold">Match history</h3>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {PROFILE_HISTORY.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge tone={m.result === "win" ? "success" : "danger"}>
                      {m.result === "win" ? "WIN" : "LOSS"}
                    </Badge>
                    <span className="font-mono text-[13.5px]">{m.word}</span>
                  </div>
                  <span className="text-[12.5px] text-muted">{m.ago}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
