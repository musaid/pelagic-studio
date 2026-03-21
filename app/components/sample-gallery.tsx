import { loadImageFromUrl, ImageLoadError } from '~/lib/utils/image';
import type { LoadedImage } from '~/lib/utils/image';
import { useState } from 'react';

interface SampleLure {
  id: string;
  name: string;
  description: string;
  src: string;
  expectation: string;
}

const SAMPLE_LURES: SampleLure[] = [
  {
    id: 'blue-silver',
    name: 'Blue/Silver Skirted',
    description: 'Classic offshore trolling lure',
    src: '/gallery/blue-silver.svg',
    expectation: 'High visibility',
  },
  {
    id: 'red-orange',
    name: 'Red/Orange Skirt',
    description: 'Bright warm-color trolling lure',
    src: '/gallery/red-orange.svg',
    expectation: 'Low visibility',
  },
  {
    id: 'chrome',
    name: 'Chrome Spoon',
    description: 'Metallic trolling spoon',
    src: '/gallery/chrome-spoon.svg',
    expectation: 'High visibility',
  },
  {
    id: 'multicolor',
    name: 'Multicolor Skirted',
    description: 'Mixed blue/green/pink lure',
    src: '/gallery/multicolor.svg',
    expectation: 'Medium visibility',
  },
];

interface SampleGalleryProps {
  onSampleSelected: (image: LoadedImage) => void;
}

export function SampleGallery({ onSampleSelected }: SampleGalleryProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleSelect = async (lure: SampleLure) => {
    setLoadingId(lure.id);
    setErrorId(null);
    try {
      const image = await loadImageFromUrl(lure.src);
      onSampleSelected(image);
    } catch (err) {
      if (err instanceof ImageLoadError) {
        setErrorId(lure.id);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SAMPLE_LURES.map((lure) => {
          const isLoading = loadingId === lure.id;
          const hasError = errorId === lure.id;

          return (
            <button
              key={lure.id}
              onClick={() => handleSelect(lure)}
              disabled={!!loadingId}
              className={[
                'group relative flex flex-col overflow-hidden rounded-xl',
                'border bg-[#0d1426] text-left transition-all duration-200',
                isLoading
                  ? 'border-blue-500 opacity-60'
                  : hasError
                    ? 'border-red-700'
                    : 'border-blue-900 hover:border-blue-600 hover:bg-[#111d35]',
                !!loadingId && !isLoading
                  ? 'cursor-not-allowed opacity-40'
                  : 'cursor-pointer',
              ].join(' ')}
              aria-label={`Try sample: ${lure.name}`}
            >
              {/* Image placeholder / thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-blue-950/50">
                <img
                  src={lure.src}
                  alt={lure.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Hide broken images gracefully
                    (e.currentTarget as HTMLImageElement).style.display =
                      'none';
                  }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  </div>
                )}
                {/* Expectation badge */}
                <div
                  className={[
                    'absolute right-1.5 bottom-1.5 rounded px-1.5 py-0.5 text-xs font-medium',
                    lure.expectation === 'High visibility'
                      ? 'bg-emerald-900/80 text-emerald-300'
                      : lure.expectation === 'Low visibility'
                        ? 'bg-red-900/80 text-red-300'
                        : 'bg-yellow-900/80 text-yellow-300',
                  ].join(' ')}
                >
                  {lure.expectation}
                </div>
              </div>

              <div className="p-2.5">
                <p className="text-xs leading-tight font-medium text-slate-300">
                  {lure.name}
                </p>
                <p className="mt-0.5 text-xs leading-tight text-slate-600">
                  {lure.description}
                </p>
                {hasError && (
                  <p className="mt-1 text-xs text-red-400">Failed to load</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
