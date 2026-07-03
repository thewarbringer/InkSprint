import { motion } from "framer-motion";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import { staggerContainer, fadeInUp } from "../../../animations/variants.js";
import { STEPS } from "../../../constants/landingContent.js";

export default function HowItWorksSection() {
  return (
    <section id="how" className="px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="The loop"
          title="Three steps. Every round."
          description="No hidden judging, no waiting on other players — the round ends the instant one AI is convinced."
        />

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent md:block" />

          {STEPS.map((step) => (
            <motion.div key={step.num} variants={fadeInUp} className="relative text-center">
              <div className="relative z-[2] mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[18px] border border-white/[0.08] bg-gradient-to-br from-primary/[0.15] to-secondary/[0.08] font-mono text-[22px] font-semibold">
                {step.num}
              </div>
              <h3 className="mb-2 text-[17px] font-semibold">{step.title}</h3>
              <p className="mx-auto max-w-[280px] text-[14.5px] leading-relaxed text-muted">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
