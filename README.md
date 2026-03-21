# Pelagic Studio

**See your lures through a tuna's eyes.**

Pelagic Studio simulates how yellowfin tuna perceive fishing lures. Upload any lure photo and get a side-by-side comparison: human vision vs. tuna vision, with a depth slider that progressively filters wavelengths as light penetrates water. All processing runs client-side — no image data leaves your browser.

Live at [pelagicstudio.com](https://pelagicstudio.com)

---

## The Science

### Yellowfin Tuna Visual System

Yellowfin tuna (_Thunnus albacares_) are **photopic dichromats** — they have two cone pigment types for daylight color vision, compared to three in humans.

| Photoreceptor | λmax | Role |
|---|---|---|
| Twin cones | 485 nm (blue-green) | Dominant — brightness and motion |
| Single cones | 426 nm (violet) | Secondary — short-wavelength discrimination |
| Rods | 483 nm | Scotopic / low-light |

There are no long-wavelength cones. Red, orange, and most yellow are **functionally invisible** to tuna. Peak sensitivity sits in the 420–500 nm range (violet through blue-green).

_Source: Loew, McFarland & Margulies (2002) — Marine and Freshwater Behaviour and Physiology, Vol. 35, No. 4._

### Vision Simulation Algorithm

Each pixel is processed through the Govardovskii et al. (2000) visual pigment nomogram:

```
S(λ) = 1 / { exp[A·(a − λmax/λ)] + exp[B·(b − λmax/λ)] + exp[C·(c − λmax/λ)] + D }
```

Where `A=69.7`, `B=28`, `C=−14.9`, `D=0.674`, and `a` is a function of λmax. This gives a smooth bell curve of photoreceptor sensitivity centered on each cone's peak wavelength.

**Per-pixel pipeline:**
1. Extract RGB → convert to HSL
2. Map hue to approximate dominant wavelength (380–700 nm)
3. Apply Beer-Lambert depth attenuation to incoming light intensity
4. Calculate cone responses via the Govardovskii nomogram for each cone type
5. Weight by cone abundance (twin cones dominate)
6. Reconstruct a displayable color in the tuna's reduced color space

**Special cases:** metallic/chrome finishes (high lightness, low saturation) are detected and rendered as bright blue-white flashes — they reflect across the full spectrum and remain highly visible at depth.

### Depth Attenuation

Water selectively absorbs light by wavelength. The model uses Jerlov Type I open-ocean coefficients (Beer-Lambert law: `I(d) = I₀ × e^(−Kd × d)`):

| Wavelength band | Kd (per metre) | Effect at 50m |
|---|---|---|
| 420–460 nm (violet-blue) | 0.025 | ~29% transmitted |
| 460–500 nm (blue) | 0.020 | ~37% transmitted |
| 500–540 nm (blue-green) | 0.030 | ~22% transmitted |
| 540–580 nm (green-yellow) | 0.065 | ~4% transmitted |
| 580–620 nm (yellow-orange) | 0.130 | ~0.1% transmitted |
| 620–660 nm (orange-red) | 0.290 | effectively zero |
| 660–700 nm (red) | 0.430 | effectively zero |

_Source: Jerlov (1976)_

---

## Architecture

```
app/
├── routes/
│   ├── _index.tsx          # Main tool — upload, compare slider, controls
│   ├── about.tsx           # Methodology and research documentation
│   └── archive.tsx         # Sample lure archive
├── components/
│   ├── compare-slider.tsx  # Dual-canvas drag-to-reveal viewer
│   ├── depth-slider.tsx    # 0–200m depth control
│   ├── image-upload.tsx    # Drag & drop / file picker / paste
│   ├── contrast-analysis.tsx  # Visibility score + insights panel
│   ├── sample-gallery.tsx  # Pre-loaded CH150F sample lures
│   └── species-selector.tsx
├── lib/
│   ├── vision/
│   │   ├── algorithm.ts       # Core pixel processing (Govardovskii)
│   │   ├── color-science.ts   # RGB ↔ HSL, hue → wavelength mapping
│   │   ├── depth-filter.ts    # Jerlov Type I Beer-Lambert attenuation
│   │   ├── species-profiles.ts  # YFT cone sensitivity data
│   │   ├── worker.ts          # Web Worker entry point
│   │   └── types.ts
│   └── utils/
│       ├── canvas.ts          # Canvas rendering helpers
│       └── image.ts           # Image loading, validation, resizing
└── root.tsx
workers/
└── app.ts                     # Cloudflare Workers entry (SSR handler)
```

**Key design decisions:**
- All image processing runs in a **Web Worker** — the main thread never blocks during pixel computation
- The compare slider works via CSS `clip-path` only — canvases are painted once per image/depth change, not per frame
- SSR via React Router v7 on Cloudflare Workers — the landing page is server-rendered for SEO; the tool is fully client-side

---

## Stack

| | |
|---|---|
| Framework | React Router v7 (SSR, framework mode) |
| Runtime | Cloudflare Workers |
| UI | React 19, Tailwind CSS v4 |
| Build | Vite 7 + `@cloudflare/vite-plugin` |
| Language | TypeScript 5.9 (strict) |
| Package manager | pnpm |

---

## Development

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm typecheck    # tsc + react-router typegen
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Deployment

```bash
pnpm run build && pnpm exec wrangler deploy
```

Or via the package script:

```bash
pnpm deploy
```

Hosted on Cloudflare Workers. Domain configured via Cloudflare DNS dashboard.
