import { isPredictionMatch } from "../../utils/predictions.js";

export default function PredictionPanel({ word, confidence, predictedWord, topPredictions, isHeld = false }) {
  const topThreePredictions = (topPredictions || []).slice(0, 3);
  const isTargetInTopThree = topThreePredictions.some((item) => isPredictionMatch(item?.label, word));
  const statusMessage = isHeld
    ? "You have drawn successfully, Waiting for round to over...."
    : isTargetInTopThree
      ? `yes !! you have drawn the ${word}`
      : `I think you are drawing ${topThreePredictions[1]?.label || 'unknown'}.`;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
      <div className="mb-1 text-[12px] text-muted">Target word</div>
      <div className="mb-4 font-mono text-[22px] font-bold tracking-wide">{word}</div>

      <div className="mb-4 rounded-xl border border-white/[0.08] bg-black/10 px-3 py-2 text-sm">
        <span className={isTargetInTopThree ? "text-emerald-300" : "text-amber-300"}>{statusMessage}</span>
      </div>

      <div className="mt-4">
        
        <div className="hidden mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
          Top 3 predictions
        </div>

        <div className="flex flex-wrap gap-2 hidden">
          {topThreePredictions.length > 0 ? (
            topThreePredictions.map((item) => (
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
