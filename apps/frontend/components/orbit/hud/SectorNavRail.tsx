"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export interface SectorWaypoint {
  num: string;
  name: string;
  targetProgress: number;
}

export const SECTORS: SectorWaypoint[] = [
  { num: "01", name: "Core", targetProgress: 0.05 },
  { num: "02", name: "Ecosystem", targetProgress: 0.32 },
  { num: "03", name: "Council", targetProgress: 0.58 },
  { num: "04", name: "Trajectory", targetProgress: 0.78 },
  { num: "05", name: "Launch", targetProgress: 0.95 },
];

interface SectorNavRailProps {
  activeSectorIndex: number;
  onNavigateSector: (targetProgress: number) => void;
}

export const SectorNavRail = memo(function SectorNavRail({
  activeSectorIndex,
  onNavigateSector,
}: SectorNavRailProps) {
  const activeIndex = Math.min(
    SECTORS.length - 1,
    Math.max(0, activeSectorIndex)
  );

  return (
    <nav
      aria-label="Mission Sectors Waypoint Navigation"
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-5 pointer-events-auto select-none"
    >
      <div className="flex flex-col items-end gap-3.5 bg-black/40 backdrop-blur-md border border-white/5 p-2.5 rounded-full shadow-2xl">
        {SECTORS.map((sector, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={sector.num}
              onClick={() => onNavigateSector(sector.targetProgress)}
              className="group relative flex items-center justify-end gap-3 focus:outline-none"
              data-cursor="hover"
              aria-label={`Jump to Sector ${sector.num}: ${sector.name}`}
            >
              {/* Sector Name Tooltip on Hover */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-mono tracking-wider uppercase text-indigo-300 pr-1 pointer-events-none">
                {sector.num} · {sector.name}
              </span>

              {/* Waypoint Dot / Pill */}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-7 h-7 bg-indigo-500/20 border border-indigo-400"
                    : "w-3 h-3 bg-white/20 hover:bg-white/40 border border-transparent"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-dot"
                    className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_12px_#818CF8]"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
