"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#050507] text-white selection:bg-[#7C5CFF]/30 overflow-x-hidden flex items-center justify-center">
      {/* ── Smooth Dark CSS Radial Gradient Background & Subtle Moving Glow ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 30, -25, 0],
            y: [0, -25, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#7C5CFF]/15 via-[#6366F1]/10 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 30, -20, 0],
            scale: [1, 1.08, 0.92, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#22D3EE]/10 via-[#A855F7]/10 to-transparent blur-[140px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,92,255,0.12),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
