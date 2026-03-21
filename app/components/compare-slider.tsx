import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { drawImageDataToCanvas } from '~/lib/utils/canvas';

interface CompareSliderProps {
  originalImageData: ImageData | null;
  processedImageData: ImageData | null;
  isProcessing: boolean;
  imageWidth: number;
  imageHeight: number;
}

const SLIDER_MIN = 0.02;
const SLIDER_MAX = 0.98;
const INTRO_ANIMATION_DURATION = 600;

export function CompareSlider({
  originalImageData,
  processedImageData,
  isProcessing,
  imageWidth,
  imageHeight,
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  const [sliderPos, setSliderPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [hasRevealAnimated, setHasRevealAnimated] = useState(false);

  const labelsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Draw original image to bottom canvas
  useLayoutEffect(() => {
    if (originalImageData && originalCanvasRef.current) {
      originalCanvasRef.current.width = imageWidth;
      originalCanvasRef.current.height = imageHeight;
      drawImageDataToCanvas(originalCanvasRef.current, originalImageData);
    }
  }, [originalImageData, imageWidth, imageHeight]);

  // Draw processed image to top canvas (never blank during updates)
  useLayoutEffect(() => {
    if (processedImageData && processedCanvasRef.current) {
      processedCanvasRef.current.width = imageWidth;
      processedCanvasRef.current.height = imageHeight;
      drawImageDataToCanvas(processedCanvasRef.current, processedImageData);
    }
  }, [processedImageData, imageWidth, imageHeight]);

  // Intro reveal animation when processed image first arrives
  useEffect(() => {
    if (!processedImageData || hasRevealAnimated) return;

    setHasRevealAnimated(true);
    setSliderPos(0);

    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / INTRO_ANIMATION_DURATION);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setSliderPos(eased * 0.5);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedImageData]);

  const showLabels = useCallback(() => {
    setLabelsVisible(true);
    if (labelsTimerRef.current) clearTimeout(labelsTimerRef.current);
    labelsTimerRef.current = setTimeout(() => setLabelsVisible(false), 3000);
  }, []);

  // Auto-hide labels on mount
  useEffect(() => {
    const timer = setTimeout(() => setLabelsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getPositionFromEvent = useCallback((clientX: number): number => {
    const container = containerRef.current;
    if (!container) return 0.5;
    const rect = container.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    return Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, raw));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      showLabels();
      const pos = getPositionFromEvent(e.clientX);
      setSliderPos(pos);
    },
    [getPositionFromEvent, showLabels],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      showLabels();
      const pos = getPositionFromEvent(e.clientX);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setSliderPos(pos);
      });
    },
    [isDragging, getPositionFromEvent, showLabels],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSliderPos((p) => Math.max(SLIDER_MIN, p - step));
        showLabels();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSliderPos((p) => Math.min(SLIDER_MAX, p + step));
        showLabels();
      }
    },
    [showLabels],
  );

  const handleFocus = useCallback(() => {
    showLabels();
  }, [showLabels]);

  const aspectRatio = imageHeight > 0 ? imageWidth / imageHeight : 4 / 3;

  const sliderPercent = `${sliderPos * 100}%`;

  return (
    <div
      ref={containerRef}
      className={[
        'compare-container relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl',
        'cursor-col-resize select-none',
        isDragging ? 'no-select' : '',
      ].join(' ')}
      style={{ aspectRatio: `${aspectRatio}`, maxHeight: '70vh' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      tabIndex={0}
      role="slider"
      aria-label="Compare human vision and tuna vision"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPos * 100)}
    >
      {/* Bottom canvas: original (human vision) — always full width */}
      <canvas
        ref={originalCanvasRef}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ imageRendering: 'auto' }}
      />

      {/* Top canvas: processed (tuna vision) — clipped to right of slider */}
      <canvas
        ref={processedCanvasRef}
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          clipPath: `inset(0 0 0 ${sliderPercent})`,
          willChange: 'clip-path',
          imageRendering: 'auto',
        }}
      />

      {/* Divider line */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white/80"
        style={{ left: sliderPercent, transform: 'translateX(-50%)' }}
      >
        {/* Grab handle */}
        <div
          className={[
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'flex h-10 w-10 items-center justify-center rounded-full bg-white',
            'shadow-lg transition-transform duration-150',
            isDragging
              ? 'scale-110 shadow-xl ring-4 shadow-blue-400/40 ring-blue-400/60'
              : 'scale-100 ring-2 ring-white/40',
          ].join(' ')}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-slate-700"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L14.586 11H5.414l2.293 2.293a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L5.414 9h9.172l-2.293-2.293a1 1 0 0 1 0-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div
        className={[
          'absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium',
          'border border-white/10 bg-black/60 text-white backdrop-blur-sm',
          'pointer-events-none transition-opacity duration-500',
          labelsVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        Human Vision
      </div>
      <div
        className={[
          'absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium',
          'border border-blue-500/30 bg-black/60 text-blue-300 backdrop-blur-sm',
          'pointer-events-none transition-opacity duration-500',
          labelsVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        Tuna Vision
      </div>

      {/* Processing activity indicator */}
      {isProcessing && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-blue-500/30 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span className="text-xs text-blue-300">Processing...</span>
        </div>
      )}
    </div>
  );
}
