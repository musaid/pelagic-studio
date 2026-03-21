# Pelagic Studio — Initial Build Prompt (ARCHIVED)

> **This file is archived. Do not use as active instructions.**
>
> This is the original prompt used to scaffold Pelagic Studio before development began. It captures the intended design, algorithm specification, and MVP scope as defined at project inception. The codebase has since evolved — the source code and README are the authoritative references for the current state of the project.

---

# Pelagic Studio — Claude Code Build Prompt

## Project Overview

Build **Pelagic Studio** (pelagicstudio.com) — a web app that simulates how pelagic fish (starting with yellowfin tuna) perceive fishing lures. Users upload a lure photo and see a side-by-side comparison: human vision vs. what the fish actually sees, with a depth slider that progressively filters wavelengths as light penetrates water.

The tagline: **"See Your Lures Through A Tuna's Eyes"**

This is an MVP. Ship fast, keep it tight. No auth, no database, no backend processing — everything runs client-side via Canvas API. The only server involvement is SSR for the landing page (SEO).

---

## Tech Stack & Bootstrap

**Template:** React Router v7 on Cloudflare Workers

```bash
pnpm dlx create-react-router@latest --template remix-run/react-router-templates/cloudflare pelagic-studio
```

**Stack:**
- React Router v7 (framework mode, SSR)
- TypeScript (strict, explicit types, no `any`/`unknown`)
- Tailwind CSS v4
- Vite + `@cloudflare/vite-plugin`
- Cloudflare Workers deployment via `wrangler deploy`
- Canvas API for all image processing (client-side only)
- Web Workers for off-main-thread pixel processing

**Conventions:**
- Functional components only, small (<200 lines), single responsibility
- Early returns over nested conditions
- Descriptive variable names with context
- Modern React 19 hooks where applicable (useTransition for processing states)
- No OOP, no class components
- pnpm as package manager

---

## Project Structure

```
pelagic-studio/
├── app/
│   ├── routes/
│   │   ├── _index.tsx              # Landing page + main tool
│   │   ├── about.tsx               # About/methodology page
│   │   └── species.$slug.tsx       # Species vision profile pages (future)
│   ├── components/
│   │   ├── hero.tsx                # Landing hero section
│   │   ├── image-upload.tsx        # Drag & drop / file picker / paste
│   │   ├── compare-slider.tsx       # Drag-to-reveal before/after canvas overlay
│   │   ├── depth-slider.tsx        # Depth control (0-200m)
│   │   ├── species-selector.tsx    # Species dropdown (YFT only for MVP)
│   │   ├── contrast-analysis.tsx   # "Why this works" explanation panel
│   │   ├── sample-gallery.tsx      # Pre-loaded lure images to try
│   │   └── footer.tsx
│   ├── lib/
│   │   ├── vision/
│   │   │   ├── types.ts            # All vision-related types
│   │   │   ├── algorithm.ts        # Core RGB→fish-vision conversion
│   │   │   ├── color-science.ts    # RGB↔HSL, wavelength mapping utilities
│   │   │   ├── depth-filter.ts     # Water column spectral attenuation
│   │   │   ├── species-profiles.ts # Per-species cone sensitivity data
│   │   │   └── worker.ts           # Web Worker for pixel processing
│   │   └── utils/
│   │       ├── canvas.ts           # Canvas helper utilities
│   │       └── image.ts            # Image loading/resizing utilities
│   └── styles/
│       └── app.css                 # Tailwind imports + custom properties
├── public/
│   ├── gallery/                    # Sample lure images (3-5 popular lures)
│   ├── og-image.png                # Social sharing image
│   └── favicon.svg
├── workers/
│   └── app.ts                      # Cloudflare Worker entry (from template)
├── wrangler.jsonc
├── vite.config.ts
└── tsconfig.json
```

---

## Core Algorithm — Vision Science

This is the most important part. The algorithm must be grounded in real research, not guesswork.

### Yellowfin Tuna (Thunnus albacares) Visual System

**Source:** Loew, McFarland & Margulies (2002) "Developmental Changes in the Visual Pigments of the Yellowfin Tuna, Thunnus albacares" — Marine and Freshwater Behaviour and Physiology, Vol. 35, No. 4, pp. 235-246.

**Key findings for adult YFT:**
- **Photopic dichromat** — two cone pigment types for daylight color vision
- **Twin cones:** λmax = 485 nm (blue-green, dominant — these are the primary brightness/motion detectors)
- **Single cones:** λmax = 426 nm (violet — secondary, for short-wavelength discrimination)
- **Rods:** λmax = 483 nm (scotopic/low-light, similar to twin cones)
- No long-wavelength cones at all — red, orange, and most yellow are functionally invisible
- Peak sensitivity in the 420-500nm range (violet through blue-green)
- The twin cones dominate the retina — the 485nm channel carries most visual information

### Vision Simulation Algorithm

```typescript
// types.ts

interface ConeType {
  name: string;
  lambdaMax: number;        // Peak sensitivity wavelength in nm
  peakSensitivity: number;  // Relative weight (0-1) in visual system
  halfBandwidth: number;    // nm, approximate half-max bandwidth
}

interface SpeciesProfile {
  slug: string;
  name: string;
  scientificName: string;
  cones: ConeType[];
  rodLambdaMax: number;
  description: string;
  citation: string;
}

interface DepthAttenuation {
  depth: number;           // meters
  // Attenuation coefficients per wavelength band (Jerlov Type I open ocean water)
  // Higher = more attenuation = less light reaches that depth
  coefficients: WavelengthAttenuation[];
}

interface WavelengthAttenuation {
  wavelengthRange: [number, number]; // nm
  attenuationCoeff: number;          // per meter (Kd)
}
```

```typescript
// species-profiles.ts

const yellowfinTuna: SpeciesProfile = {
  slug: "yellowfin-tuna",
  name: "Yellowfin Tuna",
  scientificName: "Thunnus albacares",
  cones: [
    {
      name: "Twin Cone (Blue-Green)",
      lambdaMax: 485,
      peakSensitivity: 0.85,  // Dominant channel
      halfBandwidth: 45,
    },
    {
      name: "Single Cone (Violet)",
      lambdaMax: 426,
      peakSensitivity: 0.35,  // Secondary channel
      halfBandwidth: 35,
    },
  ],
  rodLambdaMax: 483,
  description: "Dichromatic vision optimized for the blue open ocean. Highly sensitive to blue-green wavelengths (485nm), with a secondary violet channel (426nm). Effectively blind to red and orange.",
  citation: "Loew, McFarland & Margulies (2002)",
};
```

### Algorithm Steps (algorithm.ts)

For each pixel in the uploaded image:

1. **Read RGB** → extract R, G, B values (0-255)
2. **Convert RGB to approximate dominant wavelength** — use HSL hue angle to map to visible spectrum wavelength (380-700nm). This is an approximation since RGB→wavelength isn't 1:1, but it's good enough for the visual effect.
3. **Calculate cone responses** — for each cone type, compute the Govardovskii visual pigment template response at that wavelength:
   - Use the Govardovskii et al. (2000) nomogram template for vertebrate visual pigments
   - `S(λ) = 1 / { exp[A * (a - λmax/λ)] + exp[B * (b - λmax/λ)] + exp[C * (c - λmax/λ)] + D }`
   - Where A=69.7, a=0.8795+0.0459*exp(-(λmax-300)²/11940), B=28, b=0.922, C=-14.9, c=1.104, D=0.674
   - This gives a smooth bell curve of sensitivity centered on λmax
4. **Weight cone responses** — multiply each cone's response by its `peakSensitivity` weight
5. **Generate output color** — the fish sees a reduced color space. Map the weighted cone responses back to a displayable color:
   - The 485nm cone response maps to a blue-green channel
   - The 426nm cone response maps to a violet-blue channel
   - Combine into a blue-dominated output with reduced saturation
   - Brightness = weighted sum of cone responses (normalized)
6. **Apply depth attenuation** (if depth > 0) — before step 3, filter the input wavelength's intensity based on water column absorption at the selected depth

### Depth Attenuation Model (depth-filter.ts)

Use Jerlov Type I (clear open ocean) water attenuation coefficients:

```typescript
// Diffuse attenuation coefficients Kd (per meter) for Jerlov Type I water
// Source: Jerlov (1976), adapted from various oceanographic references
const jerlovTypeI: WavelengthAttenuation[] = [
  { wavelengthRange: [380, 420], attenuationCoeff: 0.040 },  // UV-Violet: moderate
  { wavelengthRange: [420, 460], attenuationCoeff: 0.025 },  // Violet-Blue: low (most penetrating)
  { wavelengthRange: [460, 500], attenuationCoeff: 0.020 },  // Blue: lowest attenuation
  { wavelengthRange: [500, 540], attenuationCoeff: 0.030 },  // Blue-Green: low
  { wavelengthRange: [540, 580], attenuationCoeff: 0.065 },  // Green-Yellow: moderate
  { wavelengthRange: [580, 620], attenuationCoeff: 0.130 },  // Yellow-Orange: high
  { wavelengthRange: [620, 660], attenuationCoeff: 0.290 },  // Orange-Red: very high
  { wavelengthRange: [660, 700], attenuationCoeff: 0.430 },  // Red: extreme
];

// Light intensity at depth: I(d) = I(0) * exp(-Kd * d)
// At 10m: red light is at ~5% of surface, blue is at ~82%
// At 50m: red is effectively 0%, blue is at ~37%
// At 100m: only blue-violet remains
```

### Special Cases

- **Metallic/Chrome finishes:** Detect pixels with high lightness (>0.7) and low-medium saturation (<0.3). These reflect across all wavelengths, so they remain visible to tuna as bright flashes. Map to high-brightness blue-white.
- **Pure white:** Map to medium-brightness blue-grey (white reflects all wavelengths, tuna sees it through their blue-dominant system)
- **Pure black:** Keep black (absence of light is absence of light regardless of visual system)
- **Fluorescent colors:** Cannot be detected from a photo, but add a note in the UI that fluorescent materials may appear differently

### Web Worker Implementation (worker.ts)

Process pixel data off the main thread to keep UI responsive:

```typescript
// The worker receives ImageData and returns processed ImageData
// Message protocol:
// Main → Worker: { type: "process", imageData: ImageData, species: SpeciesProfile, depth: number }
// Worker → Main: { type: "result", imageData: ImageData, stats: ContrastStats }
// Worker → Main: { type: "progress", percent: number }

// ContrastStats should include:
// - dominantWavelength: estimated dominant wavelength of the lure
// - visibilityScore: 0-100, how visible is this lure to the species
// - brightnessRetention: what % of brightness is preserved
// - colorCategories: breakdown of pixel colors (% red, orange, yellow, green, blue, violet)
// - recommendations: string[] of insights ("Red accents invisible", "Blue contrast preserved", etc.)
```

---

## UI / UX Design

### Design Language

- **Dark theme** — deep ocean aesthetic. Background: near-black with subtle blue undertone (#0a0e17)
- **Accent colors:** Electric blue (#3b82f6), cyan (#06b6d4), white text
- **Typography:** System font stack, clean and technical. Not playful — this is a research tool aesthetic
- **Minimal chrome** — let the images be the focus
- **No decorative illustrations** — the lure images ARE the content
- **Responsive** — works on mobile and desktop identically. The compare slider is a single stacked-canvas component that adapts to any width — no layout changes needed between breakpoints, just sizing.

### Landing Page (_index.tsx)

The landing page IS the tool. No separate "app" page. Scroll flow:

1. **Hero section** — headline, subheadline, CTA to scroll down or upload
   - "See Your Lures Through A Tuna's Eyes"
   - "Upload any lure photo. Discover what predators actually see — backed by peer-reviewed visual neuroscience."
   - Two CTAs: "Upload Your Lure" (scrolls to tool) + "Try a Sample" (loads gallery)

2. **Tool section** — the main event. This is a single unified component area, not a split layout.

   **Upload state:** Full-width upload zone (drag & drop, click to browse, paste from clipboard). Clean, minimal, with a subtle dashed border and icon. The upload zone IS the canvas area — once an image is loaded, the upload zone transforms into the compare viewer seamlessly.

   **Compare state:** Once an image is loaded, display the **Compare Slider** — a single image canvas with a draggable vertical divider. Left side shows the original (human vision), right side shows the processed (tuna vision). The user drags the handle to reveal more of either side. This is fundamentally superior to side-by-side because you see the exact same pixel region transform in-place.

   **Controls strip** below the compare viewer (horizontal row on desktop, stacked on mobile):
   - Species selector (YFT pre-selected, others greyed with "Coming Soon")
   - Depth slider: 0m → 200m with labeled marks at 0, 10, 25, 50, 100, 200m
   - "Upload New" button to reset

   **Analysis panel** below controls:
   - Contrast analysis ("Why This Works" / "Why This Doesn't")

### Compare Slider Component (compare-slider.tsx)

This is the centerpiece of the entire app. It must feel premium and buttery smooth.

**Architecture:** Two `<canvas>` elements stacked via absolute positioning inside a relatively positioned container. The top canvas (processed/tuna vision) is clipped using `clip-path: inset(0 0 0 {sliderPosition}px)` or by drawing only the right portion. The bottom canvas (original) is always fully visible. A draggable divider line sits at the clip boundary.

**The divider handle:**
- A thin vertical line (2px, white, 80% opacity) spanning the full height of the image
- At its center, a circular grab handle (40px diameter, white with subtle backdrop blur and drop shadow)
- Inside the handle: a left/right arrow icon (◂ ▸) or simple grip lines
- The handle should have a subtle glow or ring to make it obvious it's interactive
- On hover: handle scales up slightly (1.1x), cursor changes to `col-resize`
- While dragging: handle gets a more prominent glow/ring, the line becomes slightly brighter

**Interaction model:**
- **Mouse:** `pointerdown` on handle or anywhere on the image starts drag. `pointermove` updates position. `pointerup` stops. Use pointer events (not mouse events) for unified mouse/touch/pen support.
- **Touch:** Same pointer events handle this automatically. Ensure `touch-action: none` on the container to prevent scroll interference during drag.
- **Keyboard:** When the slider container is focused, left/right arrow keys move the divider by 1% per press. Hold shift for 10% jumps. Add `tabindex="0"` and `role="slider"` with proper `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label`.
- **Click-to-jump:** Clicking/tapping anywhere on the image (not just the handle) immediately jumps the divider to that x position with a short ease-out transition (~150ms).
- **Boundary clamping:** Divider cannot go past 2% or 98% of container width — always leave a sliver of each side visible so the user understands both images exist.

**Labels:**
- Small floating labels at top-left ("Human Vision") and top-right ("Tuna Vision") of the image
- These should be semi-transparent pill badges (background: rgba(0,0,0,0.6), backdrop-filter: blur(4px))
- Labels fade out after 3 seconds of no interaction, fade back in when the user touches/hovers the slider
- On mobile, labels should be smaller and positioned just below the top edge

**Initial state:** Divider starts at 50% (center). After first processing completes, animate the divider from 0% → 50% over ~600ms with an ease-out curve. This "reveal" animation serves as a visual tutorial — the user immediately understands they can drag it.

**Processing transition:** When depth changes trigger reprocessing:
- Don't flash or blank the processed canvas
- Keep the previous processed image visible while the worker processes
- Once the new ImageData is ready, paint it in a single frame — no visible flicker
- Optionally add a very subtle shimmer/pulse on the divider line during processing to signal activity

**Responsive sizing:**
- Container is full-width of its parent with a max-width (e.g., 800px) and auto horizontal margins
- Aspect ratio is locked to the uploaded image's native aspect ratio using `aspect-ratio` CSS property
- On very tall images (portrait), cap the container height at ~70vh and add subtle letterboxing
- The canvas elements render at the actual image resolution but the container scales them down via CSS — this keeps the visual crisp on retina displays

**Performance requirements:**
- Divider position updates must be RAF-synced (requestAnimationFrame) — never lag behind the pointer
- Use `will-change: clip-path` or `will-change: transform` on the clipped canvas for GPU compositing
- The canvases should be rendered ONCE per image/depth change, not per frame — the slider only changes CSS clip, it doesn't re-render pixels
- Pointer events during drag should use `{ passive: false }` to prevent scroll, but the slider itself is pure CSS movement — no canvas redraws during drag

```typescript
// compare-slider.tsx — key props interface

interface CompareSliderProps {
  originalImageData: ImageData | null;   // Human vision (always the raw upload)
  processedImageData: ImageData | null;  // Tuna vision (from Web Worker)
  isProcessing: boolean;                 // Show subtle activity indicator
  imageWidth: number;
  imageHeight: number;
}

// Internal state:
// - sliderPosition: number (0-1, where 0 = fully original, 1 = fully processed)
// - isDragging: boolean
// - labelsVisible: boolean (auto-hide timer)
// - hasRevealAnimated: boolean (one-time intro animation)
```

3. **Sample gallery** — 3-5 clickable lure thumbnails users can try instantly
   - Include a mix: one blue/silver lure (should score well), one red/pink (should score poorly), one multicolor
   - Clicking a sample loads it into the tool immediately

4. **Science section** — brief explanation of the methodology
   - What dichromatic vision means
   - Why blue/silver lures dominate offshore
   - Link to the Loew et al. (2002) paper
   - "Built for anglers, by an angler. Grounded in peer-reviewed research."

5. **Footer** — minimal. "Built by Pelagic Studio" + link to about page

### Contrast Analysis Panel (contrast-analysis.tsx)

After processing, show actionable insights:

```
LURE ANALYSIS — Yellowfin Tuna at 15m depth

Visibility Score: 72/100 ████████████████████░░░░░

✓ Strong blue-green contrast — highly visible in the 460-500nm range
✓ Metallic flash preserved — chrome reflects across spectrum
✗ Red skirt appears black — invisible below 10m
✗ Orange accents lost — attenuated rapidly with depth

Color Breakdown:
  Blue/Violet (visible):  45% ██████████░░░░░░░░░░
  Green (partial):        20% ████░░░░░░░░░░░░░░░░
  Red/Orange (invisible): 35% ███████░░░░░░░░░░░░░
```

Use color-coded indicators: green checkmarks for positive traits, red X for negatives.

---

## Image Upload Component (image-upload.tsx)

Support three input methods:
1. **Drag & drop** — drop zone with visual feedback
2. **File picker** — click to open file dialog, accept image/*
3. **Clipboard paste** — listen for paste events with image data

Constraints:
- Max file size: 10MB (client-side check)
- Accepted formats: JPEG, PNG, WebP
- Resize to max 1200px on longest edge before processing (performance)
- Show a loading/processing state with progress from the Web Worker

---

## Performance Considerations

- **Web Worker for pixel processing** — never block the main thread. A 1200x800 image is ~960k pixels to process.
- **Debounce depth slider** — reprocess on change, but debounce at ~100ms
- **Progressive rendering** — show original image immediately, process in background, reveal result with a smooth transition
- **No server round-trips for processing** — everything in the browser
- **Lazy load the science section and gallery** — prioritize the tool

---

## SEO & Meta

- Title: "Pelagic Studio — See Your Lures Through A Tuna's Eyes"
- Description: "Upload any fishing lure photo and see what yellowfin tuna actually see. Science-backed vision simulation for serious offshore anglers."
- OG image: Pre-rendered comparison showing a lure in human vs tuna vision
- Canonical: https://pelagicstudio.com
- Add JSON-LD structured data (WebApplication schema)

---

## Deployment

- Hosted on Cloudflare Workers via `wrangler deploy`
- Domain: pelagicstudio.com (configure in Cloudflare DNS dashboard)
- No environment variables needed for MVP (all client-side)
- wrangler.jsonc `name` field: "pelagic-studio"
- Ensure `compatibility_date` is set to a recent date

---

## What NOT to Build (MVP scope)

- No user accounts or auth
- No server-side image processing
- No database
- No sharing/permalink system (Phase 2)
- No multiple species yet — YFT only, others show "Coming Soon"
- No catch report / community features
- No analytics (add Plausible later)
- No email capture or newsletter
- No payment or premium features

---

## Implementation Order

1. Bootstrap the project with the Cloudflare template
2. Set up Tailwind, dark theme, base layout with responsive shell
3. Build `lib/vision/` — types, color science utilities, species profiles, the core algorithm, depth filter, and the Web Worker
4. Build `image-upload.tsx` — drag & drop, file picker, paste support
5. Build `compare-slider.tsx` — the dual-canvas drag-to-reveal viewer with pointer events, keyboard support, intro animation, and label auto-hide
6. Build `depth-slider.tsx` — slider control wired to reprocessing
7. Build `contrast-analysis.tsx` — stats panel with visibility score + insights
8. Build the landing page layout — hero, tool section, gallery, science section
9. Add 3-5 sample lure images to the gallery
10. Write the about/methodology page
11. SEO meta tags, OG image, favicon
12. Test on mobile, verify performance with large images
13. Deploy to Cloudflare Workers

Work through these sequentially. Get each piece working before moving to the next. Do not scaffold placeholder components — implement fully as you go.
