import { motion } from "framer-motion";
import Button from "../../../components/common/Button.jsx";
import DrawingDemo from "../../../components/game/DrawingDemo.jsx";

const HERO_META = [
  { num: "0.8s", label: "avg. recognition time" },
  { num: "340+", label: "words in the model" },
  { num: "100%", label: "runs in your browser" },
];

export default function HeroSection() {
  return (
    <header className="px-8 pb-24 pt-40">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 md:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3.5 py-1.5 text-[13px] font-medium tracking-[0.02em] text-secondary">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success shadow-glow-success" />
            Live now — 4,281 players drawing
          </div>

          <h1 className="mb-3 text-[clamp(38px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]">
            Draw fast.
            <br />
            Think faster.
            <br />
            <span className="text-gradient">Beat the AI to it.</span>
          </h1>

          <p className="mb-8 max-w-[520px] text-[18px] leading-relaxed text-muted">
            InkSprint AI gives every player their own on-device model watching
            every stroke in real time. The first person whose drawing gets
            recognized wins the round — no waiting, no guessing, just pure
            reflex and creativity.
          </p>

          <div className="mb-12 flex flex-wrap gap-3.5">
            <Button as="a" href="/signup" variant="primary">
              Sign up →
            </Button>
            <Button as="a" href="#how" variant="ghost">
              See how it works
            </Button>
          </div>

          <div className="flex flex-wrap gap-12">
            {HERO_META.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="font-mono text-[22px] font-bold">{item.num}</span>
                <span className="text-[12.5px] text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 }}
        >
          <DrawingDemo />
        </motion.div>
      </div>
    </header>
  );
}
