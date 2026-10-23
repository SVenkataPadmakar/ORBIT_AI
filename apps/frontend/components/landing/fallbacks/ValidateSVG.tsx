"use client";

import React from "react";

interface ValidateSVGProps {
  className?: string;
  isStatic?: boolean;
}

export function ValidateSVG({ className = "", isStatic = false }: ValidateSVGProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 200"
        className="w-full max-w-md h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="corePulseGlow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central Core Ambient Glow */}
        <ellipse cx="160" cy="100" rx="90" ry="45" fill="url(#corePulseGlow)" />

        {/* Ring 1 (Inner) */}
        <ellipse
          cx="160"
          cy="100"
          rx="55"
          ry="25"
          stroke="#7C5CFF"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Ring 2 (Mid) */}
        <ellipse
          cx="160"
          cy="100"
          rx="95"
          ry="44"
          stroke="#7C5CFF"
          strokeWidth="1.5"
          strokeOpacity="0.45"
        />

        {/* Ring 3 (Outer) */}
        <ellipse
          cx="160"
          cy="100"
          rx="135"
          ry="63"
          stroke="#7C5CFF"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        {/* Center Spark Marker */}
        <circle cx="160" cy="100" r="4" fill="#EDEDF2" />
        <circle cx="160" cy="100" r="8" fill="#7C5CFF" opacity="0.5" />

        {/* Signal Pulses (Signal Green #4ADE80) */}
        {/* Signal 1 on Ring 1 */}
        <circle
          cx="195"
          cy="87"
          r="3"
          fill="#4ADE80"
          className={isStatic ? "" : "animate-ping"}
          style={{ animationDuration: "3s" }}
        />
        <circle cx="195" cy="87" r="2.5" fill="#4ADE80" />

        {/* Signal 2 on Ring 2 */}
        <circle
          cx="100"
          cy="120"
          r="3"
          fill="#4ADE80"
          className={isStatic ? "" : "animate-ping"}
          style={{ animationDuration: "2.4s", animationDelay: "0.8s" }}
        />
        <circle cx="100" cy="120" r="2.5" fill="#4ADE80" />

        {/* Signal 3 on Ring 3 */}
        <circle
          cx="255"
          cy="128"
          r="3"
          fill="#4ADE80"
          className={isStatic ? "" : "animate-ping"}
          style={{ animationDuration: "3.2s", animationDelay: "1.5s" }}
        />
        <circle cx="255" cy="128" r="2.5" fill="#4ADE80" />
      </svg>
    </div>
  );
}
