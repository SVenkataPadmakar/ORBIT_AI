// apps/frontend/components/landing/fallbacks/AgentsSVG.tsx
// Static SVG fallback for Scene 4 (Agent Awakening)
// 7 dots on orbital paths around core nexus with CSS animation only (Section 6 & reduced-motion fallback)

"use client";

import React from "react";

interface AgentsSVGProps {
  className?: string;
  isStatic?: boolean;
}

const AGENTS = [
  { id: "market", label: "Market", rx: 65, ry: 40, rot: -25, dur: "10s", color: "#4ADE80", dotX: 180 + 65, dotY: 180 },
  { id: "product", label: "Product", rx: 88, ry: 50, rot: 35, dur: "13s", color: "#A48BFF", dotX: 180 + 88, dotY: 180 },
  { id: "architect", label: "Architect", rx: 110, ry: 62, rot: -50, dur: "16s", color: "#818CF8", dotX: 180 + 110, dotY: 180 },
  { id: "sprint", label: "Sprint", rx: 132, ry: 72, rot: 15, dur: "19s", color: "#38BDF8", dotX: 180 + 132, dotY: 180 },
  { id: "launch", label: "Launch", rx: 150, ry: 82, rot: -10, dur: "23s", color: "#F472B6", dotX: 180 + 150, dotY: 180 },
  { id: "growth", label: "Growth", rx: 168, ry: 90, rot: 60, dur: "27s", color: "#34D399", dotX: 180 + 168, dotY: 180 },
  { id: "investor", label: "Investor", rx: 184, ry: 98, rot: -40, dur: "31s", color: "#FBBF24", dotX: 180 + 184, dotY: 180 },
];

export function AgentsSVG({ className = "", isStatic = false }: AgentsSVGProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 420 420"
        className="w-full max-w-lg h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="agentCoreAmbient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#7C5CFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>

          <filter id="agentGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>
            {`
              @keyframes orbitSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .orbit-track {
                transform-origin: 210px 210px;
              }
              .agent-node-motion {
                transform-origin: 210px 210px;
                animation: orbitSpin var(--orbit-dur, 12s) linear infinite;
              }
              .agent-node-static {
                animation: none !important;
              }
            `}
          </style>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="210" cy="210" r="140" fill="url(#agentCoreAmbient)" />

        {/* Central Core Nexus (Monolith residue) */}
        <circle cx="210" cy="210" r="5" fill="#EDEDF2" filter="url(#agentGlow)" opacity="0.9" />
        <circle cx="210" cy="210" r="12" stroke="#7C5CFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

        {/* 7 Orbital Paths and Agent Nodes */}
        {AGENTS.map((agent, i) => {
          const initialAngle = (i * (360 / 7) + 25) % 360;
          return (
            <g
              key={agent.id}
              className="orbit-track"
              transform={`rotate(${agent.rot} 210 210)`}
            >
              {/* Elliptical Orbital Path */}
              <ellipse
                cx="210"
                cy="210"
                rx={agent.rx}
                ry={agent.ry}
                stroke="#7C5CFF"
                strokeWidth="1"
                strokeOpacity="0.22"
                strokeDasharray="2 4"
              />

              {/* Orbiting Agent Group (CSS Animation Only) */}
              <g
                className={isStatic ? "agent-node-static" : "agent-node-motion"}
                style={{
                  transform: isStatic ? `rotate(${initialAngle}deg)` : undefined,
                  ["--orbit-dur" as string]: agent.dur,
                }}
              >
                {/* Agent Node Dot */}
                <circle
                  cx={210 + agent.rx}
                  cy={210}
                  r="3.5"
                  fill={agent.color}
                  filter="url(#agentGlow)"
                />
                <circle
                  cx={210 + agent.rx}
                  cy={210}
                  r="7"
                  stroke={agent.color}
                  strokeWidth="0.8"
                  strokeOpacity="0.5"
                />

                {/* Monospace Tiny Label */}
                <text
                  x={210 + agent.rx + 10}
                  y={210 + 3}
                  fill="#EDEDF2"
                  fontSize="8.5"
                  fontFamily="monospace"
                  letterSpacing="0.08em"
                  opacity="0.85"
                >
                  {agent.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
