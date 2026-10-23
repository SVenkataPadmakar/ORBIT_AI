"use client";

import { useMemo } from "react";

export function CosmicFallbackBackground() {
  // Generate deterministic stars for pure CSS rendering
  const stars = useMemo(() => {
    return Array.from({ length: 65 }, (_, i) => ({
      id: i,
      left: `${(i * 19.3) % 100}%`,
      top: `${(i * 29.7) % 100}%`,
      size: (i % 3) + 1.2,
      opacity: ((i % 5) + 3) / 10,
      duration: ((i % 4) + 2.5).toFixed(1),
      delay: ((i % 3) * 0.8).toFixed(1),
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        background: "radial-gradient(ellipse at 50% 40%, #0c0a24 0%, #050412 55%, #020205 100%)",
      }}
      aria-hidden="true"
    >
      {/* ── Nebula Glow Orbs ── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[130px] animate-pulse"
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: "750px",
          maxHeight: "750px",
          background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.3) 45%, rgba(6,182,212,0.1) 70%, transparent 85%)",
          animationDuration: "9s",
        }}
      />
      <div
        className="absolute top-2/3 left-1/3 -translate-x-1/2 rounded-full opacity-20 blur-[150px]"
        style={{
          width: "45vw",
          height: "45vw",
          maxWidth: "600px",
          maxHeight: "600px",
          background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 80%)",
        }}
      />

      {/* ── Subtle CSS Starfield ── */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 2}px rgba(255, 255, 255, 0.8)`,
            animation: `orbitStarTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* ── Central Orbital Core Visual (CSS Representation) ── */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        {/* Outer glowing orbital ring 1 */}
        <div
          className="absolute rounded-full border border-indigo-500/20"
          style={{
            width: "360px",
            height: "360px",
            transform: "rotateX(72deg) rotateY(15deg)",
            boxShadow: "0 0 35px rgba(99,102,241,0.15), inset 0 0 30px rgba(99,102,241,0.1)",
          }}
        />
        {/* Outer glowing orbital ring 2 */}
        <div
          className="absolute rounded-full border border-purple-500/25"
          style={{
            width: "460px",
            height: "460px",
            transform: "rotateX(68deg) rotateY(-25deg)",
            boxShadow: "0 0 45px rgba(168,85,247,0.15)",
          }}
        />
        {/* Core glowing sphere */}
        <div
          className="relative rounded-full shadow-2xl"
          style={{
            width: "120px",
            height: "120px",
            background: "radial-gradient(circle at 35% 35%, #818cf8 0%, #4338ca 40%, #1e1b4b 75%, #050412 100%)",
            boxShadow: "0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(139,92,246,0.35)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full border border-indigo-300/30"
            style={{
              animation: "spin 35s linear infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes orbitStarTwinkle {
          0% {
            opacity: 0.15;
            transform: scale(0.8);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
