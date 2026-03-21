import { useRef, useState, useEffect, useCallback, useTransition } from 'react';
import type { MetaFunction } from 'react-router';
import { TopAppBar } from '~/components/top-app-bar';
import { MobileNav } from '~/components/mobile-nav';
import { Footer } from '~/components/footer';
import {
  loadImageFromFile,
  getImageFromClipboard,
  loadImageFromUrl,
  ImageLoadError,
} from '~/lib/utils/image';
import { drawImageDataToCanvas } from '~/lib/utils/canvas';
import { yellowfinTuna } from '~/lib/vision/species-profiles';
import type {
  SpeciesProfile,
  ContrastStats,
  WorkerResultMessage,
  WorkerProgressMessage,
} from '~/lib/vision/types';
import type { LoadedImage } from '~/lib/utils/image';

export const meta: MetaFunction = () => [
  {
    title: "Pelagic Studio — See Your Lures Through A Tuna's Eyes",
  },
  {
    name: 'description',
    content:
      'Upload any fishing lure photo and see what yellowfin tuna actually see. Science-backed vision simulation for serious offshore anglers.',
  },
  {
    property: 'og:title',
    content: "Pelagic Studio — See Your Lures Through A Tuna's Eyes",
  },
  {
    property: 'og:description',
    content:
      'Upload any fishing lure photo and see what yellowfin tuna actually see. Science-backed vision simulation for serious offshore anglers.',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: 'https://pelagicstudio.com' },
  { property: 'og:image', content: 'https://pelagicstudio.com/og-image.png' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { tagName: 'link', rel: 'canonical', href: 'https://pelagicstudio.com' },
];

interface SampleLure {
  id: string;
  name: string;
  src: string;
}

const SAMPLE_LURES: SampleLure[] = [
  {
    id: 'lure-green',
    name: 'CH150F — Green Mackerel',
    src: '/gallery/lure-green.webp',
  },
  {
    id: 'lure-blue',
    name: 'CH150F — Blue Mackerel',
    src: '/gallery/lure-blue.webp',
  },
  {
    id: 'lure-silver',
    name: 'CH150F — Blue/Silver',
    src: '/gallery/lure-silver.webp',
  },
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
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(
    null,
  );
  const [processedImageData, setProcessedImageData] =
    useState<ImageData | null>(null);
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
      new URL('../lib/vision/worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (
      event: MessageEvent<WorkerResultMessage | WorkerProgressMessage>,
    ) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        setProcessingProgress(msg.percent);
      } else if (msg.type === 'result') {
        setProcessedImageData(msg.imageData);
        setStats(msg.stats);
        setIsProcessing(false);
        setProcessingProgress(100);
      }
    };

    worker.onerror = (err) => {
      console.error('Vision worker error:', err);
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
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
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
        imageData.height,
      );
      worker.postMessage(
        { type: 'process', imageData: cloned, species, depth: depthValue },
        [cloned.data.buffer],
      );
    },
    [],
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
    [selectedSpecies, depth, triggerProcessing],
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
    [loadedImage, selectedSpecies, triggerProcessing],
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
          setUploadError('Failed to load image. Please try another file.');
        }
      } finally {
        setIsUploading(false);
      }
    },
    [handleImageLoaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
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
      e.target.value = '';
    },
    [handleFile],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const file = getImageFromClipboard(e.nativeEvent);
      if (file) handleFile(file);
    },
    [handleFile],
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
    [handleImageLoaded],
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
    [getSliderPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Read from ref — never stale, no closure issue
      if (!isDraggingRef.current) return;
      // Update position directly without RAF indirection.
      // React 18 batches state updates in event handlers; no extra renders.
      setSliderPos(getSliderPosition(e.clientX));
    },
    [getSliderPosition],
  );

  const stopDrag = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSliderPos((p) => Math.max(SLIDER_MIN, p - step));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSliderPos((p) => Math.min(SLIDER_MAX, p + step));
      }
    },
    [],
  );

  const hasImage = !!loadedImage;
  const sliderPercent = `${sliderPos * 100}%`;

  // Depth context label
  const depthZoneLabel =
    depth === 0
      ? 'Surface'
      : depth <= 10
        ? 'Epipelagic'
        : depth <= 200
          ? 'Mesopelagic'
          : 'Bathypelagic';

  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-50">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Pelagic Studio',
            url: 'https://pelagicstudio.com',
            description:
              'Upload any fishing lure photo and see what yellowfin tuna actually see.',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      <TopAppBar />

      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-5xl px-6">
          {/* ── Page header ─────────────────────────────────────────────── */}
          <div className="mt-8 flex items-end justify-between border-b border-zinc-800 pb-4">
            <div>
              <p
                className="mb-1 text-[10px] tracking-widest text-blue-400 uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Status: Ready
              </p>
              <h1
                className="text-2xl font-bold tracking-tight text-white uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Image Analyzer
              </h1>
            </div>
            <span
              className="pb-1 text-[10px] text-zinc-500"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Upload a lure image"
                className={[
                  'relative min-h-[350px] flex-grow md:min-h-[450px]',
                  'rounded-lg border border-dashed',
                  'flex cursor-pointer flex-col items-center justify-center',
                  'transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-blue-500',
                  isDragOver
                    ? 'upload-zone-active border-blue-500'
                    : 'border-zinc-700 hover:border-zinc-500',
                  isUploading ? 'pointer-events-none opacity-60' : '',
                ].join(' ')}
                style={{
                  backgroundImage: isDragOver
                    ? undefined
                    : 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
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
                <span className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-zinc-500" />
                <span className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-zinc-500" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-zinc-500" />
                <span className="pointer-events-none absolute right-3 bottom-3 h-4 w-4 border-r-2 border-b-2 border-zinc-500" />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <p
                      className="text-[10px] tracking-widest text-blue-400 uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Loading...
                    </p>
                  </div>
                ) : (
                  <div className="pointer-events-none flex flex-col items-center gap-4 p-8 text-center select-none">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                      <span className="material-symbols-outlined text-4xl text-white">
                        add_a_photo
                      </span>
                    </div>
                    <div>
                      <p
                        className="mb-2 text-lg font-medium text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {isDragOver
                          ? 'Drop to analyze'
                          : 'Tap to upload lure photo'}
                      </p>
                      <p
                        className="text-[10px] tracking-widest text-zinc-500 uppercase"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Supported: .JPG, .PNG, .WEBP
                      </p>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="absolute right-4 bottom-4 left-4 rounded-lg border border-red-700 bg-red-900/80 px-4 py-3 text-sm text-red-200">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Reference Library */}
              <div className="mt-12">
                <div className="mb-4 flex items-center justify-between">
                  <p
                    className="text-[10px] tracking-widest text-zinc-500 uppercase"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Reference Library
                  </p>
                  <button
                    className="text-[10px] tracking-widest text-zinc-500 uppercase transition-colors duration-150 hover:text-white"
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
                        'group relative aspect-square border border-zinc-800 bg-zinc-900',
                        'cursor-pointer overflow-hidden rounded-lg transition-all duration-200',
                        'hover:border-zinc-600',
                        loadingSampleId === lure.id ? 'opacity-50' : '',
                        !!loadingSampleId && loadingSampleId !== lure.id
                          ? 'cursor-not-allowed opacity-40'
                          : '',
                      ].join(' ')}
                    >
                      <img
                        src={lure.src}
                        alt={lure.name}
                        className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                      />
                      {loadingSampleId === lure.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
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
                  'compare-slider-container rounded-lg border border-zinc-800 bg-zinc-900',
                  'cursor-col-resize select-none',
                  isDragging ? 'no-select' : '',
                ].join(' ')}
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
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{ imageRendering: 'auto' }}
                />
                {/* Top canvas: processed, clipped */}
                <canvas
                  ref={processedCanvasRef}
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPercent})`,
                    willChange: 'clip-path',
                    imageRendering: 'auto',
                  }}
                />

                {/* Handle — pointer-events-none so the container captures all events */}
                <div
                  className="pointer-events-none absolute top-0 bottom-0"
                  style={{
                    left: sliderPercent,
                    transform: 'translateX(-50%)',
                    width: '2px',
                    background: 'rgba(255,255,255,0.8)',
                  }}
                >
                  {/* Visible knob */}
                  <div
                    className={[
                      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                      'flex h-10 w-10 items-center justify-center rounded-full bg-white',
                      'shadow-lg transition-transform duration-150',
                      isDragging ? 'scale-125' : 'scale-100',
                    ].join(' ')}
                  >
                    <span
                      className="material-symbols-outlined text-[18px] text-black"
                      style={{
                        transform: 'rotate(90deg)',
                        fontVariationSettings:
                          "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                      }}
                    >
                      unfold_more
                    </span>
                  </div>
                  {/* Invisible 56px touch target centred on the line — per Apple HIG / Material Design */}
                  <div className="absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Labels */}
                <div className="pointer-events-none absolute top-3 left-3 border-l-2 border-white bg-black/80 px-3 py-1 backdrop-blur-md">
                  <span
                    className="text-[10px] tracking-widest text-white uppercase"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Human Vision
                  </span>
                </div>
                <div className="pointer-events-none absolute top-3 right-3 border-r-2 border-white bg-black/80 px-3 py-1 backdrop-blur-md">
                  <span
                    className="text-[10px] tracking-widest text-white uppercase"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Tuna Vision ({depth}m)
                  </span>
                </div>

                {/* Processing indicator */}
                {isProcessing && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-blue-500/30 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                    <span
                      className="text-[10px] tracking-widest text-blue-300 uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Processing
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {isProcessing && (
                <div className="-mt-6 h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-blue-500 transition-all duration-150"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              )}

              {/* ── Controls strip ─────────────────────────────────────────── */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                {/* Depth slider panel */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:col-span-8 md:p-8">
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <p
                        className="mb-1 text-[10px] tracking-widest text-zinc-500 uppercase"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Water Depth
                      </p>
                      <p
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {depth === 0 ? '0m' : `${depth}m`}
                      </p>
                    </div>
                    <span
                      className="mb-1 text-[10px] tracking-widest text-zinc-500 uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {depthZoneLabel}
                    </span>
                  </div>

                  {/* Gradient track + input */}
                  <div className="relative">
                    <div
                      className="mb-4 h-1.5 w-full rounded-full"
                      style={{
                        background:
                          'linear-gradient(to right, #3b82f6 0%, #06b6d4 30%, #22c55e 50%, #eab308 70%, #ef4444 100%)',
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={MAX_DEPTH}
                      value={depth}
                      onChange={(e) =>
                        handleDepthChange(Number(e.target.value))
                      }
                      disabled={isProcessing}
                      className="depth-slider w-full"
                      aria-label={`Water depth: ${depth} meters`}
                      style={{ marginTop: '-22px' }}
                    />
                  </div>

                  {/* Tick labels */}
                  <div className="mt-3 flex justify-between">
                    {['0m', '100m', '200m'].map((label) => (
                      <span
                        key={label}
                        className="text-[10px] tracking-widest text-zinc-600 uppercase"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col justify-center gap-3 md:col-span-4">
                  <button
                    className="w-full rounded-lg bg-white py-4 text-black transition-colors duration-150 hover:bg-blue-400"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="text-[11px] tracking-[0.2em] uppercase">
                      Export Spectral Map
                    </span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full rounded-lg border border-zinc-800 py-4 text-white transition-colors duration-150 hover:bg-white/5"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="text-[11px] tracking-[0.2em] uppercase">
                      Analyze New Lure
                    </span>
                  </button>
                </div>
              </div>

              {/* ── Stats section ──────────────────────────────────────────── */}
              {stats && !isProcessing && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                  {/* Visibility score card */}
                  <div className="rounded-r-lg border-l-4 border-blue-500 bg-zinc-900/50 p-6">
                    <p
                      className="mb-2 text-[10px] tracking-widest text-zinc-500 uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Visibility Score
                    </p>
                    <p
                      className="text-5xl leading-none font-black text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {stats.visibilityScore}
                      <span className="text-xs font-normal text-zinc-500">
                        /100
                      </span>
                    </p>
                    <p
                      className="mt-3 text-[9px] tracking-widest text-zinc-400 uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Optimal Contrast Range
                    </p>
                  </div>

                  {/* Spectral insights */}
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:col-span-3">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-zinc-400">
                        analytics
                      </span>
                      <p
                        className="text-[10px] tracking-widest text-zinc-400 uppercase"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Monitored Spectral Insights
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        {
                          label: 'Blue/Violet',
                          value: `${stats.colorCategories.blueViolet}%`,
                        },
                        {
                          label: 'Green',
                          value: `${stats.colorCategories.green}%`,
                        },
                        {
                          label: 'Red/Orange',
                          value: `${stats.colorCategories.redOrange}%`,
                        },
                        {
                          label: 'Metallic',
                          value: `${stats.colorCategories.metallic}%`,
                        },
                        {
                          label: 'Brightness Retained',
                          value: `${stats.brightnessRetention}%`,
                        },
                        {
                          label: 'Depth Zone',
                          value: depthZoneLabel,
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between border-b border-zinc-800 pb-2"
                        >
                          <span
                            className="text-[10px] tracking-widest text-zinc-500 uppercase"
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
                            className="text-[10px] tracking-widest text-zinc-500 uppercase"
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
