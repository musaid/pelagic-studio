# Giant Trevally — _Caranx ignobilis_

## Summary

|                |                                                  |
| -------------- | ------------------------------------------------ |
| Vision type    | Dichromat (predicted adult)                      |
| Evidence level | Congeneric MSP (inferred from _Seriola lalandi_) |
| Habitat        | Reef-pelagic (reef edges, passes, open water)    |

## Photoreceptor Data

| Photoreceptor | Opsin | λmax (nm) | Type        | Sensitivity Weight | Basis                       |
| ------------- | ----- | --------- | ----------- | ------------------ | --------------------------- |
| Twin cone     | RH2   | **495**   | Double cone | 0.85 (dominant)    | Seriola MSP + tuna genomics |
| Single cone   | SWS2  | **430**   | Single cone | 0.35 (secondary)   | Seriola MSP                 |
| Rod           | RH1   | **495**   | Rod         | —                  | Marine predator consensus   |

**These values are inferred, not directly measured.** No published MSP or ERG study has directly measured _Caranx ignobilis_ photoreceptor spectral sensitivities.

## Evidence

### Why no direct data exists

The GT genome has been sequenced (Gallagher et al. 2022, including eye RNA-seq), but the opsin genes have not been individually characterized in a dedicated visual system publication. No MSP or ERG has been performed on GT retinal tissue.

### Phylogenetic inference chain

**Primary proxy — _Seriola lalandi_ (yellowtail kingfish):**

_Seriola lalandi_ is the only Carangidae species with published MSP data. Nagloo et al. (2016) performed MSP on larvae and sub-adults, finding:

- **Larvae:** UV single cones (SWS1, ~370-380 nm), MWS single cones (RH2, ~480-500 nm), MWS twin cones (RH2, ~490-510 nm), LWS twin cones (~540-560 nm)
- **Sub-adults/adults:** Loss of UV (SWS1) and LWS cones during ontogeny. Remaining system: SWS2 single cones (~420-440 nm) + RH2 twin cones (~490-510 nm)

This ontogenetic loss of UV and LWS sensitivity is a consistent pattern across large pelagic predatory fish.

**Supporting — Pacific bluefin tuna (_Thunnus orientalis_) genomics:**

Nakamura et al. (2013) characterized the complete opsin gene repertoire:

- SWS2 functional, expressed in single cones (λmax ~423-436 nm)
- RH2 dominant with 5 paralogs (λmax range ~460-515 nm)
- LWS present but low/no adult retinal expression
- RH1 blue-shifted (λmax ~480-492 nm)

Tuna and jacks share the Carangiformes clade, and their adult visual systems converge on a blue-green optimized dichromatic pattern.

**Supporting — pelagic predator consensus:**

Fritsches & Warrant (2004) found that most pelagic predators have maximum sensitivity between 458-522 nm. Bigeye tuna twin cones measured at λmax = 488 nm.

### Derivation of GT values

- **RH2 (495 nm):** Slightly green-shifted relative to YFT (485 nm), reflecting GT's reef-pelagic habitat. Seriola sub-adult twin cones sit at ~490-510 nm; 495 nm is the midpoint, and consistent with the general pelagic predator range.
- **SWS2 (430 nm):** Seriola sub-adults develop SWS2 single cones replacing UV cones. The ~420-440 nm range for SWS2 in Carangidae is consistent; 430 nm is the midpoint estimate.
- **Rods (495 nm):** Marine predator rods cluster around 490-500 nm (Losey et al. 2003). The rod and twin cone peaks being similar is typical (cf. YFT: rod 483, twin cone 485).

## Ecological Context

Giant trevally are apex predators that hunt on and around coral reefs — a unique niche between open-water pelagic and resident reef fish. Their visual system reflects this:

- **Blue-green optimization** matches both the blue open-water background and the blue-green light filtering through reef structures
- **Loss of LWS (red) sensitivity** is consistent with hunting at distance — red light scatters and attenuates rapidly in water, providing no useful contrast information beyond a few meters
- **SWS2 + RH2 dichromacy** enables discrimination of prey contrast against the blue-green reef/water background (Lythgoe's sensitivity hypothesis)

GT are fast-moving visual predators with likely high temporal resolution (flicker fusion frequency), similar to tuna and billfish.

For lure design:

- Blue, silver, and metallic finishes are optimal
- Greens may be slightly more visible to GT than to tuna (10 nm green-shift in RH2)
- Red and orange are invisible, as with tuna
- GT's reef-edge habitat means lures may be viewed against more varied backgrounds than open-ocean tuna

## Citations

1. **Nagloo, N., Hart, N.S. & Collin, S.P.** (2016). "Ontogenetic changes in spectral sensitivity and retinal topography in the retina of the yellowtail kingfish (_Seriola lalandi_): Implications for the global Seriola aquaculture industry." _Aquaculture_, 474, 130-137.

2. **Nakamura, Y. et al.** (2013). "Evolutionary changes of multiple visual pigment genes in the complete genome of Pacific bluefin tuna." _PNAS_, 110(27), 11061-11066.

3. **Gallagher, J.P. et al.** (2022). "Chromosome-level genome assembly of the giant trevally (_Caranx ignobilis_)." _GigaByte_. GenBank: JAFHLA000000000.

4. **Fritsches, K.A. & Warrant, E.J.** (2004). "Do tuna and billfish see colours?" _PFRP Newsletter_, 9(1).

5. **Losey, G.S. et al.** (2003). "Visual Biology of Hawaiian Coral Reef Fishes. I. Ocular Transmission and Visual Pigments." _Copeia_, 2003(3), 433-454.

6. **Munz, F.W. & McFarland, W.N.** (1973). "The significance of spectral position in the rhodopsins of tropical marine fishes." _Vision Research_, 13, 1829-1874.

## Gaps

- **No direct MSP or ERG data** for _Caranx ignobilis_. The GT genome with eye RNA-seq (Gallagher et al. 2022) is publicly available — a bioinformatics analysis could extract opsin gene presence and expression levels, which would significantly strengthen this profile.
- **Ontogenetic data** is missing entirely. We assume adult GT follow the Seriola pattern of losing UV and LWS sensitivity, but this is unverified.
- **Retinal topography** is unknown. The visual field organization (which part of the retina has highest acuity) would affect how GT perceive lures at different approach angles.
