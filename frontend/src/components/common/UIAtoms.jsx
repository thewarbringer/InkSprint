import { motion } from "framer-motion";

export function Avatar({ name, gradient = "from-primary to-secondary", size = 40 }) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

export function ProgressBar({ value, max = 100, gradient = "from-secondary to-success" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
      />
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="text-[14.5px] text-white">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-white/[0.12]"
        }`}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"
        />
      </button>
    </label>
  );
}

export function Badge({ children, tone = "muted" }) {
  const tones = {
    muted: "bg-white/[0.06] text-muted border-white/[0.08]",
    success: "bg-success/[0.12] text-success border-success/[0.25]",
    danger: "bg-danger/[0.12] text-danger border-danger/[0.25]",
    warning: "bg-warning/[0.12] text-warning border-warning/[0.25]",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/[0.06] text-secondary">
        <Icon size={16} />
      </div>
      <div className="text-[22px] font-bold font-mono">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-muted">{label}</div>
    </div>
  );
}
