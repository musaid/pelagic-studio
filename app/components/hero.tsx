interface HeroProps {
  onUploadClick: () => void;
  onTrySampleClick: () => void;
}

export function Hero({ onUploadClick, onTrySampleClick }: HeroProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-800 bg-blue-950/50 px-3 py-1.5 text-xs font-medium text-blue-300">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
        Science-backed vision simulation
      </div>

      <h1 className="mb-5 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
        See Your Lures Through
        <br />
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          A Tuna's Eyes
        </span>
      </h1>

      <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
        Upload any lure photo. Discover what predators actually see — backed by
        peer-reviewed visual neuroscience.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={onUploadClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-150 hover:bg-blue-500 hover:shadow-blue-500/30 sm:w-auto"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zM6.293 6.707a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L11 5.414V13a1 1 0 1 1-2 0V5.414L7.707 6.707a1 1 0 0 1-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Upload Your Lure
        </button>

        <button
          onClick={onTrySampleClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-800 bg-blue-950/50 px-6 py-3 text-sm font-semibold text-blue-200 transition-all duration-150 hover:bg-blue-950 sm:w-auto"
        >
          Try a Sample
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L14.586 11H3a1 1 0 1 1 0-2h11.586l-4.293-4.293a1 1 0 0 1 0-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
