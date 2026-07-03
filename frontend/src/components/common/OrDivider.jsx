export default function OrDivider({ label = "or continue with" }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/[0.08]" />
      <span className="text-[12px] uppercase tracking-[0.05em] text-muted">{label}</span>
      <div className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}
