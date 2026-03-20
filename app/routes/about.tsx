import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Footer } from "~/components/footer";

export const meta: MetaFunction = () => [
  {
    title: "About & Methodology — Pelagic Studio",
  },
  {
    name: "description",
    content:
      "How Pelagic Studio simulates yellowfin tuna vision — the research, algorithms, and science behind the tool.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-10"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
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
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">
              Methodology
            </p>
            <h1 className="text-3xl font-bold text-white mb-4">
              How This Works
            </h1>
            <p className="text-slate-400 leading-relaxed">
              Pelagic Studio simulates how yellowfin tuna perceive fishing lures
              using peer-reviewed visual neuroscience. Every parameter in the
              model is grounded in published research — not guesswork.
            </p>
          </div>

          {/* Species */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Yellowfin Tuna Visual System
            </h2>
            <div className="bg-[#0d1426] border border-blue-900/40 rounded-xl p-6 space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                The primary source for this simulation is Loew, McFarland &
                Margulies (2002), which characterized the visual pigments of adult
                yellowfin tuna (
                <em className="text-slate-300">Thunnus albacares</em>) using
                microspectrophotometry.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Dichromatic — two cone types
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unlike humans (trichromatic), YFT have only two
                      photoreceptor pigments for daylight color vision.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Twin cones: λmax = 485 nm (blue-green)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The dominant channel. These are the primary
                      brightness and motion detectors — the most
                      important photoreceptors in the retina.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Single cones: λmax = 426 nm (violet)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The secondary channel, used for short-wavelength
                      discrimination. Less numerous than the twin cones.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      No long-wavelength cones
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      YFT have no red-sensitive photoreceptors. Red, orange,
                      and most yellow appear as dark grey or black.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Algorithm */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              The Vision Algorithm
            </h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <p>
                For each pixel in the uploaded image, the algorithm performs the
                following steps:
              </p>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>
                  <span className="text-slate-300">Extract RGB values</span>{" "}
                  and convert to HSL to estimate the pixel's dominant wavelength
                  in the visible spectrum (380–700nm).
                </li>
                <li>
                  <span className="text-slate-300">Apply depth attenuation</span>{" "}
                  using Jerlov Type I open ocean water coefficients. Red
                  wavelengths are absorbed ~21× faster than blue at the
                  selected depth.
                </li>
                <li>
                  <span className="text-slate-300">
                    Compute cone photoreceptor responses
                  </span>{" "}
                  using the Govardovskii et al. (2000) visual pigment nomogram
                  — a mathematically rigorous model of vertebrate photoreceptor
                  spectral sensitivity.
                </li>
                <li>
                  <span className="text-slate-300">Weight the responses</span>{" "}
                  by each cone type's relative abundance in the retina
                  (twin cones dominant at 0.85, single cones secondary at 0.35).
                </li>
                <li>
                  <span className="text-slate-300">
                    Reconstruct a displayable image
                  </span>{" "}
                  in the tuna's perceptual color space — necessarily blue-dominant,
                  with reds collapsed to near-black and blues/violets preserved.
                </li>
              </ol>
              <p className="text-slate-500 text-xs">
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
            <p className="text-sm text-slate-400 leading-relaxed">
              The depth slider applies the Beer-Lambert law of light attenuation
              through water: I(d) = I₀ × e^(−Kd × d), where Kd is the diffuse
              attenuation coefficient for each wavelength band. Coefficients are
              from Jerlov (1976) Type I water — clear open ocean conditions typical
              of offshore pelagic fishing grounds.
            </p>
            <div className="bg-[#0d1426] border border-blue-900/40 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-900/40">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Wavelength</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Color</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Kd (per m)</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">% at 10m</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">% at 50m</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["420–460 nm", "Violet-Blue", "0.025", "78%", "29%"],
                    ["460–500 nm", "Blue", "0.020", "82%", "37%"],
                    ["500–540 nm", "Blue-Green", "0.030", "74%", "22%"],
                    ["540–580 nm", "Green-Yellow", "0.065", "52%", "4%"],
                    ["580–620 nm", "Yellow-Orange", "0.130", "27%", "<1%"],
                    ["620–660 nm", "Orange-Red", "0.290", "6%", "~0%"],
                    ["660–700 nm", "Red", "0.430", "1%", "~0%"],
                  ].map(([wl, color, kd, at10, at50]) => (
                    <tr key={wl} className="border-b border-blue-900/20 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{wl}</td>
                      <td className="px-4 py-2.5 text-slate-500">{color}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">{kd}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-300">{at10}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-300">{at50}</td>
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
                  {" "}Developmental Changes in the Visual Pigments of the Yellowfin
                  Tuna, Thunnus albacares.
                </em>{" "}
                Marine and Freshwater Behaviour and Physiology, 35(4), 235–246.
              </p>
              <p className="leading-relaxed">
                Govardovskii, V.I., Fyhrquist, N., Reuter, T., Kuzmin, D.G. &
                Donner, K. (2000).
                <em className="text-slate-400">
                  {" "}In search of the visual pigment template.
                </em>{" "}
                Visual Neuroscience, 17(4), 509–528.
              </p>
              <p className="leading-relaxed">
                Jerlov, N.G. (1976).
                <em className="text-slate-400">
                  {" "}Marine Optics (2nd ed.).
                </em>{" "}
                Elsevier Oceanography Series 14, Amsterdam.
              </p>
            </div>
          </section>

          <div className="border-t border-blue-900/30 pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-150"
            >
              Try the tool
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
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
