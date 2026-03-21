import { allSpecies, comingSoonSpecies } from '~/lib/vision/species-profiles';
import type { SpeciesProfile, EvidenceLevel } from '~/lib/vision/types';

interface SpeciesSelectorProps {
  selected: SpeciesProfile;
  onChange: (species: SpeciesProfile) => void;
  disabled?: boolean;
}

function EvidenceDot({ level }: { level: EvidenceLevel }) {
  const color =
    level === 'direct-msp'
      ? 'bg-emerald-400'
      : level === 'congeneric-msp'
        ? 'bg-amber-400'
        : 'bg-orange-400';

  const label =
    level === 'direct-msp'
      ? 'Direct MSP'
      : level === 'congeneric-msp'
        ? 'Related species MSP'
        : 'Genomic inference';

  return (
    <span className="flex items-center gap-1.5" title={label}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-[9px] tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
    </span>
  );
}

function VisionBadge({ type }: { type: 'dichromat' | 'trichromat' }) {
  return (
    <span
      className={[
        'inline-block rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider uppercase',
        type === 'dichromat'
          ? 'bg-blue-500/15 text-blue-400'
          : 'bg-emerald-500/15 text-emerald-400',
      ].join(' ')}
    >
      {type === 'dichromat' ? '2-Cone' : '3-Cone'}
    </span>
  );
}

export function SpeciesSelector({
  selected,
  onChange,
  disabled = false,
}: SpeciesSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-[10px] tracking-widest text-zinc-500 uppercase"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Species
      </p>

      <div className="flex flex-col gap-2">
        {allSpecies.map((species) => {
          const isSelected = species.slug === selected.slug;
          return (
            <button
              key={species.slug}
              onClick={() => onChange(species)}
              disabled={disabled}
              className={[
                'w-full rounded-lg border p-3 text-left transition-all duration-150',
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className={[
                      'text-sm font-medium',
                      isSelected ? 'text-white' : 'text-zinc-300',
                    ].join(' ')}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {species.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 italic">
                    {species.scientificName}
                  </p>
                </div>
                <VisionBadge type={species.visionType} />
              </div>
              <div className="mt-2">
                <EvidenceDot level={species.evidenceLevel} />
              </div>
            </button>
          );
        })}

        {/* Coming soon */}
        {comingSoonSpecies.map((name) => (
          <div
            key={name}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 opacity-40"
          >
            <p
              className="text-sm text-zinc-500"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {name}
            </p>
            <span className="text-[9px] tracking-wider text-zinc-600 uppercase">
              Soon
            </span>
          </div>
        ))}
      </div>

      {/* Selected species description */}
      <div className="mt-1 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
        <p className="text-xs leading-relaxed text-zinc-400">
          {selected.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.cones.map((cone) => (
            <span
              key={cone.opsinClass}
              className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
            >
              {cone.opsinClass} {cone.lambdaMax}nm
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
