"use client";

import React from "react";

interface SparkSVGProps {
  className?: string;
  isStatic?: boolean;
}

export function SparkSVG({ className = "", isStatic = false }: SparkSVGProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        className={`w-48 h-48 ${isStatic ? "" : "animate-pulse"}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="sparkGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#EDEDF2" stopOpacity="1" />
            <stop offset="25%" stopColor="#A48BFF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#7C5CFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>
          <filter id="sparkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Emissive Glow Circle */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#sparkGradient)"
          filter="url(#sparkGlow)"
        />

        {/* Dense Central Spark Core */}
        <circle cx="100" cy="100" r="16" fill="#EDEDF2" />
        <circle cx="100" cy="100" r="28" fill="#A48BFF" opacity="0.6" />
      </svg>
    </div>
  );
}
