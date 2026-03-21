interface DepthSliderProps {
  depth: number;
  onChange: (depth: number) => void;
  disabled?: boolean;
}

const DEPTH_MARKS = [0, 10, 25, 50, 100, 200];
const MAX_DEPTH = 200;

export function DepthSlider({
  depth,
  onChange,
  disabled = false,
}: DepthSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="depth-slider"
          className="text-sm font-medium text-slate-300"
        >
          Water Depth
        </label>
        <span className="font-mono text-sm font-semibold text-blue-400">
          {depth === 0 ? 'Surface' : `${depth}m`}
        </span>
      </div>

      <div className="relative">
        <input
          id="depth-slider"
          type="range"
          min={0}
          max={MAX_DEPTH}
          value={depth}
          onChange={handleChange}
          disabled={disabled}
          className="depth-slider w-full"
          aria-label={`Water depth: ${depth} meters`}
          aria-valuemin={0}
          aria-valuemax={MAX_DEPTH}
          aria-valuenow={depth}
        />

        {/* Depth marks */}
        <div className="relative mt-2 flex justify-between">
          {DEPTH_MARKS.map((mark) => (
            <button
              key={mark}
              onClick={() => !disabled && onChange(mark)}
              disabled={disabled}
              className={[
                'cursor-pointer text-xs transition-colors duration-150',
                depth === mark
                  ? 'font-semibold text-blue-400'
                  : 'text-slate-600 hover:text-slate-400',
                disabled ? 'cursor-not-allowed' : '',
              ].join(' ')}
              aria-label={`Set depth to ${mark}m`}
            >
              {mark === 0 ? '0m' : `${mark}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Depth context hint */}
      <p className="text-xs text-slate-600">
        {depth === 0 && 'Surface — full spectrum visible'}
        {depth > 0 && depth <= 10 && 'Shallow — reds beginning to fade'}
        {depth > 10 && depth <= 25 && 'Orange/red wavelengths largely absorbed'}
        {depth > 25 && depth <= 50 && 'Only green-blue remains visible'}
        {depth > 50 && depth <= 100 && 'Deep — blue-violet dominates'}
        {depth > 100 && 'Extreme depth — only blue-violet penetrates'}
      </p>
    </div>
  );
}
