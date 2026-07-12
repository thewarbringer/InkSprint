import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import GlassCard from "../../components/common/GlassCard.jsx";

const CANVAS_SIZE = 400;
const MODEL_URL = "/models/quickdraw/inksprint_quickdraw_model/model.json";
const CATEGORIES_URL = "/models/quickdraw/inksprint_quickdraw_model/categories.json";
const PREDICTION_INTERVAL_MS = 200;

function getBrightness(r, g, b) {
  return (r + g + b) / 3;
}

// Step 4: Apply center-of-mass alignment (crucial for DoodleNet)
function applyCentering(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, 28, 28);
  let cx = 0,
    cy = 0,
    totalMass = 0;

  // Calculate center of mass (white pixels are the strokes)
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const idx = (y * 28 + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const brightness = (r + g + b) / 3;
      
      // White pixels (high brightness) are the strokes
      if (brightness > 128) {
        const mass = brightness / 255; // Weight by brightness
        cx += x * mass;
        cy += y * mass;
        totalMass += mass;
      }
    }
  }

  if (totalMass === 0) return canvas;

  // Center of mass
  cx /= totalMass;
  cy /= totalMass;

  // Calculate offset to center (target center is 14, 14)
  const offsetX = 14 - cx;
  const offsetY = 14 - cy;

  // If already well-centered, return original
  if (Math.abs(offsetX) < 0.25 && Math.abs(offsetY) < 0.25) {
    return canvas;
  }

  // Create new canvas with black background
  const newCanvas = document.createElement("canvas");
  newCanvas.width = 28;
  newCanvas.height = 28;
  const newCtx = newCanvas.getContext("2d");
  if (!newCtx) return canvas;

  // Fill with BLACK background (0.0 in normalized space)
  newCtx.fillStyle = "#000000";
  newCtx.fillRect(0, 0, 28, 28);
  
  // Draw shifted image
  newCtx.drawImage(canvas, offsetX, offsetY);

  return newCanvas;
}

export default function TrialPage() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const lastPointRef = useRef(null);
  const modelRef = useRef(null);
  const categoriesRef = useRef([]);
  const normalizedPreviewCanvasRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [predictedWord, setPredictedWord] = useState("");
  const [topPredictions, setTopPredictions] = useState([]);
  const [modelReady, setModelReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading model...");
  const [canvasSize, setCanvasSize] = useState(400);
  const [strokeSize, setStrokeSize] = useState(16);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const [model, categoriesResponse] = await Promise.all([
          tf.loadLayersModel(MODEL_URL),
          fetch(CATEGORIES_URL).then((response) => response.json()),
        ]);

        if (!cancelled) {
          modelRef.current = model;
          categoriesRef.current = Array.isArray(categoriesResponse) ? categoriesResponse : [];
          setModelReady(true);
          setStatusMessage("Model ready");
        }
      } catch (error) {
        console.error("Failed to load pretrained QuickDraw model", error);
        if (!cancelled) {
          setModelReady(false);
          setStatusMessage("Model failed to load");
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(canvasSize * dpr);
    canvas.height = Math.round(canvasSize * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = strokeSize;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const previewCanvas = normalizedPreviewCanvasRef.current;
    if (previewCanvas) {
      const previewCtx = previewCanvas.getContext("2d");
      if (previewCtx) {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.fillStyle = "#ffffff";
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      }
    }

    setIsEmpty(true);
    setConfidence(0);
    setPredictedWord("");
    setTopPredictions([]);
  };

  useEffect(() => {
    resetCanvas();
  }, [canvasSize, strokeSize]);

  function getPoint(event) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function beginStroke(event) {
    if (event.button !== 0) return;
    event.preventDefault();

    const point = getPoint(event);
    if (!point) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.lineWidth = strokeSize;
    isDrawingRef.current = true;
    activePointerIdRef.current = event.pointerId;
    lastPointRef.current = point;
    setIsEmpty(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drawStroke(event) {
    if (!isDrawingRef.current || event.pointerId !== activePointerIdRef.current) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const prevPoint = lastPointRef.current;
    if (!canvas || !ctx || !prevPoint) return;

    const point = getPoint(event);
    if (!point) return;

    // Draw on canvas
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  }

  function endStroke(event) {
    if (event?.pointerId !== undefined && event.pointerId !== activePointerIdRef.current) return;
    isDrawingRef.current = false;
    activePointerIdRef.current = null;
    lastPointRef.current = null;
  }

  useEffect(() => {
    if (!modelReady || !modelRef.current || categoriesRef.current.length === 0) {
      return undefined;
    }

    let cancelled = false;

    const classifyCanvas = async () => {
      if (!canvasRef.current || !modelRef.current) {
        return;
      }

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Get raw pixel data from user's canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Step 1: Find bounding box of drawn strokes.
        const isThinStroke = strokeSize <= 24;
        let minX = canvas.width,
          maxX = -1;
        let minY = canvas.height,
          maxY = -1;
        let totalDarkness = 0;

        for (let i = 0; i < data.length; i += 4) {
          const brightness = getBrightness(data[i], data[i + 1], data[i + 2]);

          if (brightness < (isThinStroke ? 240 : 180)) {
            totalDarkness += 1 - brightness / 255;
            const pixelIndex = i / 4;
            const x = pixelIndex % canvas.width;
            const y = Math.floor(pixelIndex / canvas.width);

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }

        // Check if canvas has enough strokes
        if (minX > maxX || minY > maxY || totalDarkness < (isThinStroke ? 10 : 20)) {
          if (!cancelled) {
            setConfidence(0);
            setPredictedWord("");
            setTopPredictions([]);
          }
          return;
        }

        // Step 2: Crop to the bounding box with a small 3px padding.
        const padding = 3;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropWidth = Math.max(1, maxX - minX + 1 + padding * 2);
        const cropHeight = Math.max(1, maxY - minY + 1 + padding * 2);

        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext("2d");
        if (!croppedCtx) return;

        croppedCtx.fillStyle = "#ffffff";
        croppedCtx.fillRect(0, 0, cropWidth, cropHeight);
        croppedCtx.drawImage(
          canvas,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        // Step 3: Scale to 28x28 using TensorFlow while preserving crisp edges.
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

        // Step 4: Apply a simple binary threshold to keep the input clean.
        const scaledImageData = scaledCtx.getImageData(0, 0, 28, 28);
        const scaledData = scaledImageData.data;
        for (let i = 0; i < scaledData.length; i += 4) {
          const brightness = getBrightness(scaledData[i], scaledData[i + 1], scaledData[i + 2]);
          const pixel = brightness < 160 ? 255 : 0;
          scaledData[i] = pixel;
          scaledData[i + 1] = pixel;
          scaledData[i + 2] = pixel;
          scaledData[i + 3] = 255;
        }
        scaledCtx.putImageData(scaledImageData, 0, 0);

        // Step 5: Center the drawing
        const centeredCanvas = applyCentering(scaledCanvas);

        // Step 6: Extract normalized pixel values
        const finalCtx = centeredCanvas.getContext("2d", { willReadFrequently: true });
        if (!finalCtx) return;

        const finalImageData = finalCtx.getImageData(0, 0, 28, 28);
        const finalData = finalImageData.data;

        const previewCanvas = normalizedPreviewCanvasRef.current;
        if (previewCanvas) {
          const previewCtx = previewCanvas.getContext("2d");
          if (previewCtx) {
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            previewCtx.imageSmoothingEnabled = false;
            previewCtx.fillStyle = "#000000";
            previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

            const previewScale = previewCanvas.width / 28;
            const pixelSize = Math.max(1, Math.floor(previewScale / 2));
            for (let y = 0; y < 28; y += 1) {
              for (let x = 0; x < 28; x += 1) {
                const idx = (y * 28 + x) * 4;
                const brightness = (finalData[idx] + finalData[idx + 1] + finalData[idx + 2]) / 3;
                const normalizedValue = brightness / 255;

                if (normalizedValue > 0.82) {
                  previewCtx.fillStyle = "#ffffff";
                  previewCtx.fillRect(x * previewScale, y * previewScale, pixelSize, pixelSize);
                }
              }
            }
          }
        }
        let inkPixels = 0;
        const values = new Float32Array(28 * 28);

        for (let i = 0; i < finalData.length; i += 4) {
          const brightness = (finalData[i] + finalData[i + 1] + finalData[i + 2]) / 3;
          // Normalize to 0-1: white strokes = 1, black background = 0
          const normalized = brightness / 255;
          values[i / 4] = normalized;

          if (normalized > 0.5) {
            inkPixels += 1;
          }
        }

        // Require minimum ink
        if (inkPixels < 2) {
          if (!cancelled) {
            setConfidence(0);
            setPredictedWord("");
            setTopPredictions([]);
          }
          return;
        }

        // Create tensor and predict
        const imageTensor = tf.tensor2d(values, [28, 28], "float32");
        const inputTensor = imageTensor.expandDims(0).expandDims(-1); // [1, 28, 28, 1]

        // DEBUG: Uncomment to visualize the 28x28 input
        // centeredCanvas.style.position = "fixed";
        // centeredCanvas.style.bottom = "10px";
        // centeredCanvas.style.right = "10px";
        // centeredCanvas.style.width = "200px";
        // centeredCanvas.style.height = "200px";
        // centeredCanvas.style.border = "2px solid cyan";
        // centeredCanvas.style.zIndex = "9999";
        // document.body.appendChild(centeredCanvas);

        const prediction = modelRef.current.predict(inputTensor);
        const probs = await prediction.data();

        // Find best prediction
        let bestIndex = 0;
        let bestProbability = probs[0] || 0;

        for (let index = 1; index < probs.length; index += 1) {
          if ((probs[index] || 0) > bestProbability) {
            bestProbability = probs[index] || 0;
            bestIndex = index;
          }
        }

        // Rank predictions
        const ranked = categoriesRef.current
          .map((category, index) => ({
            label: category || "unknown",
            confidence: Math.max(0, Math.min(100, (probs[index] || 0) * 100)),
          }))
          .filter((item) => item.label && item.label !== "unknown")
          .sort((left, right) => right.confidence - left.confidence)
          .slice(0, 10);

        if (!cancelled) {
          const label = categoriesRef.current[bestIndex] || "unknown";
          setPredictedWord(label);
          setConfidence(Math.max(0, Math.min(100, bestProbability * 100)));
          setTopPredictions(ranked);
        }

        // Cleanup
        tf.dispose([imageTensor, inputTensor, prediction]);
      } catch (error) {
        console.error("Classification error:", error);
      }
    };

    const intervalId = window.setInterval(() => {
      void classifyCanvas();
    }, PREDICTION_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [modelReady, strokeSize, canvasSize]);

  function clearCanvas() {
    resetCanvas();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(51,214,255,0.15),_transparent_45%),linear-gradient(135deg,_#030816_0%,_#070d20_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.1]"
        >
          <ArrowLeft size={16} />
          Back home
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-cyan-300">Quick trial</p>
                <h1 className="text-3xl font-semibold">Draw and let the model guess</h1>
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.1]"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>

            <p className="mb-5 max-w-2xl text-sm text-white/70">
              Sketch a simple object on the canvas. The pretrained QuickDraw model will analyze your strokes and show the strongest prediction.
            </p>

            <div className="mb-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-black/10 p-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-white/75">
                <span>Canvas size: {canvasSize}px</span>
                <input
                  type="range"
                  min="250"
                  max="600"
                  step="50"
                  value={canvasSize}
                  onChange={(event) => setCanvasSize(Number(event.target.value))}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/75">
                <span>Stroke size: {strokeSize}px</span>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="2"
                  value={strokeSize}
                  onChange={(event) => setStrokeSize(Number(event.target.value))}
                  className="accent-cyan-400"
                />
              </label>
            </div>


            <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#f7f8fc] p-3 shadow-2xl shadow-black/20">
              {isEmpty && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-black/30">
                  Start drawing here
                </div>
              )}
              <canvas
                ref={canvasRef}
                onPointerDown={beginStroke}
                onPointerMove={drawStroke}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
                onLostPointerCapture={endStroke}
                className="touch-none rounded-2xl bg-white"
                style={{ touchAction: "none", width: `${canvasSize}px`, height: `${canvasSize}px`, maxWidth: "100%" }}
              />
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <p className="text-sm text-cyan-300">Prediction status</p>
              <h2 className="mt-1 text-2xl font-semibold">{modelReady ? "Model ready" : "Loading model..."}</h2>
              <p className="mt-2 text-sm text-white/60">{statusMessage}</p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-sm text-white/60">Most likely drawing</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {predictedWord || "Waiting for a sketch"}
              </p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-200"
                  style={{ width: `${Math.max(0, Math.min(100, confidence))}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-white/70">Confidence: {Math.round(confidence)}%</p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-white/70">Normalized preview</p>
                <span className="text-xs text-white/50">28×28</span>
              </div>
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 p-3">
                {isEmpty ? (
                  <p className="text-center text-sm text-white/50">Draw something to preview the normalized image.</p>
                ) : (
                  <canvas
                    ref={normalizedPreviewCanvasRef}
                    width={112}
                    height={112}
                    className="rounded-lg border border-white/[0.08] bg-white"
                    style={{ imageRendering: "pixelated", width: 112, height: 112 }}
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="mb-3 text-sm font-medium text-white/70">Top predictions</p>
              <div className="space-y-2">
                {topPredictions.length > 0 ? (
                  topPredictions.slice(0, 10).map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2 text-sm">
                      <span className="capitalize text-white/90">{item.label}</span>
                      <span className="font-mono text-cyan-300">{Math.round(item.confidence)}%</span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-black/10 px-3 py-2 text-sm text-white/60">
                    {modelReady ? "Draw something to see the predictions." : "The model is still loading."}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
