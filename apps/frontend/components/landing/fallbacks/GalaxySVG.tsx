// apps/frontend/components/landing/fallbacks/GalaxySVG.tsx
// Static SVG fallback for Scene 5 (Startup Galaxy)
// ~5k dots across 4 clusters (Customers, Revenue, Investors, Team) with CSS float
// Section 6 & reduced-motion fallback

"use client";

import React, { useMemo } from "react";

interface GalaxySVGProps {
  className?: string;
  isStatic?: boolean;
}

interface ClusterInfo {
  name: string;
  color: string;
  angleOffset: number;
}

const CLUSTERS: ClusterInfo[] = [
  { name: "Customers", color: "#38BDF8", angleOffset: 0 },
  { name: "Revenue",   color: "#4ADE80", angleOffset: Math.PI * 0.5 },
  { name: "Investors", color: "#FBBF24", angleOffset: Math.PI * 1.0 },
  { name: "Team",      color: "#A48BFF", angleOffset: Math.PI * 1.5 },
];

const DOTS_PER_CLUSTER = 1250; // 4 * 1250 = 5,000 dots total

export function GalaxySVG({ className = "", isStatic = false }: GalaxySVGProps) {
  // Generate deterministic spiral dots for the ~5k points
  const clusterDots = useMemo(() => {
    return CLUSTERS.map((cluster) => {
      const dots: { cx: number; cy: number; r: number; opacity: number }[] = [];
      const center = 240;

      for (let i = 0; i < DOTS_PER_CLUSTER; i++) {
        const t = i / DOTS_PER_CLUSTER;
        // Logarithmic spiral radius: 18 to 210 px
        const radius = 18 + Math.pow(t, 0.8) * 192;
        // Spiral angle with pseudo-random jitter
        const pseudoRand = Math.sin(i * 12.9898 + cluster.angleOffset) * 43758.5453;
        const jitterR = (pseudoRand - Math.floor(pseudoRand) - 0.5) * (12 + t * 28);

        const angle = cluster.angleOffset + t * 4.2 + (jitterR * 0.02);
        const rEffective = radius + jitterR;

        const cx = Math.round((center + Math.cos(angle) * rEffective) * 10) / 10;
        const cy = Math.round((center + Math.sin(angle) * (rEffective * 0.88)) * 10) / 10;

        const dotR = 0.6 + ((i % 5) * 0.25);
        const opacity = 0.25 + 0.65 * (1 - t * 0.5);

        dots.push({ cx, cy, r: dotR, opacity });
      }
      return { cluster, dots };
    });
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 480 480"
        className="w-full max-w-xl h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="galaxyCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EDEDF2" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#7C5CFF" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#7C5CFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>

          <filter id="galaxySoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>
            {`
              @keyframes galaxySpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .galaxy-arm-motion {
                transform-origin: 240px 240px;
                animation: galaxySpin 60s linear infinite;
              }
              .galaxy-arm-static {
                animation: none !important;
              }
            `}
          </style>
        </defs>

        {/* Ambient Core Halo */}
        <circle cx="240" cy="240" r="180" fill="url(#galaxyCoreGlow)" />

        {/* 4 Galaxy Clusters (~5k dots total) */}
        <g className={isStatic ? "galaxy-arm-static" : "galaxy-arm-motion"}>
          {clusterDots.map(({ cluster, dots }) => (
            <g key={cluster.name}>
              {dots.map((dot, idx) => (
                <circle
                  key={idx}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  fill={cluster.color}
                  opacity={dot.opacity}
                />
              ))}
            </g>
          ))}
        </g>

        {/* Central Core Star */}
        <circle cx="240" cy="240" r="6" fill="#FFFFFF" filter="url(#galaxySoftGlow)" />
        <circle cx="240" cy="240" r="14" stroke="#7C5CFF" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="2 3" />

        {/* Cluster Monospace Category Labels */}
        {CLUSTERS.map((cluster, i) => {
          const labelAngle = cluster.angleOffset + 1.2;
          const labelDist = 175;
          const lx = 240 + Math.cos(labelAngle) * labelDist;
          const ly = 240 + Math.sin(labelAngle) * (labelDist * 0.88);

          return (
            <text
              key={cluster.name}
              x={lx}
              y={ly}
              fill={cluster.color}
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.1em"
              textAnchor="middle"
              opacity="0.85"
            >
              {cluster.name.toUpperCase()}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
