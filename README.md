# Xai — Intelligence Workspace

> *From raw data → structured intelligence → actionable insight → AI Automations*

A high-fidelity interactive product experience built for the RacoAI frontend engineering challenge. Designed and implemented to demonstrate UI/UX clarity, advanced motion & 3D interaction, and engineering discipline.

---

## Live Demo

**[xai-workspace.vercel.app](https://xai-workspace.vercel.app)** ← Deploy URL goes here

---

## Tech Stack

| Layer         | Technology                                                    |
|---------------|---------------------------------------------------------------|
| Framework     | **Next.js 14** (App Router, TypeScript)                       |
| 3D / WebGL    | **Three.js** + **React Three Fiber** + **@react-three/drei** |
| Post-Process  | **@react-three/postprocessing** (Bloom, Chromatic Aberration) |
| UI Animation  | **Framer Motion** (layout animations, AnimatePresence)        |
| Scroll FX     | **GSAP** + **ScrollTrigger** (pinning, scrubbing, timelines)  |
| Styling       | **Tailwind CSS** + custom CSS utilities                       |
| Icons         | **Lucide React**                                              |
| Fonts         | **Inter** (UI) + **JetBrains Mono** (data/code)              |
| Deployment    | **Vercel**                                                    |

---

## Getting Started

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Production build:
```bash
npm run build && npm start
```

---

## Sections & Features

### 1. Hero — Data → Intelligence
- **5,000-particle custom shader system** using `ShaderMaterial` with per-vertex size variation, opacity, and additive glow
- Particles morph from **chaotic sphere distribution → structured grid** on scroll — representing the raw-to-intelligence transformation
- **Constellation connecting lines** drawn between nearby particles (visible in chaos state, fade as grid forms)
- **Bloom post-processing** via `@react-three/postprocessing` for organic glow
- Real-time **mouse parallax** — camera rotation follows cursor position via ref (no re-renders)
- Framer Motion **stagger entrance** with blur-fade-up animations (badge → headline → subtext → CTAs)
- Reusable `<Badge>` and `<GlowButton>` components

### 2. Scroll-Pinned Insight Flow
- **GSAP ScrollTrigger** with `pin: true` and `scrub: 0.8` — section pins to viewport for **300vh of scroll distance**
- Three scroll-driven stages (0–33% / 33–66% / 66–100%):
  - **Ingest Data** — Animated SVG data stream with 24 orbiting particles converging inward
  - **Analyze with AI** — Animated neural network nodes with connection lines drawing progressively
  - **Generate Insight** — Animated bar chart with trend line and insight badges appearing
- All SVG animations are **driven by scroll progress** (0–1 normalized value), not timers
- Animated **progress bar** tracks current stage
- `layoutId` **spring-animated tab indicator** between stages

### 3. Intelligence Dashboard Preview
- Full **mock product UI**: sidebar nav, top bar, metric cards, chart, data table, signal feed, automation toggles
- **Glassmorphism panels** with `backdrop-filter: blur(20px)` and layered box-shadows
- **Animated number counters** — metric values count up from 0 on scroll enter (custom `useAnimatedCounter` hook with easeOutExpo)
- **Sparkline mini-charts** inline in each metric card
- Bar chart with **animated bars** (scaleY spring on enter) + hover highlight + tooltips
- Confidence bar **progressive fill** animations with color coding (green/blue/yellow thresholds)
- `AnimatePresence` **tab switching** (Overview / Signals / Automations)
- All data centralized in `lib/data.ts`

### 4. Signature Interaction — Morphing Point Cloud (WOW Moment)
- **4,000-particle mesh** that smoothly morphs between three mathematical forms:
  - **Sphere** → Raw Data (random surface distribution)
  - **Cube** → Structured Intelligence (6-face surface distribution)
  - **Torus** → Continuous Flow (parametric torus distribution)
- **Custom vertex-colored shader** — colors lerp smoothly (blue → purple → green) as form transitions
- **Dynamic wireframe lines** — connecting line segments between nearby particles, rebuilt each frame
- **Mouse repulsion field** — particles push away from cursor position using distance-based force
- **Bloom post-processing** with per-state point light color matching active morph
- Lerp factor of 0.04 per frame produces organic weighted motion (not mechanical easing)

---

## Animation Architecture

```
Scroll Events
  └── GSAP ScrollTrigger
        ├── pin: true — holds section fixed during scroll
        ├── scrub: 0.8 — smooth lag between scroll and progress
        └── onUpdate → normalized progress (0-1) drives SVG animations

UI State Transitions
  └── Framer Motion
        ├── AnimatePresence → mount/unmount with exit animations
        ├── layoutId → shared element spring transitions (tabs, underlines)
        └── whileInView → viewport-triggered entrance animations

3D / WebGL (React Three Fiber)
  └── useFrame (60fps render loop)
        ├── Particle position lerp (no re-renders, ref-based)
        ├── Color lerp via vertex attributes
        ├── Mouse influence via shared ref (zero re-render cost)
        └── ShaderMaterial uniform updates (uTime, uMorphProgress)

Post-Processing
  └── @react-three/postprocessing
        └── Bloom → luminance-threshold glow on particle points
```

**Key performance principle:** All per-frame animation data flows through **refs** inside `useFrame` — never state. This maintains 60fps without triggering React's render cycle.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| `#060A0F` base background | Deeper than typical dark UIs — creates genuine depth without pure black harshness |
| Additive blending on particles | Creates natural glow without post-processing overhead; particles overlap to create bright cores |
| Lerp factor 0.04 (morph) | Produces organic, weighted deceleration — particles feel like they have mass |
| Vertex colors on particles | Smooth color transitions during morph without switching materials (no GPU state change) |
| `pin + scrub` in InsightFlow | Forces reviewers to engage with each stage deliberately — respects the product narrative |
| Glassmorphism on dashboard | Creates depth hierarchy: dashboard "floats" above the page rather than sitting flat |
| `JetBrains Mono` for numbers | Enforces "intelligence tool" feel — data always reads as data |
| Custom `ShaderMaterial` in Hero | Built-in `PointsMaterial` can't do per-point size variation or custom glow falloff |
| `useAnimatedCounter` hook | Numbers counting up on enter communicate "live data" even with static mock values |

---

## Project Structure

```
xai-workspace/
├── app/
│   ├── layout.tsx           # Root layout, SEO meta, noise overlay
│   ├── page.tsx             # Page composition, loading screen, dividers
│   └── globals.css          # Design tokens, glass/glow utilities, noise grain
├── components/
│   ├── providers/
│   │   └── GSAPProvider.tsx # Registers GSAP plugins once at app level
│   ├── ui/
│   │   ├── Badge.tsx        # Status pill with optional pulse
│   │   ├── Card.tsx         # Glass card with hover effects
│   │   ├── GlowButton.tsx   # Primary/secondary CTA with shimmer
│   │   ├── LoadingScreen.tsx # Branded loader with progress ring
│   │   ├── MagneticButton.tsx # Cursor-following magnetic effect
│   │   └── SectionHeader.tsx # Consistent animated section headers
│   ├── Navbar.tsx           # Scroll-aware glassmorphism nav
│   ├── Hero.tsx             # Three.js shader particles + constellation
│   ├── InsightFlow.tsx      # GSAP pin+scrub, animated SVG stages
│   ├── Dashboard.tsx        # Mock product UI with all interactions
│   ├── SignatureInteraction.tsx # Morphing point cloud + shaders
│   └── Footer.tsx
├── hooks/
│   ├── useAnimatedCounter.ts # EaseOutExpo number count-up
│   ├── useMousePosition.ts   # Normalized mouse coords via ref
│   └── useScrollProgress.ts  # Scroll progress for element
├── lib/
│   ├── constants.ts          # Colors, easings, durations, motion variants
│   └── data.ts               # All mock data (metrics, table, signals, etc.)
├── next.config.js            # transpilePackages for Three.js ecosystem
└── tailwind.config.ts        # Design token extension
```

---

## Deploy

```bash
npm i -g vercel
vercel --prod
```

Or connect GitHub repo to [vercel.com](https://vercel.com) for automatic CI/CD.

---

## Key Libraries

- [Next.js 14](https://nextjs.org)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing)
- [Framer Motion](https://www.framer.com/motion)
- [GSAP + ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger)
- [Three.js](https://threejs.org)
