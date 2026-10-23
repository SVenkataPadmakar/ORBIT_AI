# ORBIT LANDING EXPERIENCE V4 — REDESIGN STRATEGY
**Document:** `docs/redesign_strategy.md`  
**Status:** Architecture Proposal — Pending User Approval  
**Target:** Production-Grade Cinematic Founder Web Experience  

---

## 1. Executive Summary & Identity

Orbit is **not** a startup idea generator, a report dashboard, an AI chatbot, or a Three.js astronomy simulation.  
Orbit is the **AI Founder Operating System**: the autonomous intelligence platform that converts a single raw idea into a live, verified, revenue-generating software company:

$$\text{Idea} \longrightarrow \text{Validation} \longrightarrow \text{Product} \longrightarrow \text{Architecture} \longrightarrow \text{Build} \longrightarrow \text{Launch}$$

### Core Communication Objective
The visitor must perceive this continuous metamorphosis within **under 10 seconds of scrolling**, with zero explanatory marketing jargon or generic SaaS fluff.

---

## 2. Deconstructed Aesthetic Axes

Rather than attempting a vague "Apple-like" feel, V4 decomposes and adopts explicit, proven design axes from world-class digital products:

| Aesthetic Axis | Primary Source | Exact Principles to Steal |
| :--- | :--- | :--- |
| **Camera Motion** | **Linear** | Slow, deliberate dolly on the Z-axis. Zero disorienting zooms, zero violent shakes, zero uncontrolled free-cam orbiting. |
| **Typography** | **Vercel (Geist)** | High contrast, tight letter tracking (`-0.04em` on display), uppercase monospace eyebrows (`0.75rem / 0.08em` tracking). |
| **Color & Value** | **Apple Vision Pro** | Deep void black (`#050507`), elevated surface (`#0A0A0F`), single signature accent (`#7C5CFF` Orbit violet), crisp off-white text (`#EDEDF2`). Zero rainbow clutter. |
| **Motion Easing** | **Stripe** | Exponential fluid easing `cubic-bezier(0.16, 1, 0.3, 1)` with durations calibrated between 600ms and 1200ms. |
| **Density & Space** | **OpenAI** | Exactly one focal concept per viewport. Generous negative space. Never more than 8 words per scene headline. |
| **Interaction Grammar** | **Linear** | Keyboard-first navigation, ubiquitous `⌘K` command palette, zero hover-only critical interactions. |
| **Atmospheric Depth** | **Arc Browser** | Soft exponential depth fog (`#0F0A1F` far), layered smooth parallax, zero harsh card borders. |
| **Editorial Rigor** | **Stripe** | Quantifiable principles over adjectives. Micro-captions revealed cleanly upon scroll-stop. |

### Forbidden Anti-Patterns (Strictly Prohibited)
* ❌ Purple-to-pink gradients (outdated 2021 web3 aesthetic)
* ❌ Floating glassmorphism cards orbiting in space
* ❌ Fabricated social proof ("10,000+ startups launched", "Trusted by Fortune 500")
* ❌ Emojis in headlines or eyebrows
* ❌ Client testimonials on the primary landing path
* ❌ Counters that count up from 0 to vanity numbers
* ❌ 3D outer-space astronomy tropes (black holes, planetary accretion disks) that disconnect from software building

---

## 3. Scroll Orchestration Architecture

### Decision: Lenis (Native Virtualized Scroll) + GSAP ScrollTrigger
We evaluated two architectural approaches:
1. `@react-three/drei` `<ScrollControls>` (R3F Virtual Canvas Scroll)
2. **Lenis + GSAP ScrollTrigger + Custom Normalization Hook** (Selected)

### Decision Justification:
* **Native Browser DOM Compatibility:** `<ScrollControls>` hijacks the entire window scroll into a virtual Three.js container, creating severe accessibility barriers for screen readers, breaking standard keyboard page scrolling (`PageDown`, `Space`, `ArrowDown`), and complicating sticky DOM navigation bars.
* **Sticky Header & Modal Decoupling:** Lenis operates on native window scroll coordinates. This allows the `<Navbar>`, `WatchDemoModal`, and command palette to overlay cleanly without fighting canvas capture.
* **Granular Normalization Pipeline:** We feed normalized scroll progress ($0.0 \to 1.0$) directly into mutable refs (`scrollProgressRef.current`), enabling 60 FPS Three.js camera transitions **without triggering React component re-renders**.
* **Zero Scroll Hijacking:** Scroll is never frozen or locked during page transit. Motion is velocity-damped, providing butter-smooth inertia on Mac trackpads, Windows precision touchpads, and mobile devices.

---

## 4. The 6-Scene Cinematic Narrative

The landing page is an unbroken 6-scene chronological journey through company formation. Scroll distance equals time. The camera acts as narrator. Light represents emerging clarity.

```
SCENE 1: THE SPARK         [100vh] -> Raw Idea (Emissive noise sphere)
SCENE 2: VALIDATION ORBIT  [150vh] -> Market Proof (Concentric instanced rings & signals)
SCENE 3: PRODUCT FORMATION [150vh] -> Structure from Chaos (Metaball SDF -> Monolith)
SCENE 4: AGENT AWAKENING   [200vh] -> 7 Constitutional Agents (Orbital paths & trails)
SCENE 5: STARTUP GALAXY    [200vh] -> Living Ecosystem (GPU particles in 4 clusters)
SCENE 6: ORBIT CORE        [150vh] -> The Operating System (Implosion -> Wordmark & UI)
```

### Scene Breakdown & Production Specifications

#### Scene 1 — The Spark (`#spark`, 100vh)
* **Meaning:** Every transformational company starts as a single intuition.
* **3D Geometry:** Single emissive sphere ($r = 0.4$), noise-displaced surface. Subtle 6-second breathing cycle (scale $0.98 \leftrightarrow 1.02$). No extra meshes or particles.
* **Lighting & Shaders:** 1 point light, 1 cool rim light ($\le 3$ draw calls). `spark.vert` / `spark.frag` with FBM noise vertex displacement + Fresnel edge emission.
* **Camera:** Static initial framing, followed by slow forward dolly ($z = 6.0 \to 4.5$) across 100vh scroll.
* **Copy:** 
  * Eyebrow: `ORBIT`
  * H1: `One idea. A whole company.`
  * Subtitle: `The AI Founder Operating System.`
  * CTAs: `[Watch demo]` `[Register]`
* **A11y Fallback:** `<SparkSVG />`: Minimal pulsing vector dot with subtle radial gradient.

#### Scene 2 — Validation Orbit (`#validate`, 150vh)
* **Meaning:** Orbit stress-tests the idea against market reality before code is written.
* **3D Geometry:** Three concentric instanced torus rings. ~40 signal particles traveling along ring spline trajectories. Center-to-edge outward radial pulse every 3 seconds.
* **Lighting & Shaders:** 2 area lights; post-processing bloom activates at $0.3$ intensity. `rings.vert` / `rings.frag` using instanced matrix rotation and signal wave emission.
* **Camera:** Subtle orbital arc ($15^\circ$ lateral pan over 150vh).
* **Copy:**
  * Eyebrow: `VALIDATION`
  * H2: `Tested against the market. Before you build.`
  * Micro-caption (revealed on scroll stop): `Live competitor scans.`
* **A11y Fallback:** `<ValidateSVG />`: Concentric vector rings with CSS keyframe traveling signal pulses.

#### Scene 3 — Product Formation (`#product`, 150vh)
* **Meaning:** Chaos condenses into rigorous product structure (PRD, user flows, architecture).
* **3D Geometry:** ~12 smooth metaballs (evaluated via fragment raymarching SDF) gradually coalescing into a unified geometric monolith. Wireframe overlay fades in at 60% scroll progress to expose internal architectural rigor.
* **Lighting & Shaders:** Cool key light, warm rim light. `metaball.frag` raymarching polynomial smooth-min union ($s_{\min}$) with maximum 64 ray steps.
* **Camera:** Slow upward tilt + camera pull-back.
* **Copy:**
  * Eyebrow: `PRODUCT`
  * H2: `Structure from chaos.`
  * Micro-caption: `Features, flows, architecture — one system.`
* **A11y Fallback:** `<ProductSVG />`: Morphing vector cluster combining into a structured monolithic wireframe.

#### Scene 4 — Agent Awakening (`#agents`, 200vh)
* **Meaning:** Autonomous intelligence takes over execution. Exactly the 7 Constitutional Agents.
* **3D Geometry:** The monolith fragments into **exactly 7 agent nodes** (matching Orbit Constitution v2):
  1. `Market` · 2. `Product` · 3. `Architect` · 4. `Sprint` · 5. `Launch` · 6. `Growth` · 7. `Investor`
  Each node traverses an independent orbital incline. Smooth additive screen-space motion trails trace their paths. Agent names rendered as tiny monospace world-space sprite textures (zero DOM `<Html>` overlays).
* **Lighting & Shaders:** Each agent emits its own tinted point light ($\le 7$ dynamic lights). `agent.frag` with emissive core + Fresnel shell. Additive trail buffer.
* **Camera:** Continuous orbital orbit around core ($30^\circ$ over 200vh).
* **Copy:**
  * Eyebrow: `AGENTS`
  * H2: `Seven intelligences. One mission.`
  * Micro-caption: `Every step. Every decision. Traced.`
* **A11y Fallback:** `<AgentsSVG />`: 7 orbital vector nodes with dashed kinematic trails and monospace tags.

#### Scene 5 — Startup Galaxy (`#galaxy`, 200vh)
* **Meaning:** The software and business begin functioning as a living ecosystem.
* **3D Geometry:** Agent nodes act as orbital seeds. A GPU instanced particle system ($\le 100\text{k}$ particles on Tier A, $30\text{k}$ on Tier B) expands into 4 clustered orbits:
  * `Customers` · `Revenue` · `Investors` · `Team`
  Each cluster exhibits a subtle, distinct monochromatic hue.
* **Lighting & Shaders:** Ambient intensity increases, bloom peaks at $0.8$, volumetric exponential fog deepens. `particles.vert` / `particles.frag` driven by GPU buffer time uniforms.
* **Camera:** Wide shot pull-back with a majestic slow elevation rise.
* **Copy:**
  * Eyebrow: `COMPANY`
  * H2: `An idea, in motion.`
  * Micro-caption: `Not a mockup. A running system.`
* **A11y Fallback:** `<GalaxySVG />`: 2D SVG starlight spiral cluster with CSS floating drift.

#### Scene 6 — Orbit Core (`#core`, 150vh)
* **Meaning:** All operational vectors converge into the founder operating platform.
* **3D Geometry:** Galaxy particles implode inward towards the center (mathematical implosion, not an explosion). The 3D extruded monospace **ORBIT** wordmark emerges from the center. The 3D scene fades smoothly as the live, functional product UI surfaces into view.
* **Lighting & Shaders:** Overhead cinematic key light casting a crisp downward shadow, followed by bloom normalization. `implosion.vert` / `implosion.frag` with quaternion rotational convergence.
* **Camera:** Lock-off, gentle forward push toward the wordmark, then static framing.
* **Copy:**
  * Wordmark: `ORBIT`
  * Subtitle: `AI Founder Operating System.`
  * CTAs: `[Sign in]` `[Register]` `[Watch demo]`
* **A11y Fallback:** `<CoreStatic />`: Monospace wordmark layout with high-contrast CTAs and static UI preview.

---

## 5. Camera & Lighting Rig Architecture

### Camera Rig State Machine
* **Camera Instance:** Single `<PerspectiveCamera makeDefault fov={42} />`.
* **State Machine States:** `SPARK` $\to$ `VALIDATE` $\to$ `PRODUCT` $\to$ `AGENTS` $\to$ `GALAXY` $\to$ `CORE`.
* **Transitions:** Interpolate position vector and `lookAt` target vector over $1.2\text{s}$ using `cubic-bezier(0.16, 1, 0.3, 1)`.
* **Pointer Parallax:** Damped spherical angle offset ($\pm 0.15\text{ rad}$, damping factor $0.9$).
* **Composition Standard:** Golden ratio / rule-of-thirds framing. Primary subject occupies $30\%\text{–}60\%$ of viewport width, offset from dead center (except Scene 6).

### Lighting Budget ($\le 4$ Dynamic Lights Max)
* **1 Ambient Light:** Low-intensity base fill (`#0F0A1F`, intensity $0.05$).
* **1 Key Light:** Positioned relative to camera; warms dynamically during Scenes 5 & 6.
* **1 Rim Light:** Positioned behind main geometry; cool cyan-indigo hue for silhouette separation.
* **Emissive Highlights:** Delivered via material shader emissive parameters + selective bloom pass rather than expensive dynamic Three.js point lights.

---

## 6. Shader Standards & GPU Tiering

### Modular GLSL Library (`apps/frontend/shaders/lib/`)
All shaders share centralized, verified GLSL mathematical utility modules:
1. `noise.glsl`: 2D/3D simplex noise, 3-octave FBM.
2. `rotation.glsl`: 2D rotation matrices, quaternion orbit transformations.
3. `fresnel.glsl`: Schlick Fresnel approximation for edge lighting.

### Hardware Tier Detection on First Paint
On initial client mount, a lightweight benchmark test runs once and caches the device tier in `localStorage`:

| Device Tier | Hardware Classification | Particle Count | Raymarch Steps | Bloom Enabled | Mobile Shader Variant |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Tier A** | Apple Silicon M-series, discrete desktop GPUs | 100,000 | 64 steps | Yes (full) | Normal |
| **Tier B** | Integrated desktop GPUs, iPhone 13+, flagship mobile | 30,000 | 32 steps | Yes (selective) | Normal |
| **Tier C** | Mid/budget Android, low-power integrated | 5,000 | 0 (static mesh) | No (disabled) | `#define LOW_QUALITY` |

### Runtime Auto-Degradation Guardrails
* If frame rate falls below **45 FPS for 3 consecutive seconds** $\implies$ Particle count halved by 50%, motion trails disabled.
* If frame rate falls below **40 FPS for 3 consecutive seconds** $\implies$ Post-processing bloom pass bypassed.
* If frame rate falls below **30 FPS** $\implies$ WebGL canvas unmounts, seamlessly switching to Tier C SVG fallbacks.

---

## 7. Interactive Subsystems

### 1. Minimalist Linear-Style Navbar
* **Scroll 0:** Completely transparent background.
* **Scroll > 40px:** Dark translucent surface (`#050507/80`), backdrop blur ($16\text{px}$), subtle bottom border (`#EDEDF2/08`).
* **Directional Behavior:** Auto-hides when scrolling down; instantly reveals when scrolling up.
* **Exact Navigation Items:**
  * Desktop: `[Orbit Logo]` · `Features` · `How it works` · `Demo` · `Pricing` · `[Sign in]` `[Register]`
  * Mobile: `[Orbit Logo]` · `[☰]` (accessible drawer)
* **Keyboard Shortcut:** `⌘K` or `Ctrl+K` triggers the global Command Palette.

### 2. High-Fidelity Watch Demo Modal
* **Dimensions:** Centered $90\text{vw} \times 90\text{vh}$, rounded corners ($20\text{px}$), dark scrim (`rgba(0,0,0,0.85)`), backdrop blur ($24\text{px}$).
* **Accessibility:** Focus trapped within modal on open, `Escape` key closes, body scroll locked while active, focus returned to trigger button upon dismissal.
* **Playback Cascading Strategy:**
  1. `/public/demo.mp4` (if physical file exists)
  2. HLS stream `/public/demo.m3u8` (if present)
  3. **7-Step Animated Product Walkthrough:**
     * Step 1: Idea Input & Socratic Prompting
     * Step 2: Market Evidence & Validation
     * Step 3: 7 Constitutional Specialist Agents
     * Step 4: Product Requirements (PRD) Synthesis
     * Step 5: System Architecture & PostgreSQL Schema
     * Step 6: 14-Day Sprint Task Allocation
     * Step 7: Zero-Day Launch & Delivery (`orbit.zip`)
* **Controls:** 7-segment interactive seek bar, auto-advances every 8 seconds, click-to-seek chapter markers.

---

## 8. Performance, SEO & Accessibility (WCAG 2.2 AA)

### Performance Targets
* **Lighthouse Scores:** Performance $\ge 95$ (mobile) / $\ge 98$ (desktop), Accessibility $100$, Best Practices $100$, SEO $100$.
* **Core Web Vitals:** LCP $< 1.8\text{s}$ (M1) / $< 2.5\text{s}$ (mobile), CLS $< 0.02$, INP $< 150\text{ms}$.
* **Frame Rate:** Sustained $\ge 60\text{ FPS}$ (M1), $\ge 45\text{ FPS}$ (iPhone 13), $\ge 30\text{ FPS}$ (mid-tier Android).

### Accessibility Contract
* **Reduced Motion:** If `prefers-reduced-motion: reduce` is detected, 3D WebGL animations halt, camera remains static, and `<SparkSVG>`, `<ValidateSVG>`, etc. render cleanly.
* **Semantic Structure:** Every scene is wrapped in an explicit semantic `<section>` element containing real `<h2>`, `<p>`, and accessible navigation landmarks.
* **Screen Reader Integrity:** The 3D canvas is marked `aria-hidden="true"`. A polite `aria-live` region announces scene transitions as users scroll.
* **Color Contrast:** All text achieves minimum $4.5:1$ contrast against dark background.

---

## 9. Rollback & Feature Flag Strategy

* **Feature Flag:** `NEXT_PUBLIC_LANDING_V4` (defaults to `false` in production until verified).
* **Rollback Safeguard:** The current landing page is preserved as `apps/frontend/app/(marketing)/page.v3.tsx`. Flipping the feature flag immediately reverts to the previous implementation with zero downtime.
