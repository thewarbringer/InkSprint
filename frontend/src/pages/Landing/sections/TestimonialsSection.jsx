import { motion } from "framer-motion";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import { staggerContainer, fadeInUp } from "../../../animations/variants.js";
import { TESTIMONIALS } from "../../../constants/landingContent.js";

export default function TestimonialsSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading eyebrow="Players" title="What sprinters are saying" />

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-8"
            >
              <p className="mb-6 text-[15px] leading-relaxed text-[#DEDFF0]">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className={`h-[34px] w-[34px] rounded-full bg-gradient-to-br ${t.grad}`} />
                <div>
                  <div className="text-[13.5px] font-semibold">{t.name}</div>
                  <div className="text-[12px] text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
