import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Crown } from "lucide-react";
import AppShell from "../../components/layout/AppShell.jsx";
import { Avatar } from "../../components/common/UIAtoms.jsx";
import { LEADERBOARD_FULL } from "../../constants/appData.js";

const FILTERS = ["Season 4", "All-time"];

export default function LeaderboardPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(FILTERS[0]);

  const filtered = useMemo(
    () => LEADERBOARD_FULL.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const podium = LEADERBOARD_FULL.slice(0, 3);
  const rest = filtered.filter((p) => p.rank > 3);

  return (
    <AppShell title="Leaderboard" subtitle="Ranked by sprint wins and average recognition time.">
      {/* Podium */}
      <div className="mb-8 grid grid-cols-3 items-end gap-3">
        {[podium[1], podium[0], podium[2]].map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`flex flex-col items-center rounded-2xl border p-5 text-center ${
              i === 1
                ? "border-warning/40 bg-warning/[0.08] pb-8 pt-7"
                : "border-white/[0.08] bg-white/[0.05]"
            }`}
          >
            {i === 1 && <Crown className="mb-1 text-warning" size={20} />}
            <Avatar name={p.name} gradient={p.grad} size={i === 1 ? 56 : 46} />
            <div className="mt-2 text-[13.5px] font-semibold">{p.name}</div>
            <div className="text-[11px] text-muted">{p.tier}</div>
          </motion.div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-[12px] border border-white/[0.08] bg-white/[0.04] p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[9px] px-4 py-1.5 text-[13.5px] font-medium transition-colors ${
                filter === f ? "bg-white/[0.09] text-white" : "text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players…"
            className="w-[220px] rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-3 text-[13.5px] text-white placeholder:text-white/[0.25] focus:border-primary/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.05]">
        {(query ? filtered : rest).map((p, i, arr) => (
          <div
            key={p.name}
            className={`grid grid-cols-[40px_1fr_90px_90px] items-center gap-3 px-6 py-4 transition-colors hover:bg-white/[0.03] ${
              i !== arr.length - 1 ? "border-b border-white/[0.08]" : ""
            }`}
          >
            <span className="font-mono text-[14px] font-bold text-muted">
              {String(p.rank).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-3">
              <Avatar name={p.name} gradient={p.grad} size={34} />
              <div>
                <div className="text-[14px] font-semibold">{p.name}</div>
                <div className="text-[11.5px] text-muted">{p.tier}</div>
              </div>
            </div>
            <div className="text-right text-[12.5px] text-success">{p.wr}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
