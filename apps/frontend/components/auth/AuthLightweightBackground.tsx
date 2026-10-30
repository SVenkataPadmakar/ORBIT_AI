"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export type AuthPortalVisualState = "idle" | "typing" | "authenticating" | "success" | "error";

interface AuthLightweightBackgroundProps {
  state?: AuthPortalVisualState;
}

export function AuthLightweightBackground({ state = "idle" }: AuthLightweightBackgroundProps) {
  // Color palette reflecting state
  const colors = useMemo(() => {
    switch (state) {
      case "typing":
        return {
          orb1: "rgba(56, 189, 248, 0.18)", // sky
          orb2: "rgba(99, 102, 241, 0.16)", // indigo
          orb3: "rgba(14, 165, 233, 0.12)",
        };
      case "authenticating":
        return {
          orb1: "rgba(192, 132, 252, 0.22)", // purple
          orb2: "rgba(168, 85, 247, 0.20)",
          orb3: "rgba(126, 34, 206, 0.14)",
        };
      case "success":
        return {
          orb1: "rgba(16, 185, 129, 0.22)", // emerald
          orb2: "rgba(52, 211, 153, 0.18)",
          orb3: "rgba(5, 150, 105, 0.15)",
        };
      case "error":
        return {
          orb1: "rgba(239, 68, 68, 0.22)", // red
          orb2: "rgba(248, 113, 113, 0.18)",
          orb3: "rgba(220, 38, 38, 0.14)",
        };
      case "idle":
      default:
        return {
          orb1: "rgba(99, 102, 241, 0.15)", // indigo
          orb2: "rgba(139, 92, 246, 0.13)", // violet
          orb3: "rgba(6, 182, 212, 0.10)",  // cyan
        };
    }
  }, [state]);

  // Generate lightweight static particles once
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: (i * 17) % 100,
      y: (i * 23) % 100,
      size: (i % 3) + 1.5,
      duration: 12 + (i % 8) * 2,
      delay: (i % 5) * 0.8,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* ── Ambient Radial Mesh Base ── */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%), radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 40%)",
        }}
      />

      {/* ── Floating Glowing Gradient Orbs (Framer Motion) ── */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[100px] transition-colors duration-1000"
        style={{ background: colors.orb1 }}
      />

      <motion.div
        animate={{
          x: [0, -40, 25, 0],
          y: [0, 30, -30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-32 -right-24 w-[480px] h-[480px] rounded-full blur-[120px] transition-colors duration-1000"
        style={{ background: colors.orb2 }}
      />

      <motion.div
        animate={{
          x: [0, 20, -25, 0],
          y: [0, -20, 30, 0],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full blur-[90px] transition-colors duration-1000"
        style={{ background: colors.orb3 }}
      />

      {/* ── Lightweight Floating SVG Particle Dust ── */}
      <svg className="absolute inset-0 w-full h-full opacity-40">
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={p.size}
            fill="#c7d2fe"
            initial={{ opacity: 0.15, y: 0 }}
            animate={{
              opacity: [0.15, 0.65, 0.15],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

