import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { STATS } from "../../../constants/landingContent.js";
import useCountUp from "../../../hooks/useCountUp.js";

function StatItem({ label, target, isLast }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const value = useCountUp(target, isInView);

  return (
    <div
      ref={ref}
      className={`border-white/[0.08] px-6 py-8 text-center sm:border-r ${
        isLast ? "sm:border-r-0" : ""
      }`}
    >
      <div className="bg-gradient-to-br from-secondary to-primary bg-clip-text font-mono text-[clamp(26px,3vw,36px)] font-bold text-transparent">
        {value.toLocaleString()}
      </div>
      <div className="mt-1.5 text-[13px] text-muted">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="mx-auto grid max-w-[1200px] grid-cols-2 rounded-[18px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-md md:grid-cols-4"
      >
        {STATS.map((stat, i) => (
          <StatItem
            key={stat.label}
            label={stat.label}
            target={stat.target}
            isLast={i === STATS.length - 1}
          />
        ))}
      </motion.div>
    </section>
  );
}
