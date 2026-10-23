/**
 * ORBIT LANDING EXPERIENCE V4 — DESIGN SYSTEM TOKENS
 * Typed tokens mirror styles/tokens.css
 * Reference: .antigravity/rules.md (Section 5)
 */

export const COLORS = {
  bgVoid: "#050507",
  bgSurface: "#0A0A0F",
  fgPrimary: "#EDEDF2",
  fgSecondary: "#8A8A96",
  fgTertiary: "#4A4A55",
  accent: "#7C5CFF", // Orbit violet
  accentGlow: "#A48BFF",
  signal: "#4ADE80", // validation green, used sparingly
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export const TYPE_SCALE = {
  displayXl: {
    fontSize: "clamp(3.5rem, 8vw, 7rem)",
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
  },
  displayLg: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    lineHeight: 1.0,
    letterSpacing: "-0.03em",
  },
  h1: {
    fontSize: "clamp(2rem, 3.5vw, 3rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  body: {
    fontSize: "1rem",
    lineHeight: 1.6,
    letterSpacing: "0",
  },
  caption: {
    fontSize: "0.8125rem",
    lineHeight: 1.5,
    letterSpacing: "0.02em",
  },
  mono: {
    fontSize: "0.75rem",
    lineHeight: 1.4,
    letterSpacing: "0.08em",
  },
} as const;

export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  24: 96,
  32: 128,
  48: 192,
  64: 256,
} as const;

export const RADII = {
  sm: "6px",
  md: "12px",
  lg: "20px",
  xl: "32px",
  full: "9999px",
} as const;

export const MOTION = {
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  durationFast: 200,
  durationBase: 400,
  durationSlow: 700,
  durationCine: 1200,
} as const;

export const FOG = {
  near: "#050507",
  far: "#0F0A1F",
  density: 0.018,
} as const;

export const SHADER_UNIFORMS = {
  u_time: "u_time",
  u_resolution: "u_resolution",
  u_scroll: "u_scroll",
  u_pointer: "u_pointer",
  u_dpr: "u_dpr",
  u_reduced_motion: "u_reduced_motion",
} as const;
