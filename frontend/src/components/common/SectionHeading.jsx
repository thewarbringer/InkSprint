import { motion } from "framer-motion";
import { fadeInUp } from "../../animations/variants.js";

export default function SectionHeading({ eyebrow, title, description, className = "" }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className={`mx-auto mb-12 max-w-[640px] text-center ${className}`}
    >
      {eyebrow && (
        <div className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-secondary">
          {eyebrow}
        </div>
      )}
      <h2 className="mb-3.5 text-[clamp(28px,3.4vw,40px)] font-bold tracking-[-0.02em]">
        {title}
      </h2>
      {description && (
        <p className="text-[16px] leading-relaxed text-muted">{description}</p>
      )}
    </motion.div>
  );
}
