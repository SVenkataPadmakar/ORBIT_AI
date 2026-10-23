import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Tailwind aliases tied to CSS vars */
        background:          "hsl(var(--background))",
        foreground:          "hsl(var(--foreground))",
        surface:             "hsl(var(--surface))",
        accent:              "hsl(var(--accent))",
        "accent-soft":       "hsl(var(--accent-soft))",
        coral:               "hsl(var(--coral))",
        "coral-soft":        "hsl(var(--coral-soft))",
        muted:               "hsl(var(--muted))",
        "muted-foreground":  "hsl(var(--muted-foreground))",
        border:              "hsl(var(--border))",
        danger:              "hsl(var(--danger))",

        /* Orbit Idea design tokens */
        "forge-bg":          "#0A0A0F",
        "forge-surface":     "#111118",
        "forge-elevated":    "#1E1E2E",
        "forge-indigo":      "#6366F1",
        "forge-violet":      "#8B5CF6",
        "forge-purple":      "#A855F7",

        /* V4 Cinematic Design Tokens */
        "void":              "var(--bg-void)",
        "surface-v4":        "var(--bg-surface)",
        "fg-primary":        "var(--fg-primary)",
        "fg-secondary":      "var(--fg-secondary)",
        "fg-tertiary":       "var(--fg-tertiary)",
        "accent-v4":         "var(--accent)",
        "accent-glow":       "var(--accent-glow)",
        "signal":            "var(--signal)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "cine":     "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.35)" },
          "50%":       { boxShadow: "0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        orbit: {
          from: { transform: "rotate(0deg) translateX(28px) rotate(0deg)" },
          to:   { transform: "rotate(360deg) translateX(28px) rotate(-360deg)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 600ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":    "fade-in 400ms ease both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer:      "shimmer 1.5s ease-in-out infinite",
        orbit:        "orbit 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
