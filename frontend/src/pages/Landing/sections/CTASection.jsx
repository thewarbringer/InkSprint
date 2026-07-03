import { motion } from "framer-motion";
import Button from "../../../components/common/Button.jsx";
import { fadeInUp } from "../../../animations/variants.js";

export default function CTASection() {
  return (
    <section className="px-8 py-24">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="mx-auto max-w-[1200px] rounded-3xl border border-white/[0.08] bg-gradient-to-br from-primary/[0.12] to-secondary/[0.06] px-8 py-16 text-center"
      >
        <h2 className="mb-3.5 text-[clamp(26px,3.4vw,38px)] font-bold tracking-[-0.02em]">
          Your first sprint is one click away.
        </h2>
        <p className="mb-8 text-muted">
          No install, no download — the model loads in your browser in seconds.
        </p>
        <Button as="a" href="#" variant="primary">
          Start a sprint →
        </Button>
      </motion.div>
    </section>
  );
}
