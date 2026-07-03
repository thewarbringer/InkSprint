export default function PredictionPanel({ word, confidence }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="mb-1 text-[12px] text-muted">Draw this</div>
      <div className="mb-4 font-mono text-[22px] font-bold tracking-wide">{word}</div>

      <div className="mb-1.5 flex justify-between text-[12.5px] text-muted">
        <span>Your AI confidence</span>
        <span className="font-mono text-white">{Math.round(confidence)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-secondary to-success shadow-glow-success transition-[width] duration-150 ease-linear"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
