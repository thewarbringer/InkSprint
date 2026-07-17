import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import AppShell from "../../components/layout/AppShell.jsx";
import { Avatar, ProgressBar, Badge, StatCard } from "../../components/common/UIAtoms.jsx";
import { staggerContainer, fadeInUp } from "../../animations/variants.js";
import { CURRENT_USER } from "../../constants/appData.js";
import { getUserSession, fetchCurrentUser, getUserToken, setUserSession } from "../../utils/auth.js";
import { useEffect, useState } from "react";
import { Target, Flame, Trophy, Heart } from "lucide-react";

export default function ProfilePage() {
  const sessionUser = getUserSession()?.user || null;
  const [user, setUser] = useState(sessionUser || CURRENT_USER);

  useEffect(() => {
    if (sessionUser) return; // already have it
    const token = getUserToken();
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const fetched = await fetchCurrentUser();
        if (!cancelled && fetched) {
          setUser(fetched);
          try {
            setUserSession({ user: fetched, token }, true);
          } catch (e) { }
        }
      } catch (err) {
        console.error('Failed to fetch current user for profile', err);
      }
    })();

    return () => { cancelled = true; };
  }, [sessionUser]);
  const userTag = user.tag || (user.totalGames === undefined ? "New member" : `${user.totalGames} games`);
  const matchHistory = useMemo(() => {
    const games = Array.isArray(user.gamesHistory) ? user.gamesHistory : [];
    return games
      .slice()
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, 10)
      .map((game) => ({
        roomName: game.roomName || game.roomId || "Private room",
        roomId: game.roomId || "",
        result: game.result === "win" ? "win" : game.result === "draw" ? "draw" : "loss",
        playedAt: game.playedAt,
      }));
  }, [user.gamesHistory]);
  const gamesPlayedCount = Array.isArray(user.gamesHistory) ? user.gamesHistory.length : (user.gamesPlayed || user.totalGames || 0);
  const winsCount = Array.isArray(user.gamesHistory) ? user.gamesHistory.filter(g => g.result === 'win').length : 0;
  const computedWinRate = typeof user.winRate === 'number' && user.winRate >= 0 ? user.winRate : (gamesPlayedCount ? Math.round((winsCount / gamesPlayedCount) * 100) : 0);
  const displayRank = user.rank || (user.rating ? `#${user.rating}` : '—');

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
            {/* Level and progress removed per request */}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Target} label="Games played" value={gamesPlayedCount} />
            <StatCard icon={Flame} label="Win rate" value={`${computedWinRate}%`} />
            <StatCard icon={Trophy} label="Rank" value={displayRank} />
            <StatCard icon={Heart} label="Favorite" value={user.favoriteCategory || 'All'} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Badges & achievements removed per request */}

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
            <h3 className="mb-4 text-[15px] font-semibold">Match history</h3>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {matchHistory.length > 0 ? matchHistory.map((m, i) => (
                <div key={`${m.roomName}-${i}`} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge tone={m.result === "win" ? "success" : m.result === "draw" ? "warning" : "danger"}>
                      {m.result === "win" ? "WIN" : m.result === "draw" ? "DRAW" : "LOSS"}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="font-mono text-[13.5px]">{m.roomName}</span>
                      {m.roomId ? <span className="text-[11px] text-muted">Room {m.roomId}</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/results/${encodeURIComponent(m.roomId)}`} className="text-[12px] text-secondary hover:text-secondary/80">
                      View results
                    </Link>
                    <span className="text-[12.5px] text-muted">{new Date(m.playedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="py-3 text-[13px] text-muted">No match history yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
