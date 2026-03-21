import { allSpecies, comingSoonSpecies } from '~/lib/vision/species-profiles';
import type { SpeciesProfile } from '~/lib/vision/types';

interface SpeciesSelectorProps {
  selected: SpeciesProfile;
  onChange: (species: SpeciesProfile) => void;
  disabled?: boolean;
}

export function SpeciesSelector({
  selected,
  onChange,
  disabled = false,
}: SpeciesSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="species-select"
        className="text-sm font-medium text-slate-300"
      >
        Species
      </label>
      <div className="relative">
        <select
          id="species-select"
          value={selected.slug}
          onChange={(e) => {
            const species = allSpecies.find((s) => s.slug === e.target.value);
            if (species) onChange(species);
          }}
          disabled={disabled}
          className={[
            'w-full appearance-none rounded-lg border border-blue-900 bg-[#0d1426]',
            'px-3 py-2 pr-8 text-sm text-slate-200',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none',
            'transition-colors duration-150',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:border-blue-700',
          ].join(' ')}
          aria-label="Select fish species"
        >
          {allSpecies.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
          {comingSoonSpecies.map((name) => (
            <option key={name} value="" disabled>
              {name} (Coming Soon)
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        {selected.description}
      </p>
    </div>
  );
}
