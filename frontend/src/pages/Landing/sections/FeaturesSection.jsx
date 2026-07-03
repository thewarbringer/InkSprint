import { motion } from "framer-motion";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import { staggerContainer, fadeInUp } from "../../../animations/variants.js";
import { FEATURES } from "../../../constants/landingContent.js";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Why InkSprint"
          title="Built for speed, not spectating"
          description="Every part of the stack exists to shrink the gap between your pen and the moment the room finds out you won."
        />

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.05] p-8 transition-shadow hover:shadow-[0_16px_40px_rgba(108,99,255,0.18)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/[0.18] to-secondary/[0.12] text-secondary">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-[17px] font-semibold">{feature.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
