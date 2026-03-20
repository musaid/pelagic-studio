import { useRef, useState, useCallback } from "react";
import type { MetaFunction } from "react-router";
import { useNavigate } from "react-router";
import { TopAppBar } from "~/components/top-app-bar";
import { MobileNav } from "~/components/mobile-nav";
import { Footer } from "~/components/footer";
import { loadImageFromFile, getImageFromClipboard, loadImageFromUrl, ImageLoadError } from "~/lib/utils/image";
import type { LoadedImage } from "~/lib/utils/image";

export const meta: MetaFunction = () => [
  { title: "Archive — Pelagic Studio" },
  {
    name: "description",
    content: "Sample lure archive and analysis history for Pelagic Studio.",
  },
];

interface SampleLure {
  id: string;
  name: string;
  src: string;
}

const SAMPLE_LURES: SampleLure[] = [
  { id: "blue-silver", name: "Blue/Silver Skirted", src: "/gallery/blue-silver.svg" },
  { id: "red-orange", name: "Red/Orange Skirt", src: "/gallery/red-orange.svg" },
  { id: "chrome", name: "Chrome Spoon", src: "/gallery/chrome-spoon.svg" },
  { id: "multicolor", name: "Multicolor Skirted", src: "/gallery/multicolor.svg" },
];

// Module-level store so home page can pick it up after navigation
let pendingImage: LoadedImage | null = null;
export function takePendingImage(): LoadedImage | null {
  const img = pendingImage;
  pendingImage = null;
  return img;
}

export default function Archive() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  const handleImageLoaded = useCallback(
    (_image: LoadedImage) => {
      // Navigate to home; home page will re-process via its own state
      navigate("/");
    },
    [navigate]
  );

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
          setUploadError("Failed to load image.");
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
        await loadImageFromUrl(lure.src);
        navigate("/");
      } catch (_err) {
        // silently ignore
      } finally {
        setLoadingSampleId(null);
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-50">
      <TopAppBar />

      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto w-full px-6">

          {/* Page header */}
          <div className="mt-8 border-b border-zinc-800 pb-4 flex justify-between items-end">
            <div>
              <p
                className="text-[10px] uppercase tracking-widest text-blue-400 mb-1"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Catalog
              </p>
              <h1
                className="text-2xl font-bold text-white uppercase tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Archive
              </h1>
            </div>
            <span
              className="text-[10px] text-zinc-500 pb-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              v3.1-beta / system_stable
            </span>
          </div>

          {/* Upload zone */}
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
                "relative min-h-[220px]",
                "border border-dashed rounded-lg",
                "flex flex-col items-center justify-center cursor-pointer",
                "transition-all duration-200 outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500",
                isDragOver
                  ? "border-white upload-zone-active"
                  : "border-zinc-700 hover:border-white",
                isUploading ? "pointer-events-none opacity-60" : "",
              ].join(" ")}
              style={{
                backgroundImage: isDragOver
                  ? undefined
                  : "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
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

              {/* White corner brackets */}
              <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
              <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
              <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
              <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />

              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 pointer-events-none select-none text-center p-8">
                  <span className="material-symbols-outlined text-3xl text-zinc-400">upload_file</span>
                  <p
                    className="text-sm font-medium text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {isDragOver ? "Drop to analyze" : "Upload for instant analysis"}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-widest text-zinc-500"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Supported: .JPG, .PNG, .WEBP
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-200">
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* Instant Analysis Samples */}
          <div className="mt-12">
            <p
              className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Instant Analysis Samples
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {SAMPLE_LURES.map((lure) => (
                <button
                  key={lure.id}
                  onClick={() => handleSampleSelect(lure)}
                  disabled={!!loadingSampleId}
                  aria-label={`Analyze sample: ${lure.name}`}
                  className={[
                    "group relative aspect-square bg-zinc-900 border border-zinc-800",
                    "hover:border-white rounded-lg overflow-hidden cursor-pointer",
                    "transition-all duration-200",
                    loadingSampleId === lure.id ? "opacity-50" : "",
                    !!loadingSampleId && loadingSampleId !== lure.id ? "opacity-40 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  <img
                    src={lure.src}
                    alt={lure.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                  />
                  {/* Slide-up filename label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p
                      className="text-[9px] uppercase tracking-widest text-white truncate"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {lure.name}
                    </p>
                  </div>
                  {loadingSampleId === lure.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              ))}

              {/* Add slot */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-zinc-900 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Upload new lure"
              >
                <span className="material-symbols-outlined text-zinc-600 text-2xl">more_horiz</span>
              </button>
            </div>
          </div>

          {/* System Protocol */}
          <div className="mt-16 mb-12 max-w-2xl border-l-2 border-blue-500 pl-6 py-2">
            <p
              className="text-[10px] uppercase tracking-widest text-white mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              System Protocol
            </p>
            <p
              className="text-[11px] uppercase text-zinc-400 leading-relaxed opacity-80 mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Pelagic Studio simulates yellowfin tuna vision using peer-reviewed visual
              neuroscience. Photoreceptor responses are computed via the Govardovskii (2000)
              visual pigment nomogram. Water attenuation follows Jerlov (1976) Type I open
              ocean coefficients. Primary data source: Loew, McFarland &amp; Margulies (2002).
              All processing is performed client-side via Web Workers — no image data is
              transmitted to any server.
            </p>
            <a
              href="#"
              className="text-[10px] uppercase tracking-widest text-blue-400 underline"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              View Documentation / Protocol v3.1
            </a>
          </div>
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
