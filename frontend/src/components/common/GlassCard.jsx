export default function GlassCard({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
