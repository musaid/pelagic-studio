import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import type { MetaFunction } from "react-router";
import { TopAppBar } from "~/components/top-app-bar";
import { MobileNav } from "~/components/mobile-nav";
import { Footer } from "~/components/footer";
import { loadImageFromFile, getImageFromClipboard, loadImageFromUrl, ImageLoadError } from "~/lib/utils/image";
import { drawImageDataToCanvas } from "~/lib/utils/canvas";
import { yellowfinTuna } from "~/lib/vision/species-profiles";
import type { SpeciesProfile, ContrastStats, WorkerResultMessage, WorkerProgressMessage } from "~/lib/vision/types";
import type { LoadedImage } from "~/lib/utils/image";

export const meta: MetaFunction = () => [
  {
    title: "Pelagic Studio — See Your Lures Through A Tuna's Eyes",
  },
  {
    name: "description",
    content:
      "Upload any fishing lure photo and see what yellowfin tuna actually see. Science-backed vision simulation for serious offshore anglers.",
  },
  {
    property: "og:title",
    content: "Pelagic Studio — See Your Lures Through A Tuna's Eyes",
  },
  {
    property: "og:description",
    content:
      "Upload any fishing lure photo and see what yellowfin tuna actually see. Science-backed vision simulation for serious offshore anglers.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://pelagicstudio.com" },
  { property: "og:image", content: "https://pelagicstudio.com/og-image.png" },
  { name: "twitter:card", content: "summary_large_image" },
  { tagName: "link", rel: "canonical", href: "https://pelagicstudio.com" },
];

interface SampleLure {
  id: string;
  name: string;
  src: string;
}

const SAMPLE_LURES: SampleLure[] = [
  { id: "lure-green", name: "CH150F — Green Mackerel", src: "/gallery/lure-green.webp" },
  { id: "lure-blue", name: "CH150F — Blue Mackerel", src: "/gallery/lure-blue.webp" },
  { id: "lure-silver", name: "CH150F — Blue/Silver", src: "/gallery/lure-silver.webp" },
];

const SLIDER_MIN = 0.02;
const SLIDER_MAX = 0.98;
const INTRO_ANIMATION_DURATION = 600;
const MAX_DEPTH = 200;

export default function Index() {
  // ── Worker & processing state ──────────────────────────────────────────────
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);
  const [stats, setStats] = useState<ContrastStats | null>(null);
  const [depth, setDepth] = useState(0);
  const [selectedSpecies] = useState<SpeciesProfile>(yellowfinTuna);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [, startTransition] = useTransition();

  // ── Compare slider state ────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderPos, setSliderPos] = useState(0.5);
  // Use a ref for dragging state — avoids stale closures in pointermove handler
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasRevealAnimated, setHasRevealAnimated] = useState(false);
  const rafRef = useRef<number | null>(null);

  // ── Upload state ────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  // ── Web Worker init ────────────────────────────────────────────────────────
  useEffect(() => {
    const worker = new Worker(
      new URL("../lib/vision/worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<WorkerResultMessage | WorkerProgressMessage>) => {
      const msg = event.data;
      if (msg.type === "progress") {
        setProcessingProgress(msg.percent);
      } else if (msg.type === "result") {
        setProcessedImageData(msg.imageData);
        setStats(msg.stats);
        setIsProcessing(false);
        setProcessingProgress(100);
      }
    };

    worker.onerror = (err) => {
      console.error("Vision worker error:", err);
      setIsProcessing(false);
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // ── Draw canvases ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (originalImageData && originalCanvasRef.current) {
      originalCanvasRef.current.width = originalImageData.width;
      originalCanvasRef.current.height = originalImageData.height;
      drawImageDataToCanvas(originalCanvasRef.current, originalImageData);
    }
  }, [originalImageData]);

  useEffect(() => {
    if (processedImageData && processedCanvasRef.current) {
      processedCanvasRef.current.width = processedImageData.width;
      processedCanvasRef.current.height = processedImageData.height;
      drawImageDataToCanvas(processedCanvasRef.current, processedImageData);
    }
  }, [processedImageData]);

  // ── Intro reveal animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (!processedImageData || hasRevealAnimated) return;
    setHasRevealAnimated(true);
    setSliderPos(0);

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / INTRO_ANIMATION_DURATION);
      const eased = 1 - Math.pow(1 - progress, 3);
      setSliderPos(eased * 0.5);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedImageData]);

  // ── Processing ─────────────────────────────────────────────────────────────
  const triggerProcessing = useCallback(
    (imageData: ImageData, species: SpeciesProfile, depthValue: number) => {
      const worker = workerRef.current;
      if (!worker) return;
      setIsProcessing(true);
      setProcessingProgress(0);
      const cloned = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
      worker.postMessage(
        { type: "process", imageData: cloned, species, depth: depthValue },
        [cloned.data.buffer]
      );
    },
    []
  );

  const handleImageLoaded = useCallback(
    (image: LoadedImage) => {
      setLoadedImage(image);
      setOriginalImageData(image.imageData);
      setProcessedImageData(null);
      setStats(null);
      setHasRevealAnimated(false);
      startTransition(() => {
        triggerProcessing(image.imageData, selectedSpecies, depth);
      });
    },
    [selectedSpecies, depth, triggerProcessing]
  );

  const handleDepthChange = useCallback(
    (newDepth: number) => {
      setDepth(newDepth);
      if (!loadedImage) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        triggerProcessing(loadedImage.imageData, selectedSpecies, newDepth);
      }, 100);
    },
    [loadedImage, selectedSpecies, triggerProcessing]
  );

  const handleReset = useCallback(() => {
    setLoadedImage(null);
    setOriginalImageData(null);
    setProcessedImageData(null);
    setStats(null);
    setDepth(0);
    setProcessingProgress(0);
    setHasRevealAnimated(false);
  }, []);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsUploading(true);
      try {
        const loaded = await loadImageFromFile(file);
        handleImageLoaded(loaded);
      } catch (err) {
        if (err instanceof ImageLoadError) {
          setUploadError(err.message);
        } else {
          setUploadError("Failed to load image. Please try another file.");
        }
      } finally {
        setIsUploading(false);
      }
    },
    [handleImageLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const file = getImageFromClipboard(e.nativeEvent);
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSampleSelect = useCallback(
    async (lure: SampleLure) => {
      setLoadingSampleId(lure.id);
      try {
        const image = await loadImageFromUrl(lure.src);
        handleImageLoaded(image);
      } catch (_err) {
        // silently ignore
      } finally {
        setLoadingSampleId(null);
      }
    },
    [handleImageLoaded]
  );

  // ── Compare slider pointer events ──────────────────────────────────────────
  const getSliderPosition = useCallback((clientX: number): number => {
    const container = containerRef.current;
    if (!container) return 0.5;
    const rect = container.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    return Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, raw));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Capture the pointer so pointermove keeps firing even if finger
      // leaves the element bounds — this is the key fix for mobile.
      e.currentTarget.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      setIsDragging(true);
      setSliderPos(getSliderPosition(e.clientX));
    },
    [getSliderPosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Read from ref — never stale, no closure issue
      if (!isDraggingRef.current) return;
      // Update position directly without RAF indirection.
      // React 18 batches state updates in event handlers; no extra renders.
      setSliderPos(getSliderPosition(e.clientX));
    },
    [getSliderPosition]
  );

  const stopDrag = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSliderPos((p) => Math.max(SLIDER_MIN, p - step));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSliderPos((p) => Math.min(SLIDER_MAX, p + step));
      }
    },
    []
  );

  const hasImage = !!loadedImage;
  const sliderPercent = `${sliderPos * 100}%`;

  // Depth context label
  const depthZoneLabel =
    depth === 0
      ? "Surface"
      : depth <= 10
      ? "Epipelagic"
      : depth <= 200
      ? "Mesopelagic"
      : "Bathypelagic";

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-50">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Pelagic Studio",
            url: "https://pelagicstudio.com",
            description: "Upload any fishing lure photo and see what yellowfin tuna actually see.",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      <TopAppBar />

      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto w-full px-6">

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="mt-8 border-b border-zinc-800 pb-4 flex justify-between items-end">
            <div>
              <p
                className="text-[10px] uppercase tracking-widest text-blue-400 mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Status: Ready
              </p>
              <h1
                className="text-2xl font-bold text-white uppercase tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Image Analyzer
              </h1>
            </div>
            <span
              className="text-[10px] text-zinc-500 pb-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              v3.1-beta / system_stable
            </span>
          </div>

          {/* ── Upload zone (no image) ───────────────────────────────────── */}
          {!hasImage && (
            <div className="mt-8">
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onPaste={handlePaste}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                role="button"
                aria-label="Upload a lure image"
                className={[
                  "relative flex-grow min-h-[350px] md:min-h-[450px]",
                  "border border-dashed rounded-lg",
                  "flex flex-col items-center justify-center cursor-pointer",
                  "transition-all duration-200 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-blue-500",
                  isDragOver
                    ? "border-blue-500 upload-zone-active"
                    : "border-zinc-700 hover:border-zinc-500",
                  isUploading ? "pointer-events-none opacity-60" : "",
                ].join(" ")}
                style={{
                  backgroundImage: isDragOver
                    ? undefined
                    : "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileInput}
                  aria-hidden="true"
                />

                {/* Corner brackets */}
                <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-500 pointer-events-none" />
                <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-500 pointer-events-none" />
                <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-500 pointer-events-none" />
                <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-500 pointer-events-none" />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p
                      className="text-[10px] uppercase tracking-widest text-blue-400"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Loading...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 pointer-events-none select-none text-center">
                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-white">
                        add_a_photo
                      </span>
                    </div>
                    <div>
                      <p
                        className="text-lg font-medium text-white mb-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {isDragOver ? "Drop to analyze" : "Tap to upload lure photo"}
                      </p>
                      <p
                        className="text-[10px] uppercase tracking-widest text-zinc-500"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Supported: .JPG, .PNG, .WEBP
                      </p>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-200">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Reference Library */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="text-[10px] uppercase tracking-widest text-zinc-500"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Reference Library
                  </p>
                  <button
                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors duration-150"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {SAMPLE_LURES.map((lure) => (
                    <button
                      key={lure.id}
                      onClick={() => handleSampleSelect(lure)}
                      disabled={!!loadingSampleId}
                      aria-label={`Load sample: ${lure.name}`}
                      className={[
                        "group relative aspect-square bg-zinc-900 border border-zinc-800",
                        "overflow-hidden rounded-lg cursor-pointer transition-all duration-200",
                        "hover:border-zinc-600",
                        loadingSampleId === lure.id ? "opacity-50" : "",
                        !!loadingSampleId && loadingSampleId !== lure.id ? "opacity-40 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      <img
                        src={lure.src}
                        alt={lure.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                      {loadingSampleId === lure.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Compare slider (image loaded) ────────────────────────────── */}
          {hasImage && (
            <div className="mt-8 space-y-8">
              {/* Slider */}
              <div
                ref={containerRef}
                className={[
                  "compare-slider-container bg-zinc-900 border border-zinc-800 rounded-lg",
                  "select-none cursor-col-resize",
                  isDragging ? "no-select" : "",
                ].join(" ")}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="slider"
                aria-label="Compare human vision and tuna vision"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPos * 100)}
              >
                {/* Bottom canvas: original */}
                <canvas
                  ref={originalCanvasRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ imageRendering: "auto" }}
                />
                {/* Top canvas: processed, clipped */}
                <canvas
                  ref={processedCanvasRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPercent})`,
                    willChange: "clip-path",
                    imageRendering: "auto",
                  }}
                />

                {/* Handle — pointer-events-none so the container captures all events */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{ left: sliderPercent, transform: "translateX(-50%)", width: "2px", background: "rgba(255,255,255,0.8)" }}
                >
                  {/* Visible knob */}
                  <div
                    className={[
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                      "w-10 h-10 rounded-full bg-white flex items-center justify-center",
                      "shadow-lg transition-transform duration-150",
                      isDragging ? "scale-125" : "scale-100",
                    ].join(" ")}
                  >
                    <span
                      className="material-symbols-outlined text-black text-[18px]"
                      style={{
                        transform: "rotate(90deg)",
                        fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                      }}
                    >
                      unfold_more
                    </span>
                  </div>
                  {/* Invisible 56px touch target centred on the line — per Apple HIG / Material Design */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14" />
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 border-l-2 border-white pointer-events-none">
                  <span
                    className="text-[10px] uppercase tracking-widest text-white"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Human Vision
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 border-r-2 border-white pointer-events-none">
                  <span
                    className="text-[10px] uppercase tracking-widest text-white"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Tuna Vision ({depth}m)
                  </span>
                </div>

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm border border-blue-500/30 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span
                      className="text-[10px] uppercase tracking-widest text-blue-300"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Processing
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {isProcessing && (
                <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden -mt-6">
                  <div
                    className="h-full bg-blue-500 transition-all duration-150"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              )}

              {/* ── Controls strip ─────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Depth slider panel */}
                <div className="md:col-span-8 bg-zinc-900/50 p-6 md:p-8 border border-zinc-800 rounded-lg">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Water Depth
                      </p>
                      <p
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {depth === 0 ? "0m" : `${depth}m`}
                      </p>
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {depthZoneLabel}
                    </span>
                  </div>

                  {/* Gradient track + input */}
                  <div className="relative">
                    <div
                      className="w-full h-1.5 rounded-full mb-4"
                      style={{
                        background:
                          "linear-gradient(to right, #3b82f6 0%, #06b6d4 30%, #22c55e 50%, #eab308 70%, #ef4444 100%)",
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={MAX_DEPTH}
                      value={depth}
                      onChange={(e) => handleDepthChange(Number(e.target.value))}
                      disabled={isProcessing}
                      className="depth-slider w-full"
                      aria-label={`Water depth: ${depth} meters`}
                      style={{ marginTop: "-22px" }}
                    />
                  </div>

                  {/* Tick labels */}
                  <div className="flex justify-between mt-3">
                    {["0m", "100m", "200m"].map((label) => (
                      <span
                        key={label}
                        className="text-[10px] uppercase tracking-widest text-zinc-600"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="md:col-span-4 flex flex-col gap-3 justify-center">
                  <button
                    className="w-full py-4 bg-white text-black hover:bg-blue-400 transition-colors duration-150 rounded-lg"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="text-[11px] uppercase tracking-[0.2em]">
                      Export Spectral Map
                    </span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-4 border border-zinc-800 text-white hover:bg-white/5 transition-colors duration-150 rounded-lg"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="text-[11px] uppercase tracking-[0.2em]">
                      Analyze New Lure
                    </span>
                  </button>
                </div>
              </div>

              {/* ── Stats section ──────────────────────────────────────────── */}
              {stats && !isProcessing && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Visibility score card */}
                  <div className="bg-zinc-900/50 p-6 border-l-4 border-blue-500 rounded-r-lg">
                    <p
                      className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Visibility Score
                    </p>
                    <p
                      className="text-5xl font-black text-white leading-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {stats.visibilityScore}
                      <span className="text-xs text-zinc-500 font-normal">/100</span>
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-widest text-zinc-400 mt-3"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Optimal Contrast Range
                    </p>
                  </div>

                  {/* Spectral insights */}
                  <div className="md:col-span-3 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-zinc-400 text-[18px]">analytics</span>
                      <p
                        className="text-[10px] uppercase tracking-widest text-zinc-400"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Monitored Spectral Insights
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          label: "Blue/Violet",
                          value: `${stats.colorCategories.blueViolet}%`,
                        },
                        {
                          label: "Green",
                          value: `${stats.colorCategories.green}%`,
                        },
                        {
                          label: "Red/Orange",
                          value: `${stats.colorCategories.redOrange}%`,
                        },
                        {
                          label: "Metallic",
                          value: `${stats.colorCategories.metallic}%`,
                        },
                        {
                          label: "Brightness Retained",
                          value: `${stats.brightnessRetention}%`,
                        },
                        {
                          label: "Depth Zone",
                          value: depthZoneLabel,
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <span
                            className="text-[10px] uppercase tracking-widest text-zinc-500"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {label}
                          </span>
                          <span
                            className="text-sm text-white uppercase"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stats.recommendations.length > 0 && (
                      <div className="mt-4 space-y-1">
                        {stats.recommendations.slice(0, 3).map((rec) => (
                          <p
                            key={rec}
                            className="text-[10px] uppercase tracking-widest text-zinc-500"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            — {rec}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
