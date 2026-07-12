export default function PredictionPanel({ word, confidence, predictedWord, topPredictions }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="mb-1 text-[12px] text-muted">Target word</div>
      <div className="mb-4 font-mono text-[22px] font-bold tracking-wide">{word}</div>

      <div className="mb-2 flex justify-between text-[12.5px] text-muted">
        <span>AI confidence on target word</span>
        <span className="font-mono text-white">{Math.round(confidence)}%</span>
      </div>
      <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-secondary to-success shadow-glow-success transition-[width] duration-150 ease-linear"
          style={{ width: `${confidence}%` }}
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
          Top 5 predictions
        </div>
    
        <div className="flex flex-wrap gap-2">
          {topPredictions && topPredictions.length > 0 ? (
            topPredictions.slice(0, 5).map((item) => (
              <div key={item.label} className="flex min-w-[110px] items-center justify-between rounded-xl bg-black/10 px-3 py-2 text-sm">
                <span className="mr-2 capitalize text-white/90">{item.label}</span>
                <span className="font-mono text-cyan-300">{Math.round(item.confidence)}%</span>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-black/10 px-3 py-2 text-sm text-white/60">
              {predictedWord ? "Waiting for more confidence" : "Draw something to see predictions"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
