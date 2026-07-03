import ParticleField from "./ParticleField.jsx";
import useCursorGlow from "../../hooks/useCursorGlow.js";

export default function AnimatedBackground() {
  const glowRef = useCursorGlow();

  return (
    <>
      <ParticleField />

      {/* grid overlay, faded toward the edges */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, black 0%, transparent 75%)",
        }}
      />

      {/* soft glowing blobs */}
      <div className="pointer-events-none fixed -left-[100px] -top-[120px] z-0 h-[520px] w-[520px] animate-drift rounded-full bg-primary opacity-35 blur-[90px]" />
      <div className="pointer-events-none fixed -right-[140px] top-[20%] z-0 h-[420px] w-[420px] animate-drift rounded-full bg-secondary opacity-35 blur-[90px] [animation-delay:-7s]" />
      <div className="pointer-events-none fixed bottom-[-160px] left-[30%] z-0 h-[460px] w-[460px] animate-drift rounded-full bg-accent opacity-35 blur-[90px] [animation-delay:-14s]" />

      {/* cursor-following radial light */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-[1] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
        }}
      />

      {/* subtle noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  );
}
