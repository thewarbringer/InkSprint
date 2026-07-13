export function normalizePredictionLabel(value) {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function isPredictionMatch(predictionLabel, targetWord) {
  const normalizedPrediction = normalizePredictionLabel(predictionLabel);
  const normalizedTarget = normalizePredictionLabel(targetWord);

  if (!normalizedPrediction || !normalizedTarget) {
    return false;
  }

  if (normalizedPrediction === normalizedTarget) {
    return true;
  }

  const stopWords = new Set(["the", "a", "an"]);
  const predictionTokens = normalizedPrediction
    .split(" ")
    .filter(Boolean)
    .filter((token) => !stopWords.has(token));
  const targetTokens = normalizedTarget
    .split(" ")
    .filter(Boolean)
    .filter((token) => !stopWords.has(token));

  return predictionTokens.join("") === targetTokens.join("");
}
