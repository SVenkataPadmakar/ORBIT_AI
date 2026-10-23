// apps/frontend/components/landing/fallbacks/ProductSVG.tsx
// Static SVG fallback for Scene 3 (Product Formation)
// 12 circles converging into 1 monolith shape using SMIL animations (Section 6 & reduced-motion fallback)

"use client";

import React from "react";

interface ProductSVGProps {
  className?: string;
  isStatic?: boolean;
}

const INITIAL_NODES = [
  { cx: 65,  cy: 85,  r: 16 },
  { cx: 295, cy: 75,  r: 15 },
  { cx: 55,  cy: 275, r: 16 },
  { cx: 305, cy: 265, r: 15 },
  { cx: 45,  cy: 175, r: 14 },
  { cx: 315, cy: 180, r: 14 },
  { cx: 180, cy: 45,  r: 15 },
  { cx: 180, cy: 315, r: 15 },
  { cx: 110, cy: 125, r: 13 },
  { cx: 250, cy: 130, r: 13 },
  { cx: 115, cy: 235, r: 13 },
  { cx: 245, cy: 230, r: 13 },
];

const TARGET_NODES = [
  { cx: 155, cy: 115, r: 10 },
  { cx: 205, cy: 115, r: 10 },
  { cx: 155, cy: 145, r: 10 },
  { cx: 205, cy: 145, r: 10 },
  { cx: 155, cy: 175, r: 10 },
  { cx: 205, cy: 175, r: 10 },
  { cx: 155, cy: 205, r: 10 },
  { cx: 205, cy: 205, r: 10 },
  { cx: 155, cy: 235, r: 10 },
  { cx: 205, cy: 235, r: 10 },
  { cx: 155, cy: 265, r: 10 },
  { cx: 205, cy: 265, r: 10 },
];

export function ProductSVG({ className = "", isStatic = false }: ProductSVGProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 360 360"
        className="w-full max-w-md h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="productAmbientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.3" />
            <stop offset="65%" stopColor="#7C5CFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="monolithFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141424" />
            <stop offset="60%" stopColor="#0A0A12" />
            <stop offset="100%" stopColor="#06060B" />
          </linearGradient>

          <linearGradient id="monolithBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A48BFF" />
            <stop offset="50%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <filter id="bloomSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Core Glow */}
        <ellipse cx="180" cy="180" rx="140" ry="140" fill="url(#productAmbientGlow)" />

        {/* 12 Metaball Circles */}
        {INITIAL_NODES.map((init, i) => {
          const target = TARGET_NODES[i] ?? init;
          return (
            <circle
              key={i}
              cx={isStatic ? target.cx : init.cx}
              cy={isStatic ? target.cy : init.cy}
              r={isStatic ? target.r : init.r}
              fill="#7C5CFF"
              fillOpacity={isStatic ? "0.35" : "0.75"}
              stroke="#A48BFF"
              strokeWidth="1.2"
              strokeOpacity={isStatic ? "0.5" : "0.85"}
              filter="url(#bloomSoft)"
            >
              {!isStatic && (
                <>
                  <animate
                    attributeName="cx"
                    values={`${init.cx};${target.cx};${target.cx};${init.cx}`}
                    keyTimes="0;0.45;0.85;1"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${init.cy};${target.cy};${target.cy};${init.cy}`}
                    keyTimes="0;0.45;0.85;1"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values={`${init.r};${target.r};${target.r};${init.r}`}
                    keyTimes="0;0.45;0.85;1"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill-opacity"
                    values="0.8;0.3;0.3;0.8"
                    keyTimes="0;0.45;0.85;1"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                </>
              )}
            </circle>
          );
        })}

        {/* 1 Monolith Shape (Unified Body) */}
        <g opacity={isStatic ? "1" : "0"}>
          {!isStatic && (
            <animate
              attributeName="opacity"
              values="0;0;0.95;0.95;0"
              keyTimes="0;0.35;0.55;0.85;1"
              dur="5s"
              repeatCount="indefinite"
            />
          )}

          {/* Monolith Solid Slab */}
          <rect
            x="130"
            y="90"
            width="100"
            height="180"
            rx="14"
            fill="url(#monolithFill)"
            stroke="url(#monolithBorder)"
            strokeWidth="1.8"
            className="drop-shadow-[0_0_24px_rgba(124,92,255,0.35)]"
          />

          {/* Internal Wireframe Topology (Revealing Structure at 60%) */}
          <g stroke="#7C5CFF" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.65">
            {/* Horizontal Blueprint Grids */}
            <line x1="130" y1="135" x2="230" y2="135" />
            <line x1="130" y1="180" x2="230" y2="180" />
            <line x1="130" y1="225" x2="230" y2="225" />

            {/* Vertical Center Axis */}
            <line x1="180" y1="90" x2="180" y2="270" />

            {/* Diagonal Cad Braces */}
            <line x1="130" y1="90" x2="230" y2="270" strokeOpacity="0.25" />
            <line x1="230" y1="90" x2="130" y2="270" strokeOpacity="0.25" />
          </g>

          {/* Exterior Wireframe Cage Corners */}
          <rect
            x="126"
            y="86"
            width="108"
            height="188"
            rx="16"
            fill="none"
            stroke="#A48BFF"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        </g>
      </svg>
    </div>
  );
}
