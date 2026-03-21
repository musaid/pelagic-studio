# Methodology — Visual System Inference & Simulation

## Evidence Tier System

We classify species visual data into three tiers based on the directness and reliability of the evidence:

| Tier | Method | Description | Uncertainty |
|------|--------|-------------|-------------|
| **1 — Direct MSP** | Microspectrophotometry on target species | Individual photoreceptor absorbance measured directly. Gold standard. | ±5 nm λmax |
| **2 — Congeneric MSP** | MSP on closely related species in the same family | λmax values from a congener or confamilial species, adjusted for ecological context. | ±10–15 nm λmax |
| **3 — Genomic inference** | Opsin gene expression + ERG from related genera | No photoreceptor-level measurement. Cone classes inferred from opsin gene complement; λmax estimated from ERG peaks, known opsin tuning sites, or family-level averages. | ±15–25 nm λmax |

### Species evidence levels

| Species | Tier | Basis |
|---------|------|-------|
| Yellowfin Tuna (*Thunnus albacares*) | 1 — Direct MSP | Loew, McFarland & Margulies (2002) |
| Giant Trevally (*Caranx ignobilis*) | 2 — Congeneric MSP | *Seriola lalandi* MSP (Nagloo et al. 2016) + tuna genomics |
| Red Snapper (*Lutjanus campechanus*) | 2 — Congeneric MSP | 12 GBR *Lutjanus* spp. MSP (Lythgoe et al. 1994) |
| Coral Grouper (*Plectropomus leopardus*) | 3 — Genomic inference | *Epinephelus* ERG + opsin genomics (Kim et al. 2015) |

## Phylogenetic Inference Approach

When direct MSP data is unavailable for a target species, we use **phylogenetic bracketing** — inferring visual properties from the closest relatives with published data:

1. **Identify the target species' taxonomic position** (family, subfamily, genus)
2. **Find the closest relative with MSP or ERG data** — prioritize same-genus, then same-family, then same-order
3. **Assess ecological similarity** — habitat depth, water clarity, foraging strategy, and light environment constrain visual system evolution
4. **Apply known opsin tuning rules** — amino acid substitutions at key spectral tuning sites (e.g., position 122, 211, 261, 269, 292 in RH2) shift λmax predictably
5. **Cross-validate** against ERG data, behavioral studies, and opsin gene expression patterns where available

This approach is standard in fish visual ecology (Carleton et al. 2020; Musilova, Salzburger & Cortesi 2021).

### Limitations

- Phylogenetic distance increases uncertainty. Within-genus inference (e.g., *Lutjanus* → *Lutjanus*) is far more reliable than cross-genus (e.g., *Epinephelus* → *Plectropomus*).
- **Ontogenetic shifts** are common in reef fish — juveniles often express UV-sensitive (SWS1) opsins that adults lose. We model adult visual systems only.
- **Lens transmission** is rarely measured and can block UV even when SWS1 is expressed. We assume adults lack functional UV sensitivity unless proven otherwise.
- **Chromatic aberration** and **oil droplets** (present in some fish) can shift effective spectral sensitivity. These are not modeled.

## Govardovskii Visual Pigment Nomogram

All photoreceptor spectral sensitivity curves are generated using the **Govardovskii et al. (2000)** nomogram — a mathematical template that describes the absorbance spectrum of any vertebrate visual pigment given only its λmax.

**Reference:** Govardovskii, V.I., Fyhrquist, N., Reuter, T., Kuzmin, D.G. & Donner, K. (2000). "In search of the visual pigment template." *Visual Neuroscience*, 17(4), 509-528.

### Key properties

- **Universal template:** The shape of a visual pigment's absorbance spectrum is remarkably conserved across vertebrates. Only the peak wavelength (λmax) varies.
- **A1 rhodopsin assumption:** We model A1 (retinal₁) pigments, the dominant chromophore in marine fish. Freshwater fish often use A2 (3,4-didehydroretinal), which broadens and red-shifts the curve — not relevant for our marine species.
- **Alpha band:** The main absorbance peak, described by a polynomial function of λmax.
- **Beta band:** A secondary UV peak (~340 nm for most visual pigments), included in the model.

### Implementation

For each cone type, the nomogram generates a sensitivity curve S(λ) across the visible spectrum. A pixel's RGB values are converted to a spectral approximation, and each cone's response is computed as:

```
R_cone = ∫ S_cone(λ) · I(λ) · T_water(λ, depth) dλ
```

Where:
- `S_cone(λ)` = Govardovskii sensitivity curve for that cone type
- `I(λ)` = spectral power of the incident light (approximated from pixel RGB)
- `T_water(λ, depth)` = depth-dependent water transmission (Jerlov model)

## Depth Attenuation Model — Jerlov Type I

Water absorbs light wavelength-dependently. We use the **Jerlov (1976) Type I** classification — the clearest open-ocean water — as our baseline attenuation model.

**Reference:** Jerlov, N.G. (1976). *Marine Optics*. Elsevier Oceanography Series, 14.

### Attenuation coefficients

Light transmission at depth follows Beer-Lambert law:

```
T(λ, z) = exp(-K(λ) · z)
```

Where `K(λ)` is the diffuse attenuation coefficient (m⁻¹) and `z` is depth in meters.

| Wavelength | Color | K(λ) (m⁻¹) | % at 10m | % at 50m | % at 100m |
|-----------|-------|-------------|----------|----------|-----------|
| 400 nm | Violet | 0.02 | 82% | 37% | 14% |
| 450 nm | Blue | 0.015 | 86% | 47% | 22% |
| 500 nm | Blue-green | 0.025 | 78% | 29% | 8% |
| 550 nm | Green | 0.05 | 61% | 8% | 0.7% |
| 600 nm | Orange | 0.12 | 30% | 0.2% | ~0% |
| 650 nm | Red | 0.30 | 5% | ~0% | ~0% |
| 700 nm | Deep red | 0.65 | 0.1% | ~0% | ~0% |

### Key implications for lure design

- **Red is invisible below ~15m** regardless of the fish's visual capability
- **Blue penetrates deepest** — blue lures maintain visibility at extreme depth
- **Green is intermediate** — visible to ~40-50m in clear water
- **This is physics, not biology** — attenuation applies equally to all species

### Coastal vs. offshore

Jerlov Type I represents ideal oceanic conditions. Coastal waters (Types II, III, and beyond) have higher attenuation due to dissolved organic matter (CDOM) and particulates, which preferentially absorb blue light. In turbid coastal water:
- Blue attenuation increases significantly
- Green becomes the deepest-penetrating wavelength
- Visibility range decreases at all wavelengths

We use Type I as a conservative baseline suitable for offshore pelagic fishing. Coastal reef scenarios (grouper, snapper) would benefit from Type II-III modeling in future updates.

## RGB-to-Spectrum Approximation

Photographs provide RGB values, not spectral power distributions. We approximate the spectral content of each pixel using a **weighted Gaussian basis function** approach:

- Red channel → Gaussian centered at ~620 nm
- Green channel → Gaussian centered at ~530 nm
- Blue channel → Gaussian centered at ~460 nm

This is an inherent limitation: a photograph cannot distinguish metameric colors (different spectra that appear identical to human trichromatic vision). For example, a "yellow" pixel could be narrow-band 580 nm (highly visible to trichromat fish) or a red+green mix (partially visible). We assume broadband illumination typical of daylight photography.

## Sensitivity Weighting

Each cone type has an associated **sensitivity weight** reflecting its relative contribution to the fish's visual perception:

- **Twin/double cones** receive higher weights (0.6–0.85) because they are more abundant in the retina and are the primary mediators of luminance and motion detection
- **Single cones** receive lower weights (0.25–0.35) as they are less numerous but contribute to chromatic (color) discrimination
- **Rods** are not weighted in the photopic (daylight) model — they saturate in bright light and contribute primarily in scotopic (dim) conditions

Weights are estimated from retinal mosaic studies where available, and from general teleost retinal architecture patterns otherwise.

## General References

1. **Carleton, K.L., Escobar-Camacho, D., Stieb, S.M., Cortesi, F. & Marshall, N.J.** (2020). "Seeing the rainbow: mechanisms underlying spectral sensitivity in teleost fishes." *Journal of Experimental Biology*, 223(8), jeb193334.

2. **Musilova, Z., Salzburger, W. & Cortesi, F.** (2021). "The visual opsin gene repertoires of teleost fishes: evolution, ecology, and function." *Annual Review of Cell and Developmental Biology*, 37, 441-468.

3. **Munz, F.W. & McFarland, W.N.** (1973). "The significance of spectral position in the rhodopsins of tropical marine fishes." *Vision Research*, 13(10), 1829-1874.

4. **Lythgoe, J.N.** (1979). *The Ecology of Vision*. Oxford University Press.

5. **Govardovskii, V.I. et al.** (2000). "In search of the visual pigment template." *Visual Neuroscience*, 17(4), 509-528.

6. **Jerlov, N.G.** (1976). *Marine Optics*. Elsevier Oceanography Series, 14.

7. **Schweikert, L.E. & Caves, E.M.** (2018). "Variation in rod spectral sensitivity of fishes is best predicted by habitat and depth." *Journal of Fish Biology*.

8. **Marshall, N.J., Cortesi, F., de Busserolles, F., Siebeck, U.E. & Cheney, K.L.** (2019). "Colours and colour vision in reef fishes: Past, present and future research directions." *Journal of Fish Biology*, 95(1), 5-38.
