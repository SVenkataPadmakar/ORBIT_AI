# ORBIT LANDING EXPERIENCE V4
# PRODUCTION SPEC — CINEMATIC WEB EXPERIENCE

====================================================================
0. PRIME DIRECTIVE
====================================================================

READ BEFORE CODING.
AUDIT BEFORE REDESIGN.
SPEC BEFORE IMPLEMENTATION.
TEST BEFORE SHIP.

You will produce:
  1. Audit report          (docs/audit.md)
  2. Redesign strategy     (docs/redesign_strategy.md)
  3. File-by-file plan     (docs/implementation_plan.md)
  4. Full implementation   (code, in place)
  5. Performance report    (docs/performance_report.md)
  6. Before/after          (docs/before_after.md)

DO NOT STOP AT PLANNING.
But DO NOT start Phase 2 before Phase 1 deliverables exist.

====================================================================
1. IDENTITY
====================================================================

Orbit is NOT:
  ✗ a startup idea generator
  ✗ a dashboard
  ✗ a report tool
  ✗ a chatbot
  ✗ a Three.js demo
  ✗ a particle playground

Orbit IS:
  ✓ AI Founder Operating System
  ✓ The system that turns one idea into a real company
  ✓ Idea → Validation → Product → Architecture → Build → Launch

The landing page must communicate the transformation
  idea → company
in under 10 seconds, without a single word of explanation.

====================================================================
2. AUDIT PHASE (mandatory, before any code)
====================================================================

READ EXACTLY THESE FILES (do not wander):
  apps/web/app/(marketing)/page.tsx
  apps/web/app/layout.tsx
  apps/web/app/(marketing)/layout.tsx
  apps/web/components/landing/**/*.{tsx,ts}
  apps/web/components/three/**/*.{tsx,ts}
  apps/web/components/canvas/**/*.{tsx,ts}
  apps/web/shaders/**/*.{glsl,vert,frag}
  apps/web/hooks/useScroll*.ts
  apps/web/hooks/useAnimation*.ts
  apps/web/lib/three/**
  apps/web/package.json
  apps/web/next.config.{js,ts,mjs}
  apps/web/tailwind.config.{js,ts}

PRODUCE docs/audit.md with these exact sections:

  ## Inventory
  Table: file | LOC | purpose | R3F? | shader? | dep weight (kb)

  ## FPS Baseline
  Report FPS on M1 Mac, iPhone 13, mid-tier Android.
  Use Chrome DevTools Performance + WebGL inspector.

  ## Genericness Audit
  For each section, rate 1-10 on:
    - unoriginality
    - decorative-without-meaning
    - disconnection from Orbit mission
    - FPS cost per unit of meaning

  ## Kill List
  Files to DELETE (with reason + replacement).
  Files to KEEP untouched (with reason).
  Files to REWRITE (with reason + scope).

  ## Root Causes
  - Why does it feel like a student project?
  - What visual choices are killing FPS?
  - What's missing that Apple/Linear/Vercel would never omit?

DO NOT WRITE CODE UNTIL docs/audit.md IS APPROVED.

====================================================================
3. THE CONCEPT — LIVING STARTUP UNIVERSE
====================================================================

The landing page is a 6-scene cinematic scroll. Each scene is a phase of
company formation. Scroll = time. Camera = narrator. Light = meaning.

Scene → Metaphor → Copy → Shader focus:

  S1  THE SPARK          idea                    point-emissive noise
  S2  VALIDATION ORBIT   market proof            instanced rings + signal flow
  S3  PRODUCT FORMATION  structure from chaos     metaball / SDF merge
  S4  AGENT AWAKENING    autonomous intelligence orbital kinematics + trails
  S5  STARTUP GALAXY     ecosystem               GPU particles (≤100k)
  S6  ORBIT CORE         the OS itself           volumetric bloom + reveal

Copy MUST be short. ≤ 8 words per scene headline.
Detail copy lives in micro-captions, revealed on scroll-stop.

====================================================================
4. THE AESTHETIC — DECOMPOSED REFERENCES
====================================================================

Do not "make it feel like Apple." Steal specific axes from specific places:

  AXIS                    SOURCE              WHAT TO STEAL
  Camera motion           Linear              slow dolly, no zooms, no shake
  Typography              Vercel (Geist)      tight tracking, high contrast, mono caps for eyebrows
  Color                   Apple Vision Pro    deep blacks (#050507), one accent (#7C5CFF), off-white (#EDEDF2)
  Motion easing           Stripe              cubic-bezier(0.16, 1, 0.3, 1), 600–900ms
  Density / whitespace    OpenAI              1 idea per screen, generous negative space
  Interaction grammar     Linear              keyboard-first, ⌘K everywhere, no hover-only affordances
  Depth / atmosphere      Arc browser         soft fog, layered parallax, no hard edges
  Editorial discipline    Stripe              numbers < words, principles < features

FORBIDDEN:
  ✗ purple-to-pink gradients (2021)
  ✗ glassmorphism cards floating in space
  ✗ fake metrics ("10,000+ startups launched")
  ✗ "Trusted by" logo walls
  ✗ emoji in hero
  ✗ testimonials on landing
  ✗ counters that count up

====================================================================
5. DESIGN SYSTEM (define first, code second)
====================================================================

Emit apps/web/styles/tokens.css and apps/web/lib/design/tokens.ts.

  COLOR
    --bg-void:      #050507
    --bg-surface:   #0A0A0F
    --fg-primary:   #EDEDF2
    --fg-secondary: #8A8A96
    --fg-tertiary:  #4A4A55
    --accent:       #7C5CFF   (Orbit violet)
    --accent-glow:  #A48BFF
    --signal:       #4ADE80   (validation green, used sparingly)
    --warning:      #F59E0B
    --danger:       #EF4444

  TYPE SCALE (fluid, clamp-based)
    display-xl: clamp(3.5rem, 8vw, 7rem)   / 0.95 line / -0.04em
    display-lg: clamp(2.5rem, 5vw, 4rem)   / 1.0  line / -0.03em
    h1:         clamp(2rem, 3.5vw, 3rem)   / 1.1  line / -0.02em
    h2:         clamp(1.5rem, 2.5vw, 2rem) / 1.2  line / -0.01em
    body:       1rem / 1.6 / 0
    caption:    0.8125rem / 1.5 / 0.02em
    mono:       0.75rem / 1.4 / 0.08em  (uppercase eyebrows)
    Fonts: Geist Sans + Geist Mono (self-hosted, subset)

  SPACE (8px base)
    4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256

  RADIUS
    sm 6px | md 12px | lg 20px | xl 32px | full 9999px

  MOTION
    --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1)
    --ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1)
    --duration-fast:  200ms
    --duration-base:  400ms
    --duration-slow:  700ms
    --duration-cine:  1200ms

  BLUR / FOG
    --fog-near: #050507
    --fog-far:  #0F0A1F
    density:    0.018

  SHADER UNIFORMS (global constants)
    u_time, u_resolution, u_scroll (0..1 per scene), u_pointer (vec2),
    u_dpr (clamped 1..2), u_reduced_motion (0|1)

====================================================================
6. SCENE SPECS (per-scene contract)
====================================================================

Each scene MUST declare:
  duration (scroll height in vh), camera path, shader program, GPU budget,
  copy, accessibility fallback, evidence of "meaning."

───────────────────────────────────────────────────────────────────
SCENE 1 — THE SPARK                            scroll: 100vh
───────────────────────────────────────────────────────────────────
MEANING    Every company starts as one idea.
PRIMITIVE  Single emissive sphere, radius 0.4, noise-displaced surface.
           Subtle 6s "breathing" cycle (scale 0.98 ↔ 1.02).
           No other geometry. No particles. No rings.
LIGHT      One point light, one rim light. Total draw calls: ≤ 3.
SHADER     fbm-noise displacement + fresnel emissive
CAMERA     Static, then slow dolly-in over 100vh scroll (z 6 → 4.5)
COPY       Eyebrow: "ORBIT"
           H1: "One idea. A whole company."
           Sub: "The AI Founder Operating System."
CTA        [Watch demo] [Register]
FALLBACK   Static SVG: single pulsing dot, radial gradient
A11Y       Copy is real <h1>; canvas aria-hidden="true"; reduced-motion = static
BUDGET     ≤ 300 LOC, shader ≤ 80 lines, ≤ 1 hour implementation

───────────────────────────────────────────────────────────────────
SCENE 2 — VALIDATION ORBIT                     scroll: 150vh
───────────────────────────────────────────────────────────────────
MEANING    Orbit tests the idea against reality.
PRIMITIVE  Three concentric rings (instanced torus geometry).
           ~40 "signal" particles traveling along ring paths.
           Pulse from center outward every 3s.
LIGHT      Two area lights, bloom kicks in at 0.3 intensity.
SHADER     Instanced with per-instance rotation + signal emission
CAMERA     Slight orbital arc, 15° over 150vh
COPY       Eyebrow: "VALIDATION"
           H2: "Tested against the market. Before you build."
           Micro-caption (appears at scroll-stop): "Live competitor scans."
FALLBACK   Static SVG rings with CSS keyframe pulse
BUDGET     ≤ 500 LOC, ≤ 2 hours

───────────────────────────────────────────────────────────────────
SCENE 3 — PRODUCT FORMATION                    scroll: 150vh
───────────────────────────────────────────────────────────────────
MEANING    Raw idea → structured product.
PRIMITIVE  ~12 metaballs (SDF) merging into a coherent shape.
           As scroll progresses, they merge into a monolith.
           Wireframe overlay fades in at 60% scroll (reveals structure).
LIGHT      Cool key, warm rim (teases Scene 5 warm galaxy).
SHADER     Raymarched SDF metaballs (in fragment shader, not mesh)
CAMERA     Slow tilt + pull-back
COPY       Eyebrow: "PRODUCT"
           H2: "Structure from chaos."
           Micro-caption: "Features, flows, architecture — one system."
FALLBACK   Static SVG: 12 circles → 1 shape (SMIL animation)
BUDGET     ≤ 600 LOC, ≤ 2 hours. SDF steps ≤ 64 (perf guard)

───────────────────────────────────────────────────────────────────
SCENE 4 — AGENT AWAKENING                      scroll: 200vh
───────────────────────────────────────────────────────────────────
MEANING    Autonomous intelligence at work.
PRIMITIVE  The monolith from S3 fragments into ~7 "agent" nodes.
           Each node has an orbital path around the core.
           Trails (screen-space, additive) show their motion.
           NO CARDS. NO ICONS. NO LABELS on the agents themselves —
           labels appear as world-space sprites, tiny, monospace.
AGENT NAMES (exact):
  Market · Product · Architect · Sprint · Launch · Growth · Investor
LIGHT      Each agent emits its own point light (max 7 point lights total).
SHADER     Agent mesh: emissive core + fresnel shell.
           Trails: custom frame-buffer feedback pass.
CAMERA     Slow orbit around core, 30° over 200vh
COPY       Eyebrow: "AGENTS"
           H2: "Seven intelligences. One mission."
           Micro-caption: "Every step. Every decision. Traced."
FALLBACK   Static SVG: 7 dots on orbital paths (CSS animation)
BUDGET     ≤ 800 LOC, ≤ 3 hours. Particle count ≤ 7×200 trails.

───────────────────────────────────────────────────────────────────
SCENE 5 — STARTUP GALAXY                       scroll: 200vh
───────────────────────────────────────────────────────────────────
MEANING    A real company forms.
PRIMITIVE  Agent nodes become seeds. A GPU particle system (≤ 100k) emerges,
           clustered into 4 groups orbiting the core:
             Customers · Revenue · Investors · Team
           Each cluster is a distinct hue (subtle, not rainbow).
LIGHT      Ambient increase, bloom peak (0.8), volumetric fog thickens.
SHADER     GPU particles (transform feedback or instanced, whichever is
           compatible with R3F + WebGL2). Per-particle hue, size, velocity.
CAMERA     Pull back, wide shot, slow rise
COPY       Eyebrow: "COMPANY"
           H2: "An idea, in motion."
           Micro-caption: "Not a mockup. A running system."
FALLBACK   Static SVG galaxy (5k dots) with CSS float
BUDGET     ≤ 900 LOC, ≤ 3 hours. GPU memory ≤ 64 MB for particle buffers.

───────────────────────────────────────────────────────────────────
SCENE 6 — ORBIT CORE                           scroll: 150vh
───────────────────────────────────────────────────────────────────
MEANING    All systems converge. This is Orbit.
PRIMITIVE  Galaxy collapses inward (implosion, not explosion).
           Reveals the ORBIT wordmark in 3D (extruded, monospace, subtle).
           Then: brand fades, real UI surfaces (a preview of the product).
LIGHT      Cinematic: key light from above, dramatic shadow, then bloom reset.
SHADER     Implosion: particles lerp to center with quaternion rotation.
           Wordmark: emissive + frosted glass overlay.
CAMERA     Lock-off, then slow dolly to wordmark, then static
COPY       Wordmark: "ORBIT"
           Sub: "AI Founder Operating System."
           CTAs: [Sign in] [Register] [Watch demo]
NO:
  ✗ Fake statistics
  ✗ "Join 10,000 founders"
  ✗ Testimonials
  ✗ Logos
  ✗ Feature grids
FALLBACK   Static composition: wordmark + copy + CTAs, no 3D.
BUDGET     ≤ 500 LOC, ≤ 2 hours.

====================================================================
7. SCROLL ORCHESTRATION
====================================================================

Library:  Lenis (smooth scroll) + GSAP ScrollTrigger (scene triggers)
         OR  @react-three/drei's <ScrollControls> (R3F-native)
Decision: pick ONE, justify in docs/redesign_strategy.md.

Rules:
  - Scroll velocity → camera + uniform intensity (damped, not linear)
  - Scene transitions: cross-fade uniforms over 15% overlap
  - Never block scroll with animation
  - Scroll-lock only inside modal (Watch Demo), never on page
  - Scroll progress bar: 1px top-line, accent color, no label
  - Section anchors: #spark #validate #product #agents #galaxy #core

Mobile:
  - Reduce scroll heights by 40%
  - Disable long trails
  - Disable SDF raymarching (use static mesh fallback)

====================================================================
8. CAMERA RIG
====================================================================

Single <PerspectiveCamera makeDefault fov={42} /> driven by a state machine:
  states: SPARK | VALIDATE | PRODUCT | AGENTS | GALAXY | CORE
  transitions: lerp position + lookAt over 1.2s (ease-out-expo)
  pointer parallax: ±0.15 rad, damped 0.9
  never auto-rotate. every motion is scroll- or pointer-driven.

Composition rules:
  - Rule of thirds, always
  - Subject occupies 30–60% of frame, never centered (except S6)
  - Horizon line never at vertical center
  - Fog always separates foreground from background

====================================================================
9. LIGHT RIG
====================================================================

Budget: ≤ 4 dynamic lights TOTAL at any time.
  Ambient    1 (color = fog color, intensity 0.05)
  Key        1 (moves with camera, warm at S5/S6)
  Rim        1 (always behind subject, cool)
  Emissive   N (materials + bloom, not real lights)

Bloom: @react-three/postprocessing
  threshold: 0.75
  intensity: 0.4 → 0.8 (animated per scene)
  radius: 0.6
  Use SelectiveBloom where possible (mask everything except emissive).

Fog: exponential, color = #0F0A1F at far
  Auto-adjust density per scene.

====================================================================
10. SHADER STANDARDS
====================================================================

Every shader must:
  - Be isolated in its own file (apps/web/shaders/{name}.frag|vert)
  - Use #include for shared noise/helpers (apps/web/shaders/lib/)
  - Declare all uniforms at top with comments
  - Have a #define LOW_QUALITY variant for mobile
  - Compile cleanly (no warnings)
  - Pass through a shared u_reduced_motion flag

Standard helpers to build once (apps/web/shaders/lib/):
  - hash, noise2D, noise3D, fbm
  - rotation2D, rotation3D
  - fresnel, emissiveTint
  - dissolve (for transitions)

GPU budget (per device tier):
  Tier A (M-series, discrete):    100k particles, 64 raymarch steps
  Tier B (integrated, iPhone 13+): 30k particles, 32 raymarch steps
  Tier C (Android mid-tier):        5k particles, no raymarch

Detect tier via GPU benchmark on first paint:
  - Capability probe: render a 1024-instance test → measure time
  - Persist tier in localStorage for future visits

====================================================================
11. WATCH DEMO MODAL
====================================================================

Trigger:  navbar [Watch demo] + hero [Watch demo]
Layout:   90vw × 90vh, centered, black scrim (rgba(0,0,0,0.85)), backdrop-blur(24px)
Focus:    auto-focus first interactive, trap focus, ESC closes, click-scrim closes
Body scroll: locked while open

Content (in order of preference):
  1. If /public/demo.mp4 exists → native <video controls autoPlay muted>
  2. Else if /public/demo.m3u8 exists → hls.js player
  3. Else → 7-step animated product walkthrough (Framer Motion):
       Step 1 — Idea input     (screenshot + 1-line caption)
       Step 2 — Validation     (screenshot + 1-line caption)
       Step 3 — Agents         (screenshot + 1-line caption)
       Step 4 — PRD            (screenshot + 1-line caption)
       Step 5 — Architecture   (screenshot + 1-line caption)
       Step 6 — Sprint         (screenshot + 1-line caption)
       Step 7 — Launch         (screenshot + 1-line caption)
     Auto-advance every 8s; user can click chapter markers.

Progress: 7-segment bar, click-to-seek
Analytics: emit {open, step_viewed, complete, close, dwell_ms} to /api/analytics

Fallback: if all three sources fail → static poster + "Demo coming soon" + email capture

====================================================================
12. NAVBAR SPEC
====================================================================

Items (desktop): [Orbit] · Features · How it works · Demo · Pricing · [Sign in] [Register]
Items (mobile):  [Orbit] · [☰]
Behavior:
  - Transparent at scroll 0
  - Backdrop-blur + border-bottom at scroll > 40px
  - Auto-hide on scroll down, reveal on scroll up (Linear-style)
  - Cmd+K opens command palette (route to sections + auth)
  - Never shows fake counters, social proof, or "trusted by"

REMOVE PERMANENTLY:
  ✗ "Start Building" CTA
  ✗ Any badge with "AI-powered" or "Beta"
  ✗ Announcement bar
  ✗ Newsletter signup in navbar

====================================================================
13. PERFORMANCE CONTRACT
====================================================================

Targets (must meet ALL):
  Lighthouse Performance  ≥ 95 (mobile), ≥ 98 (desktop)
  Lighthouse A11y         ≥ 100
  Lighthouse Best-Pract.  ≥ 100
  Lighthouse SEO          ≥ 100
  LCP                     < 1.8s (M1), < 2.5s (iPhone 13)
  CLS                     < 0.02
  INP                     < 150ms
  FPS                     ≥ 60 (M1), ≥ 45 (iPhone 13), ≥ 30 (Android mid)
  Initial JS bundle       < 180 KB gzipped
  Three.js chunk          lazy-loaded, < 220 KB gzipped

Instrumentation:
  - Emit frame-time to /api/metrics (sampled 1/30 frames)
  - Auto-degrade: FPS < 45 for 3s → drop particle count 50%, disable trails
  - Second degrade: FPS < 40 for 3s → disable bloom
  - Third degrade: FPS < 30 → switch to Tier C static fallback

Guardrails (hard fail in CI):
  - Any single frame > 33ms on M1 during scroll-through
  - Any bundle regression > 5%
  - Any shader compile warning

====================================================================
14. ACCESSIBILITY (WCAG 2.2 AA mandatory)
====================================================================

  - prefers-reduced-motion: static poster per scene, no auto-scroll, no parallax
  - No-WebGL fallback: static SVG hero + 2D section layout
  - Every scene has semantic <section> with real <h2> + <p>
  - Canvas is aria-hidden="true"; copy is real DOM
  - Keyboard: full tab traversal; focus rings visible on dark bg (2px accent)
  - Modal: focus trap, ESC, return-focus to trigger
  - Screen reader: aria-live region announces scene name on transition
  - Contrast: all text ≥ 4.5:1; scrim behind text when over busy 3D
  - Colorblind: never color-only meaning; pair signals with shape/text
  - Motion: any looping motion has a pause control
  - Zoom: 200% zoom must not break layout

====================================================================
15. RESPONSIVE CHOREOGRAPHY
====================================================================

Breakpoints:
  mobile:  < 640px   (1 column, canvas 60vh, no raymarch, no trails)
  tablet:  640–1024 (2 columns, canvas 70vh, tier B)
  laptop:  1024–1440 (full experience, tier A/B)
  desktop: > 1440   (full experience, tier A)

Per-breakpoint adjustments:
  - Copy: scale via clamp() — no JS
  - 3D: tier detection on mount
  - Scroll heights: reduce 40% on mobile
  - Particle counts: scale by tier
  - Shader quality: #define LOW_QUALITY on mobile

====================================================================
16. FILE-LEVEL DELIVERABLES
====================================================================

CREATE:
  apps/web/app/(marketing)/page.tsx                    [REWRITE]
  apps/web/app/(marketing)/layout.tsx                  [REWRITE]
  apps/web/components/landing/LandingCanvas.tsx        [CREATE]
  apps/web/components/landing/ScrollOrchestrator.tsx   [CREATE]
  apps/web/components/landing/Navbar.tsx               [REWRITE]
  apps/web/components/landing/WatchDemoModal.tsx       [CREATE]
  apps/web/components/landing/CommandPalette.tsx       [CREATE]
  apps/web/components/landing/SceneShell.tsx           [CREATE]
  apps/web/components/landing/scenes/Scene1Spark.tsx       [CREATE]
  apps/web/components/landing/scenes/Scene2Validate.tsx    [CREATE]
  apps/web/components/landing/scenes/Scene3Product.tsx     [CREATE]
  apps/web/components/landing/scenes/Scene4Agents.tsx      [CREATE]
  apps/web/components/landing/scenes/Scene5Galaxy.tsx      [CREATE]
  apps/web/components/landing/scenes/Scene6Core.tsx        [CREATE]
  apps/web/components/landing/fallbacks/SparkSVG.tsx       [CREATE]
  apps/web/components/landing/fallbacks/ValidateSVG.tsx    [CREATE]
  apps/web/components/landing/fallbacks/ProductSVG.tsx     [CREATE]
  apps/web/components/landing/fallbacks/AgentsSVG.tsx      [CREATE]
  apps/web/components/landing/fallbacks/GalaxySVG.tsx      [CREATE]
  apps/web/components/landing/fallbacks/CoreStatic.tsx     [CREATE]
  apps/web/shaders/lib/noise.glsl                      [CREATE]
  apps/web/shaders/lib/rotation.glsl                   [CREATE]
  apps/web/shaders/lib/fresnel.glsl                    [CREATE]
  apps/web/shaders/spark.frag / .vert                  [CREATE]
  apps/web/shaders/rings.frag / .vert                  [CREATE]
  apps/web/shaders/metaball.frag / .vert               [CREATE]
  apps/web/shaders/agent.frag / .vert                  [CREATE]
  apps/web/shaders/particles.frag / .vert              [CREATE]
  apps/web/shaders/implosion.frag / .vert              [CREATE]
  apps/web/hooks/useScrollProgress.ts                  [CREATE]
  apps/web/hooks/useDeviceTier.ts                      [CREATE]
  apps/web/hooks/usePrefersReducedMotion.ts            [CREATE]
  apps/web/hooks/useFpsMonitor.ts                      [CREATE]
  apps/web/lib/design/tokens.ts                        [CREATE]
  apps/web/styles/tokens.css                           [CREATE]
  apps/web/public/fonts/Geist*.woff2                   [SELF-HOST]

DELETE (after successful ship, behind feature flag):
  apps/web/components/landing/ParticlesOld.tsx         [DELETE]
  apps/web/components/landing/GalaxyDemo.tsx           [DELETE]
  apps/web/components/landing/HeroStats.tsx            [DELETE]
  apps/web/components/landing/ThreeBackground.tsx      [DELETE]
  apps/web/components/landing/FloatingCards.tsx        [DELETE]
  (see docs/audit.md Kill List — this is a sample)

KEEP UNTOUCHED:
  apps/web/app/api/**                                  [KEEP]
  apps/web/components/ui/**  (shadcn base)             [KEEP]
  apps/web/lib/analytics.ts                            [KEEP]

====================================================================
17. VERSION PINNING (do not upgrade mid-build)
====================================================================

  next            15.x (latest patch)
  react           19.x
  three           0.169.x
  @react-three/fiber   8.17.x
  @react-three/drei    9.114.x
  @react-three/postprocessing  2.16.x
  framer-motion   11.x
  lenis           1.1.x
  gsap            3.12.x (only ScrollTrigger)
  tailwindcss     3.4.x
  typescript      5.6.x
  node            20 LTS
  pnpm            9.x

====================================================================
18. GIT STRATEGY (rollback safety)
====================================================================

  Branch:        feat/landing-v4
  Commits:       one per scene + one per infra task (≥10 total)
  Tags:          landing-v4-s1, -s2, ... after each scene passes FPS
  Feature flag:  NEXT_PUBLIC_LANDING_V4 (default false in prod)
  Old landing:   preserved as page.v3.tsx until flag flips
  Deploy:        Vercel preview on every push
  Merge gate:    Lighthouse + visual regression + FPS report all green

====================================================================
19. VISUAL REGRESSION (CI gate)
====================================================================

  Tool:      Playwright + Pixelmatch
  Viewports: 390×844, 834×1112, 1440×900, 1920×1080
  Checkpoints per viewport:
    scroll 0 / 15 / 30 / 45 / 60 / 75 / 90 / 100 %
  Determinism:
    Run in Docker with SwiftShader (software GL) for consistent pixels
    Seed all random uniforms (u_seed uniform, fixed per build)
    Disable pointer parallax during screenshots (query param ?regression=1)
  Threshold: fail if pixel diff > 2% (allow shader noise)
  Output:    diff image + JSON report attached to PR

====================================================================
20. INSTRUMENTATION & SUCCESS METRICS
====================================================================

  Track (via apps/web/lib/analytics.ts):
    scroll_depth        {25, 50, 75, 100}
    scene_viewed        {1..6}
    scene_dwell_ms      {per scene}
    cta_clicked         {signin, register, watch_demo}
    demo_modal          {open, step_viewed, complete, close, dwell_ms}
    register_conversion (landing → signup)
    fps_median          {per device tier}
    error_webgl         {context_lost, shader_compile_fail}

  Post-launch targets (week 4):
    landing → register          ≥ 4%
    demo modal completion       ≥ 40%
    median scroll depth         ≥ 60%
    bounce rate                 < 45%
    FPS p50 (M1)                ≥ 58
    Lighthouse mobile           ≥ 93

  Dashboard: Metabase panel, refresh hourly.
  Alert: Slack if register conversion < 2% for 48h.

====================================================================
21. TEST PLAN
====================================================================

  Unit:
    - Shader helpers compile
    - useScrollProgress clamps correctly
    - useDeviceTier returns A/B/C
    - tokens.ts exports match tokens.css

  Integration:
    - Navbar hides/reveals on scroll
    - Cmd+K opens palette
    - Watch Demo modal: open, trap focus, ESC, close
    - Reduced-motion: static fallback renders

  Visual:
    - 8 checkpoints × 4 viewports (Section 19)

  Performance:
    - Lighthouse CI on every PR
    - Frame-time trace on scroll-through (Puppeteer + performance API)
    - Bundle size check (next-bundle-analyzer)

  A11y:
    - axe-core on every scene
    - Manual screen reader test (VoiceOver + NVDA)
    - Keyboard-only traversal test

  Chaos:
    - Simulate WebGL context lost mid-scroll → must fall back gracefully
    - Simulate network throttle 3G → must still render hero
    - Simulate iOS Safari 15 (oldest supported) → no crash

====================================================================
22. MVP CUT LINE (if time runs out)
====================================================================

  MUST SHIP:
    Scene 1 (Spark) + Scene 2 (Validate) + Scene 6 (Core)
    Navbar + Watch Demo modal + reduced-motion fallbacks
    Full a11y + performance contract

  SHOULD SHIP:
    Scene 3 (Product) + Scene 4 (Agents)

  NICE:
    Scene 5 (Galaxy)

  If cut: replace missing scenes with static SVG posters that match
  the design system. Copy remains. Meaning remains. Only 3D removed.

====================================================================
23. DEFINITION OF DONE
====================================================================

  [ ] docs/audit.md approved
  [ ] docs/redesign_strategy.md approved
  [ ] docs/implementation_plan.md lists every file with tag
  [ ] All CREATE files exist and pass tsc + eslint
  [ ] All DELETE files removed (behind flag)
  [ ] Lighthouse ≥ 95 / 100 / 100 / 100 (mobile)
  [ ] FPS: 60 / 45 / 30 (M1 / iPhone 13 / Android mid)
  [ ] Visual regression: 0 failures over 2%
  [ ] axe-core: 0 violations
  [ ] Reduced-motion: static fallback verified
  [ ] No-WebGL: static fallback verified
  [ ] Watch Demo modal: opens, closes, keyboard works
  [ ] Cmd+K palette: works
  [ ] Instrumentation fires events
  [ ] Feature flag NEXT_PUBLIC_LANDING_V4 exists
  [ ] Rollback path verified (flag off → v3 renders)
  [ ] docs/performance_report.md + docs/before_after.md written

====================================================================
24. WHAT TO DO RIGHT NOW
====================================================================

  STEP 1  Read the audit scope files.
  STEP 2  Produce docs/audit.md.
  STEP 3  STOP. Wait for approval.
  STEP 4  Produce docs/redesign_strategy.md + docs/implementation_plan.md.
  STEP 5  STOP. Wait for approval.
  STEP 6  Implement Phase A (Scene 1 + Navbar + tokens + hooks).
  STEP 7  Ship preview. Verify FPS. Verify visual regression.
  STEP 8  Implement Phase B (Scene 2 + Watch Demo modal).
  STEP 9  Repeat through Scene 6.
  STEP 10 Produce performance_report.md + before_after.md.
  STEP 11 Flip feature flag in preview. Verify. Then prod.

NEVER code more than one scene without shipping + verifying.
NEVER ship a scene without its fallback.
NEVER ship without FPS evidence.

BEGIN WITH STEP 1.
