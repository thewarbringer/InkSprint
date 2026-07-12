import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const MODEL_URL = "/models/quickdraw/inksprint_quickdraw_model/model.json";
const CATEGORIES_URL = "/models/quickdraw/inksprint_quickdraw_model/categories.json";
const PREDICTION_INTERVAL_MS = 1000;

function applyCentering(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, 28, 28);
  let cx = 0;
  let cy = 0;
  let totalMass = 0;

  for (let y = 0; y < 28; y += 1) {
    for (let x = 0; x < 28; x += 1) {
      const idx = (y * 28 + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 128) {
        const mass = brightness / 255;
        cx += x * mass;
        cy += y * mass;
        totalMass += mass;
      }
    }
  }

  if (totalMass === 0) return canvas;

  cx /= totalMass;
  cy /= totalMass;

  const offsetX = 14 - cx;
  const offsetY = 14 - cy;

  if (Math.abs(offsetX) < 0.25 && Math.abs(offsetY) < 0.25) {
    return canvas;
  }

  const newCanvas = document.createElement("canvas");
  newCanvas.width = 28;
  newCanvas.height = 28;
  const newCtx = newCanvas.getContext("2d");
  if (!newCtx) return canvas;

  newCtx.fillStyle = "#000000";
  newCtx.fillRect(0, 0, 28, 28);
  newCtx.drawImage(canvas, offsetX, offsetY);

  return newCanvas;
}

export default function useQuickDrawPrediction({ canvasRef, targetWord, active, previewCanvasRef }) {
  const [confidence, setConfidence] = useState(0);
  const [predictedWord, setPredictedWord] = useState("");
  const [topPredictions, setTopPredictions] = useState([]);
  const [modelReady, setModelReady] = useState(false);
  const modelRef = useRef(null);
  const categoriesRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const [model, categoriesResponse] = await Promise.all([
          tf.loadLayersModel(MODEL_URL),
          fetch(CATEGORIES_URL).then((res) => res.json()),
        ]);

        if (!cancelled) {
          modelRef.current = model;
          categoriesRef.current = categoriesResponse || [];
          setModelReady(true);
        }
      } catch (error) {
        console.error("Failed to load QuickDraw model", error);
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active || !canvasRef?.current) {
      return undefined;
    }

    const canvasHandle = canvasRef?.current;
    const canvas = canvasHandle && typeof canvasHandle.getContext === "function"
      ? canvasHandle
      : canvasHandle?.getCanvas?.();

    if (!canvas || typeof canvas.getContext !== "function") {
      return undefined;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const clearPreview = () => {
      const previewCanvas = previewCanvasRef?.current;
      if (!previewCanvas) return;
      const previewCtx = previewCanvas.getContext("2d");
      if (!previewCtx) return;
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.fillStyle = "#ffffff";
      previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    };

    const runPrediction = async () => {
      if (!canvas || !ctx) return;

      const { width, height } = canvas;
      if (!width || !height) return;

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const isThinStroke = false;

      if (data.every((value) => value === 255)) {
        clearPreview();
        return;
      }

      let minX = width;
      let maxX = -1;
      let minY = height;
      let maxY = -1;
      let totalDarkness = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < (isThinStroke ? 240 : 180)) {
          totalDarkness += 1 - brightness / 255;
          const pixelIndex = i / 4;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }

      if (minX > maxX || minY > maxY || totalDarkness < (isThinStroke ? 10 : 20)) {
        clearPreview();
        setConfidence(0);
        setPredictedWord("");
        setTopPredictions([]);
        return;
      }

      const padding = 3;
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropWidth = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
      const cropHeight = Math.min(height - cropY, maxY - minY + 1 + padding * 2);

      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;
      const croppedCtx = croppedCanvas.getContext("2d");
      if (!croppedCtx) return;

      croppedCtx.fillStyle = "#ffffff";
      croppedCtx.fillRect(0, 0, cropWidth, cropHeight);
      croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      let imgTensor = tf.browser.fromPixels(croppedCanvas, 3);
      const resized = tf.image.resizeNearestNeighbor(imgTensor, [28, 28]);
      imgTensor.dispose();

      const normalized = resized.div(tf.scalar(255));
      resized.dispose();

      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = 28;
      scaledCanvas.height = 28;
      const scaledCtx = scaledCanvas.getContext("2d");
      if (!scaledCtx) {
        normalized.dispose();
        return;
      }

      await tf.browser.toPixels(normalized, scaledCanvas);
      normalized.dispose();

      const scaledImageData = scaledCtx.getImageData(0, 0, 28, 28);
      const scaledData = scaledImageData.data;

      for (let i = 0; i < scaledData.length; i += 4) {
        const brightness = (scaledData[i] + scaledData[i + 1] + scaledData[i + 2]) / 3;
        const pixel = brightness < 160 ? 255 : 0;

        scaledData[i] = pixel;
        scaledData[i + 1] = pixel;
        scaledData[i + 2] = pixel;
        scaledData[i + 3] = 255;
      }

      scaledCtx.putImageData(scaledImageData, 0, 0);

      const centeredCanvas = applyCentering(scaledCanvas);
      const finalCtx = centeredCanvas.getContext("2d", { willReadFrequently: true });
      if (!finalCtx) return;

      const finalImageData = finalCtx.getImageData(0, 0, 28, 28);
      const finalData = finalImageData.data;
      const values = new Float32Array(28 * 28);
      let inkPixels = 0;

      const previewCanvas = previewCanvasRef?.current;
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext("2d");
        if (previewCtx) {
          previewCtx.setTransform(1, 0, 0, 1, 0, 0);
          previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
          previewCtx.fillStyle = "#ffffff";
          previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
          previewCtx.imageSmoothingEnabled = false;

          const previewScale = previewCanvas.width / 28;
          const pixelSize = Math.max(1, Math.floor(previewScale));
          for (let y = 0; y < 28; y += 1) {
            for (let x = 0; x < 28; x += 1) {
              const idx = (y * 28 + x) * 4;
              const brightness = (finalData[idx] + finalData[idx + 1] + finalData[idx + 2]) / 3;
              const normalizedValue = brightness / 255;

              if (normalizedValue > 0.82) {
                previewCtx.fillStyle = "#000000";
                previewCtx.fillRect(x * previewScale, y * previewScale, pixelSize, pixelSize);
              }
            }
          }
        }
      }

      for (let i = 0; i < finalData.length; i += 4) {
        const brightness = (finalData[i] + finalData[i + 1] + finalData[i + 2]) / 3;
        const normalized = brightness / 255;
        values[i / 4] = normalized;

        if (normalized > 0.5) {
          inkPixels += 1;
        }
      }

      if (inkPixels < 2) {
        clearPreview();
        setConfidence(0);
        setPredictedWord("");
        setTopPredictions([]);
        return;
      }

      const imageTensor = tf.tensor2d(values, [28, 28], "float32");
      const inputTensor = imageTensor.expandDims(0).expandDims(-1);
      const prediction = modelRef.current.predict(inputTensor);
      const probs = await prediction.data();

      let highestIndex = 0;
      let highestValue = probs[0] || 0;
      for (let i = 1; i < probs.length; i += 1) {
        if ((probs[i] || 0) > highestValue) {
          highestValue = probs[i] || 0;
          highestIndex = i;
        }
      }

      const label = categoriesRef.current[highestIndex] || "unknown";
      const rawConfidence = Math.max(0, Math.min(100, highestValue * 100));
      const targetMatchBonus = targetWord && label?.toLowerCase() === targetWord.toLowerCase() ? 12 : 0;
      const nextConfidence = Math.min(100, rawConfidence + targetMatchBonus);
      const rankedPredictions = categoriesRef.current
        .map((category, index) => ({
          label: category || "unknown",
          confidence: Math.max(0, Math.min(100, (probs[index] || 0) * 100)),
        }))
        .filter((item) => item.label && item.label !== "unknown")
        .sort((a, b) => b.confidence - a.confidence);

      setConfidence(nextConfidence);
      setPredictedWord(label);
      setTopPredictions(rankedPredictions);

      inputTensor.dispose();
      prediction.dispose();
      imageTensor.dispose();
    };

    const intervalId = window.setInterval(() => {
      void runPrediction();
    }, PREDICTION_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [active, canvasRef, targetWord, previewCanvasRef]);

  return {
    confidence,
    predictedWord,
    topPredictions,
    modelReady,
  };
}
