import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "../common/Button.jsx";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-bg/55 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-[18px]">
        <div className="flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.01em]">
          <div className="relative h-[30px] w-[30px] rounded-[9px] bg-gradient-to-br from-primary to-secondary shadow-glow">
            <div className="absolute inset-[7px] rounded-[4px] bg-bg" />
          </div>
          InkSprint AI
        </div>

        <div className="hidden gap-9 text-[14.5px] text-muted md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button as="a" href="#" variant="ghost">
            Log in
          </Button>
          <Button as="a" href="#" variant="primary">
            Play free
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
