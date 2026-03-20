import type { ContrastStats } from "~/lib/vision/types";
import type { SpeciesProfile } from "~/lib/vision/types";

interface ContrastAnalysisProps {
  stats: ContrastStats;
  species: SpeciesProfile;
  depth: number;
}

function BarFill({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-blue-950 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-500"
      : score >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="w-full h-3 bg-blue-950 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function ContrastAnalysis({
  stats,
  species,
  depth,
}: ContrastAnalysisProps) {
  const { visibilityScore, brightnessRetention, colorCategories, recommendations } =
    stats;

  const positiveRecs = recommendations.filter(
    (r) =>
      r.includes("Strong") ||
      r.includes("preserved") ||
      r.includes("visible") ||
      r.includes("High visibility") ||
      r.includes("Metallic") ||
      r.includes("partially")
  );

  const negativeRecs = recommendations.filter(
    (r) =>
      r.includes("invisible") ||
      r.includes("lost") ||
      r.includes("appears black") ||
      r.includes("Heavy") ||
      r.includes("diminishes") ||
      r.includes("Low overall") ||
      r.includes("only blue") ||
      r.includes("silhouette")
  );

  const scoreLabel =
    visibilityScore >= 70
      ? "Excellent"
      : visibilityScore >= 50
      ? "Good"
      : visibilityScore >= 30
      ? "Fair"
      : "Poor";

  const scoreColor =
    visibilityScore >= 70
      ? "text-emerald-400"
      : visibilityScore >= 50
      ? "text-yellow-400"
      : visibilityScore >= 30
      ? "text-orange-400"
      : "text-red-400";

  return (
    <div className="bg-[#0d1426] border border-blue-900/50 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-1">
          Lure Analysis
        </p>
        <h3 className="text-sm text-slate-300">
          {species.name} at {depth === 0 ? "surface" : `${depth}m depth`}
        </h3>
      </div>

      {/* Visibility Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Visibility Score</span>
          <span className={`text-lg font-bold font-mono ${scoreColor}`}>
            {visibilityScore}
            <span className="text-xs font-normal text-slate-500 ml-0.5">/100</span>
            <span className={`text-xs font-semibold ml-2 ${scoreColor}`}>
              {scoreLabel}
            </span>
          </span>
        </div>
        <ScoreBar score={visibilityScore} />
      </div>

      {/* Insights */}
      {(positiveRecs.length > 0 || negativeRecs.length > 0) && (
        <div className="space-y-2">
          {positiveRecs.map((rec) => (
            <div key={rec} className="flex items-start gap-2.5 text-sm">
              <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
              <span className="text-slate-300">{rec}</span>
            </div>
          ))}
          {negativeRecs.map((rec) => (
            <div key={rec} className="flex items-start gap-2.5 text-sm">
              <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
              <span className="text-slate-300">{rec}</span>
            </div>
          ))}
        </div>
      )}

      {/* Color breakdown */}
      <div className="space-y-2.5">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
          Color Breakdown
        </p>

        {colorCategories.blueViolet > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0">
              Blue/Violet
            </span>
            <BarFill percent={colorCategories.blueViolet} color="bg-blue-500" />
            <span className="text-xs text-slate-500 w-9 text-right font-mono">
              {colorCategories.blueViolet}%
            </span>
          </div>
        )}

        {colorCategories.green > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0">
              Green
            </span>
            <BarFill percent={colorCategories.green} color="bg-emerald-500" />
            <span className="text-xs text-slate-500 w-9 text-right font-mono">
              {colorCategories.green}%
            </span>
          </div>
        )}

        {colorCategories.redOrange > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0">
              Red/Orange
            </span>
            <BarFill percent={colorCategories.redOrange} color="bg-red-500" />
            <span className="text-xs text-slate-500 w-9 text-right font-mono">
              {colorCategories.redOrange}%
            </span>
          </div>
        )}

        {colorCategories.metallic > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0">
              Metallic/Chrome
            </span>
            <BarFill
              percent={colorCategories.metallic}
              color="bg-slate-300"
            />
            <span className="text-xs text-slate-500 w-9 text-right font-mono">
              {colorCategories.metallic}%
            </span>
          </div>
        )}

        {colorCategories.neutral > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0">
              Neutral/White
            </span>
            <BarFill percent={colorCategories.neutral} color="bg-slate-500" />
            <span className="text-xs text-slate-500 w-9 text-right font-mono">
              {colorCategories.neutral}%
            </span>
          </div>
        )}
      </div>

      {/* Fluorescent note */}
      <p className="text-xs text-slate-600 border-t border-blue-900/40 pt-4 leading-relaxed">
        Note: Fluorescent materials cannot be detected from photography. UV-reactive
        pigments may appear significantly brighter to pelagic fish than shown here.
      </p>

      <p className="text-xs text-slate-700">
        {species.citation}
      </p>
    </div>
  );
}
