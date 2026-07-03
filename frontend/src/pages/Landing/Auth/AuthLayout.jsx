import { motion } from "framer-motion";
import { Zap, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedBackground from "../../../components/common/AnimatedBackground.jsx";

const HIGHLIGHTS = [
  { icon: Zap, text: "Recognition running live in your browser" },
  { icon: Users, text: "Real rooms, real opponents, every round" },
  { icon: Trophy, text: "Ranked seasons that actually reset" },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatedBackground />

      <div className="relative z-[3] mx-auto grid min-h-screen max-w-[1200px] grid-cols-1 items-center gap-12 px-8 py-16 md:grid-cols-2">
        {/* Branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="hidden md:block"
        >
          <Link to="/" className="mb-10 flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.01em]">
            <div className="relative h-[30px] w-[30px] rounded-[9px] bg-gradient-to-br from-primary to-secondary shadow-glow">
              <div className="absolute inset-[7px] rounded-[4px] bg-bg" />
            </div>
            InkSprint AI
          </Link>

          <h1 className="mb-4 max-w-[380px] text-[clamp(30px,3.4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em]">
            Where creativity meets{" "}
            <span className="text-gradient">artificial intelligence.</span>
          </h1>
          <p className="mb-10 max-w-[380px] text-[15px] leading-relaxed text-muted">
            Sign in to jump back into a room, or create an account to start
            your first sprint.
          </p>

          <div className="flex flex-col gap-4">
            {HIGHLIGHTS.map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.05] text-secondary">
                  <item.icon size={16} />
                </div>
                <span className="text-[14px] text-muted">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
          className="mx-auto w-full max-w-[400px]"
        >
          <Link
            to="/"
            className="mb-8 flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.01em] md:hidden"
          >
            <div className="relative h-[26px] w-[26px] rounded-[8px] bg-gradient-to-br from-primary to-secondary shadow-glow">
              <div className="absolute inset-[6px] rounded-[3px] bg-bg" />
            </div>
            InkSprint AI
          </Link>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-8 backdrop-blur-xl">
            <h2 className="mb-1.5 text-[24px] font-bold tracking-[-0.01em]">{title}</h2>
            <p className="mb-7 text-[14px] text-muted">{subtitle}</p>
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-[13.5px] text-muted">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
