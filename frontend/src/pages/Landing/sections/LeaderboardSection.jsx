import { motion } from "framer-motion";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import GlassCard from "../../../components/common/GlassCard.jsx";
import { fadeInUp } from "../../../animations/variants.js";
import { LEADERBOARD } from "../../../constants/landingContent.js";

const RANK_COLOR = {
  1: "text-warning",
  2: "text-[#D9D9E3]",
  3: "text-[#E39C6B]",
};

export default function LeaderboardSection() {
  return (
    <section id="leaderboard" className="px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Season 4"
          title="Top of the leaderboard right now"
          description="Ranked purely by sprint wins and average recognition time."
        />

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <GlassCard className="overflow-hidden">
            {LEADERBOARD.map((player, i) => (
              <div
                key={player.name}
                className={`grid grid-cols-[36px_1fr_70px] items-center gap-3 px-6 py-4 transition-colors hover:bg-white/[0.03] sm:grid-cols-[50px_1fr_100px_100px] ${
                  i !== LEADERBOARD.length - 1 ? "border-b border-white/[0.08]" : ""
                }`}
              >
                <span
                  className={`font-mono text-[15px] font-bold text-muted ${
                    RANK_COLOR[player.rank] ?? ""
                  }`}
                >
                  {String(player.rank).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 flex-shrink-0 rounded-[10px] bg-gradient-to-br ${player.grad}`} />
                  <div>
                    <div className="text-[14.5px] font-semibold">{player.name}</div>
                    <div className="text-[12px] text-muted">{player.tier}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[14px]">{player.xp}</div>
                <div className="hidden text-right text-[13px] text-success sm:block">
                  {player.wr}
                </div>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
