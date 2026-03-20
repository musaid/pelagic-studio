import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import type { MetaFunction } from "react-router";
import { Hero } from "~/components/hero";
import { ImageUpload } from "~/components/image-upload";
import { CompareSlider } from "~/components/compare-slider";
import { DepthSlider } from "~/components/depth-slider";
import { SpeciesSelector } from "~/components/species-selector";
import { ContrastAnalysis } from "~/components/contrast-analysis";
import { SampleGallery } from "~/components/sample-gallery";
import { Footer } from "~/components/footer";
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
  {
    property: "og:type",
    content: "website",
  },
  {
    property: "og:url",
    content: "https://pelagicstudio.com",
  },
  {
    property: "og:image",
    content: "https://pelagicstudio.com/og-image.png",
  },
  {
    name: "twitter:card",
    content: "summary_large_image",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://pelagicstudio.com",
  },
];

export default function Index() {
  const toolRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);
  const [stats, setStats] = useState<ContrastStats | null>(null);
  const [depth, setDepth] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesProfile>(yellowfinTuna);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [, startTransition] = useTransition();

  // Initialize Web Worker
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

  const triggerProcessing = useCallback(
    (imageData: ImageData, species: SpeciesProfile, depthValue: number) => {
      const worker = workerRef.current;
      if (!worker) return;

      setIsProcessing(true);
      setProcessingProgress(0);

      // Clone the imageData buffer since it will be transferred
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

      startTransition(() => {
        triggerProcessing(image.imageData, selectedSpecies, depth);
      });

      // Scroll to tool
      setTimeout(() => {
        toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
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

  const handleSpeciesChange = useCallback(
    (species: SpeciesProfile) => {
      setSelectedSpecies(species);
      if (!loadedImage) return;
      triggerProcessing(loadedImage.imageData, species, depth);
    },
    [loadedImage, depth, triggerProcessing]
  );

  const handleReset = useCallback(() => {
    setLoadedImage(null);
    setOriginalImageData(null);
    setProcessedImageData(null);
    setStats(null);
    setDepth(0);
    setProcessingProgress(0);
  }, []);

  const scrollToTool = useCallback(() => {
    toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToGallery = useCallback(() => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const hasImage = !!loadedImage;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Pelagic Studio",
            url: "https://pelagicstudio.com",
            description:
              "Upload any fishing lure photo and see what yellowfin tuna actually see. Science-backed vision simulation.",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Hero */}
      <section className="px-4">
        <Hero onUploadClick={scrollToTool} onTrySampleClick={scrollToGallery} />
      </section>

      {/* Tool section */}
      <section
        ref={toolRef}
        id="tool"
        className="px-4 max-w-4xl mx-auto scroll-mt-8"
      >
        {!hasImage ? (
          <div className="space-y-6">
            {/* Upload zone */}
            <ImageUpload onImageLoaded={handleImageLoaded} />

            {/* Sample gallery */}
            <div ref={galleryRef} className="pt-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-medium text-center mb-4">
                Try a sample lure
              </p>
              <SampleGallery onSampleSelected={handleImageLoaded} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Compare slider */}
            <CompareSlider
              originalImageData={originalImageData}
              processedImageData={processedImageData}
              isProcessing={isProcessing}
              imageWidth={loadedImage.width}
              imageHeight={loadedImage.height}
            />

            {/* Progress bar */}
            {isProcessing && (
              <div className="w-full h-0.5 bg-blue-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-150"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            )}

            {/* Controls strip */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-4 items-end bg-[#0d1426] border border-blue-900/50 rounded-xl p-5">
              <SpeciesSelector
                selected={selectedSpecies}
                onChange={handleSpeciesChange}
                disabled={isProcessing}
              />
              <DepthSlider
                depth={depth}
                onChange={handleDepthChange}
                disabled={isProcessing}
              />
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-900 text-sm text-slate-400 hover:text-slate-200 hover:border-blue-700 transition-all duration-150 whitespace-nowrap"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zM6.293 6.707a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L11 5.414V13a1 1 0 1 1-2 0V5.414L7.707 6.707a1 1 0 0 1-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload New
              </button>
            </div>

            {/* Analysis panel */}
            {stats && !isProcessing && (
              <ContrastAnalysis
                stats={stats}
                species={selectedSpecies}
                depth={depth}
              />
            )}
          </div>
        )}
      </section>

      {/* Science section */}
      <section className="px-4 max-w-3xl mx-auto mt-24 mb-16">
        <div className="border-t border-blue-900/30 pt-16 space-y-10">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">
              The Science
            </p>
            <h2 className="text-2xl font-bold text-white mb-4">
              How Tuna Actually See
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
              Built for anglers, by an angler. Grounded in peer-reviewed research.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-[#0d1426] border border-blue-900/40 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-950 flex items-center justify-center mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-5 h-5 text-blue-400"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Dichromatic Vision
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Yellowfin tuna have only two cone photoreceptor types — compared to
                three in humans. This fundamentally limits their color discrimination
                and makes them insensitive to red and orange wavelengths.
              </p>
            </div>

            <div className="bg-[#0d1426] border border-blue-900/40 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-950 flex items-center justify-center mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-5 h-5 text-cyan-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Blue-Green Dominance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Their primary photoreceptors peak at 485nm (blue-green), exactly
                matched to clear ocean water's peak transmission. Blue and silver
                lures stand out against this background — red ones disappear.
              </p>
            </div>

            <div className="bg-[#0d1426] border border-blue-900/40 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-950 flex items-center justify-center mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-5 h-5 text-emerald-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Depth Attenuation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Water selectively absorbs wavelengths with depth. Red light
                vanishes by 10m. By 50m, only blue-violet remains. The depth
                slider shows this real Jerlov Type I ocean attenuation.
              </p>
            </div>
          </div>

          <div className="bg-[#0d1426] border border-blue-900/40 rounded-xl p-6">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">
              Primary Source
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Loew, E.R., McFarland, W.N. & Margulies, D. (2002).{" "}
              <span className="italic">
                Developmental Changes in the Visual Pigments of the Yellowfin
                Tuna, Thunnus albacares.
              </span>{" "}
              Marine and Freshwater Behaviour and Physiology, Vol. 35, No. 4,
              pp. 235–246.
            </p>
            <p className="text-xs text-slate-600 mt-3">
              Vision model uses the Govardovskii et al. (2000) visual pigment
              nomogram for computing photoreceptor responses. Water attenuation
              follows Jerlov (1976) Type I clear ocean water coefficients.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
