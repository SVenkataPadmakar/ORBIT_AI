"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "google";
  className?: string;
  glowColor?: string;
}

/**
 * High-performance interactive button with subtle glow and smooth scaling.
 * Magnetic cursor displacement removed to ensure clean, precise, 60fps interaction.
 */
export function MagneticButton({
  children,
  variant = "primary",
  className = "",
  glowColor = "rgba(99, 102, 241, 0.4)",
  disabled,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  // Variant styling with fluid glass, neon borders, and specular highlights
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-[0_0_24px_rgba(99,102,241,0.35)] border border-indigo-400/30",
    secondary:
      "bg-white/[0.05] hover:bg-white/[0.09] text-white/90 border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-lg",
    ghost:
      "bg-transparent hover:bg-white/[0.06] text-indigo-200/70 hover:text-white border border-transparent",
    google:
      "bg-white/[0.04] hover:bg-white/[0.08] text-white/90 border border-white/10 hover:border-white/25 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
  }[variant];

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!disabled ? { scale: 1.018 } : {}}
      whileTap={!disabled ? { scale: 0.982 } : {}}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl px-5 py-3 transition-all duration-200 flex items-center justify-center gap-2.5 select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${className}`}
      {...(props as any)}
    >
      {/* Specular Radial Cursor Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered && !disabled ? 1 : 0,
          background: `radial-gradient(140px circle at ${spotlight.x}% ${spotlight.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
