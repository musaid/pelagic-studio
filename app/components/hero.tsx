interface HeroProps {
  onUploadClick: () => void;
  onTrySampleClick: () => void;
}

export function Hero({ onUploadClick, onTrySampleClick }: HeroProps) {
  return (
    <div className="text-center py-16 px-4 max-w-3xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-800 bg-blue-950/50 text-xs text-blue-300 font-medium mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        Science-backed vision simulation
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
        See Your Lures Through
        <br />
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          A Tuna's Eyes
        </span>
      </h1>

      <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Upload any lure photo. Discover what predators actually see — backed by
        peer-reviewed visual neuroscience.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-150 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
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
          Upload Your Lure
        </button>

        <button
          onClick={onTrySampleClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-blue-800 bg-blue-950/50 hover:bg-blue-950 text-blue-200 font-semibold text-sm transition-all duration-150"
        >
          Try a Sample
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
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
