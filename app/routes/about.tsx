import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { Footer } from '~/components/footer';

export const meta: MetaFunction = () => [
  {
    title: 'About & Methodology — Pelagic Studio',
  },
  {
    name: 'description',
    content:
      'How Pelagic Studio simulates fish vision — the research, algorithms, and science behind the tool.',
  },
];

const SPECIES_DATA = [
  {
    name: 'Yellowfin Tuna',
    scientific: 'Thunnus albacares',
    visionType: 'Dichromat (2 cones)',
    evidence: 'Direct MSP',
    evidenceColor: 'bg-emerald-400',
    cones: [
      {
        label: 'Twin cones',
        lambda: '485 nm',
        color: 'bg-cyan-400',
        desc: 'Blue-green — dominant channel, primary brightness and motion detection',
      },
      {
        label: 'Single cones',
        lambda: '426 nm',
        color: 'bg-violet-400',
        desc: 'Violet — secondary channel, short-wavelength discrimination',
      },
    ],
    rods: '483 nm',
    notes:
      'No long-wavelength cones. Red, orange, and most yellow appear as dark grey or black.',
    citation:
      'Loew, McFarland & Margulies (2002). Developmental Changes in the Visual Pigments of the Yellowfin Tuna. Marine and Freshwater Behaviour and Physiology, 35(4), 235-246.',
  },
  {
    name: 'Giant Trevally',
    scientific: 'Caranx ignobilis',
    visionType: 'Dichromat (2 cones)',
    evidence: 'Related species MSP',
    evidenceColor: 'bg-amber-400',
    cones: [
      {
        label: 'Twin cones',
        lambda: '495 nm',
        color: 'bg-cyan-400',
        desc: 'Blue-green — ~10nm green-shifted from tuna, dominant channel',
      },
      {
        label: 'Single cones',
        lambda: '430 nm',
        color: 'bg-blue-400',
        desc: 'Blue — secondary channel',
      },
    ],
    rods: '495 nm',
    notes:
      'Similar to tuna but slightly green-shifted. Blind to red/orange. Inferred from yellowtail kingfish (Seriola lalandi) MSP data.',
    citation:
      'Nagloo, Hart & Collin (2016). The accessory optic system in yellowtail kingfish. Aquaculture, 474, 130-137.',
  },
  {
    name: 'Red Snapper',
    scientific: 'Lutjanus campechanus',
    visionType: 'Trichromat (3 cones)',
    evidence: 'Related species MSP',
    evidenceColor: 'bg-amber-400',
    cones: [
      {
        label: 'Double cone (RH2)',
        lambda: '520 nm',
        color: 'bg-green-400',
        desc: 'Green — dominant channel, enables green/chartreuse detection',
      },
      {
        label: 'Double cone (LWS)',
        lambda: '555 nm',
        color: 'bg-yellow-400',
        desc: 'Yellow-green — enables warm-color perception at shallow depths',
      },
      {
        label: 'Single cone (SWS2)',
        lambda: '440 nm',
        color: 'bg-blue-400',
        desc: 'Blue — short-wavelength discrimination',
      },
    ],
    rods: '497 nm',
    notes:
      'Can see greens, yellows, and some oranges that tuna cannot. LWS cone provides broader spectral range, especially at shallow depths.',
    citation:
      'Lythgoe, Muntz, Partridge, Shand & Williams (1994). The ecology of the visual pigments of snappers on the Great Barrier Reef. J Comp Physiol A, 174, 461-467.',
  },
  {
    name: 'Coral Grouper',
    scientific: 'Plectropomus leopardus',
    visionType: 'Trichromat (3 cones)',
    evidence: 'Genomic inference',
    evidenceColor: 'bg-orange-400',
    cones: [
      {
        label: 'Double cone (RH2)',
        lambda: '515 nm',
        color: 'bg-green-400',
        desc: 'Green — dominant channel, fine-tuned for reef background contrast',
      },
      {
        label: 'Double cone (LWS)',
        lambda: '555 nm',
        color: 'bg-yellow-400',
        desc: 'Yellow-green — warm-color detection for prey contrast',
      },
      {
        label: 'Single cone (SWS2)',
        lambda: '440 nm',
        color: 'bg-blue-400',
        desc: 'Blue — short-wavelength discrimination',
      },
    ],
    rods: '500 nm',
    notes:
      'Reef ambush predator. Highest uncertainty — no direct MSP data for any sport fishing grouper. Inferred from Epinephelus ERG + genomics.',
    citation:
      'Kim et al. (2015). ERG evaluation and opsin gene expression in longtooth grouper (E. bruneus). Marine and Freshwater Behaviour and Physiology, 48(6).',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-16">
        {/* Back */}
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to the tool
        </Link>

        <div className="space-y-12">
          <div>
            <p className="mb-3 text-xs font-medium tracking-widest text-slate-500 uppercase">
              Methodology
            </p>
            <h1 className="mb-4 text-3xl font-bold text-white">
              How This Works
            </h1>
            <p className="leading-relaxed text-slate-400">
              Pelagic Studio simulates how fish perceive fishing lures using
              peer-reviewed visual neuroscience. Every parameter in the model is
              grounded in published research — not guesswork.
            </p>
          </div>

          {/* Species Visual Systems */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Supported Species
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Each species profile is built from the best available evidence.
              Evidence quality varies — we clearly indicate the confidence level
              for each species.
            </p>

            {/* Evidence legend */}
            <div className="flex flex-wrap gap-4 rounded-lg border border-blue-900/40 bg-[#0d1426] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400">
                  Direct MSP — measured on the species
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-400">
                  Related species MSP — from a close relative
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-xs text-slate-400">
                  Genomic inference — gene expression + ERG
                </span>
              </div>
            </div>

            {SPECIES_DATA.map((species) => (
              <div
                key={species.scientific}
                className="space-y-4 rounded-xl border border-blue-900/40 bg-[#0d1426] p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {species.name}
                    </h3>
                    <p className="text-sm text-slate-500 italic">
                      {species.scientific}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${species.evidenceColor}`}
                    />
                    <span className="text-xs text-slate-400">
                      {species.evidence}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  {species.visionType} · Rods: {species.rods}
                </p>

                <div className="space-y-3">
                  {species.cones.map((cone) => (
                    <div key={cone.label} className="flex items-start gap-3">
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cone.color}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {cone.label}: λmax = {cone.lambda}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {cone.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-slate-500 italic">
                  {species.notes}
                </p>

                <p className="border-t border-blue-900/30 pt-3 text-xs text-slate-600">
                  {species.citation}
                </p>
              </div>
            ))}
          </section>

          {/* Algorithm */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              The Vision Algorithm
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-slate-400">
              <p>
                For each pixel in the uploaded image, the algorithm performs the
                following steps:
              </p>
              <ol className="list-inside list-decimal space-y-3 pl-2">
                <li>
                  <span className="text-slate-300">Extract RGB values</span> and
                  convert to HSL to estimate the pixel's dominant wavelength in
                  the visible spectrum (380-700nm).
                </li>
                <li>
                  <span className="text-slate-300">
                    Apply depth attenuation
                  </span>{' '}
                  using Jerlov Type I open ocean water coefficients. Red
                  wavelengths are absorbed ~21x faster than blue at the selected
                  depth.
                </li>
                <li>
                  <span className="text-slate-300">
                    Compute cone photoreceptor responses
                  </span>{' '}
                  using the Govardovskii et al. (2000) visual pigment nomogram —
                  a mathematically rigorous model of vertebrate photoreceptor
                  spectral sensitivity.
                </li>
                <li>
                  <span className="text-slate-300">Weight the responses</span>{' '}
                  by each cone type's relative abundance in the retina.
                  Dichromats use 2-cone mapping; trichromats use 3-cone mapping
                  with an additional LWS channel for warm-color perception.
                </li>
                <li>
                  <span className="text-slate-300">
                    Reconstruct a displayable image
                  </span>{' '}
                  in the species' perceptual color space. Dichromat output is
                  blue-dominant; trichromat output includes broader green/warm
                  tones.
                </li>
              </ol>
              <p className="text-xs text-slate-500">
                Note: Exact fish perception cannot be measured — we can only
                model it from physiological data. The output is the best
                scientific approximation, not a definitive rendering of
                subjective fish experience.
              </p>
            </div>
          </section>

          {/* Depth model */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Water Depth Model
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              The depth slider applies the Beer-Lambert law of light attenuation
              through water: I(d) = I₀ × e^(−Kd × d), where Kd is the diffuse
              attenuation coefficient for each wavelength band. Coefficients are
              from Jerlov (1976) Type I water — clear open ocean conditions
              typical of offshore pelagic fishing grounds.
            </p>
            <div className="overflow-hidden rounded-xl border border-blue-900/40 bg-[#0d1426]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-900/40">
                    <th className="px-4 py-3 text-left font-medium text-slate-500">
                      Wavelength
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">
                      Color
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">
                      Kd (per m)
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">
                      % at 10m
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">
                      % at 50m
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['420-460 nm', 'Violet-Blue', '0.025', '78%', '29%'],
                    ['460-500 nm', 'Blue', '0.020', '82%', '37%'],
                    ['500-540 nm', 'Blue-Green', '0.030', '74%', '22%'],
                    ['540-580 nm', 'Green-Yellow', '0.065', '52%', '4%'],
                    ['580-620 nm', 'Yellow-Orange', '0.130', '27%', '<1%'],
                    ['620-660 nm', 'Orange-Red', '0.290', '6%', '~0%'],
                    ['660-700 nm', 'Red', '0.430', '1%', '~0%'],
                  ].map(([wl, color, kd, at10, at50]) => (
                    <tr
                      key={wl}
                      className="border-b border-blue-900/20 last:border-0"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-400">
                        {wl}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{color}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">
                        {kd}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                        {at10}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                        {at50}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* References */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">References</h2>
            <div className="space-y-3 text-sm text-slate-500">
              <p className="leading-relaxed">
                Loew, E.R., McFarland, W.N. & Margulies, D. (2002).
                <em className="text-slate-400">
                  {' '}
                  Developmental Changes in the Visual Pigments of the Yellowfin
                  Tuna, Thunnus albacares.
                </em>{' '}
                Marine and Freshwater Behaviour and Physiology, 35(4), 235-246.
              </p>
              <p className="leading-relaxed">
                Nagloo, N., Hart, N.S. & Collin, S.P. (2016).
                <em className="text-slate-400">
                  {' '}
                  The accessory optic system and retinal topography of the
                  yellowtail kingfish (Seriola lalandi).
                </em>{' '}
                Aquaculture, 474, 130-137.
              </p>
              <p className="leading-relaxed">
                Lythgoe, J.N., Muntz, W.R.A., Partridge, J.C., Shand, J. &
                Williams, D.M. (1994).
                <em className="text-slate-400">
                  {' '}
                  The ecology of the visual pigments of snappers (Lutjanidae) on
                  the Great Barrier Reef.
                </em>{' '}
                J Comp Physiol A, 174, 461-467.
              </p>
              <p className="leading-relaxed">
                Kim, S.J. et al. (2015).
                <em className="text-slate-400">
                  {' '}
                  Electroretinographic evaluation and SWS1 opsin gene expression
                  in the vision of juvenile longtooth grouper (Epinephelus
                  bruneus).
                </em>{' '}
                Marine and Freshwater Behaviour and Physiology, 48(6).
              </p>
              <p className="leading-relaxed">
                Govardovskii, V.I., Fyhrquist, N., Reuter, T., Kuzmin, D.G. &
                Donner, K. (2000).
                <em className="text-slate-400">
                  {' '}
                  In search of the visual pigment template.
                </em>{' '}
                Visual Neuroscience, 17(4), 509-528.
              </p>
              <p className="leading-relaxed">
                Jerlov, N.G. (1976).
                <em className="text-slate-400">
                  {' '}
                  Marine Optics (2nd ed.).
                </em>{' '}
                Elsevier Oceanography Series 14, Amsterdam.
              </p>
              <p className="leading-relaxed">
                Cortesi, F. et al. (2020).
                <em className="text-slate-400">
                  {' '}
                  Visual system diversity in coral reef fishes.
                </em>{' '}
                Seminars in Cell & Developmental Biology, 106, 31-42.
              </p>
            </div>
          </section>

          <div className="border-t border-blue-900/30 pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-500"
            >
              Try the tool
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L14.586 11H3a1 1 0 1 1 0-2h11.586l-4.293-4.293a1 1 0 0 1 0-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
