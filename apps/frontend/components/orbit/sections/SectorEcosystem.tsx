"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { CELESTIAL_NODES } from "../canvas/PlanetarySystem";
import { Globe2, ArrowRight, Layers, Radio, Sparkles } from "lucide-react";

interface SectorEcosystemProps {
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (id: string) => void;
}

export const SectorEcosystem = memo(function SectorEcosystem({
  hoveredNodeId,
  selectedNodeId,
  onHoverNode,
  onSelectNode,
}: SectorEcosystemProps) {
  const activeNode =
    CELESTIAL_NODES.find((n) => n.id === (hoveredNodeId || selectedNodeId)) ??
    CELESTIAL_NODES[0]!;

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-14 py-24 select-none pointer-events-auto">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Editorial Narrative Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300">
            <span className="size-1.5 rounded-full bg-purple-400" />
            <span>SECTOR 02 · ORBITAL ECOSYSTEM</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            See your startup as an{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300">
              interconnected celestial system
            </span>
            .
          </h2>

          <p className="text-base text-indigo-100/70 leading-relaxed">
            Every component in your business exerts gravitational pull on the others.
            A change in customer urgency immediately bends product architecture and
            series A investor thesis.
          </p>

          {/* Active Node Telemetry Card */}
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-xl bg-black/60 border border-white/15 p-5 rounded-2xl shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="size-3 rounded-full"
                  style={{ background: activeNode.color }}
                />
                <span className="text-xs font-mono tracking-wider uppercase text-white/40">
                  {activeNode.sector}
                </span>
              </div>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: activeNode.color }}
              >
                {activeNode.stats.value}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {activeNode.label}
            </h3>

            <p className="text-xs text-white/70 leading-relaxed font-sans">
              {activeNode.description}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => onSelectNode(activeNode.id)}
                className="text-xs font-mono text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors"
                data-cursor="hover"
              >
                <span>Inspect Orbital Dynamics</span>
                <ArrowRight className="size-3" />
              </button>
              <span className="text-[10px] font-mono text-white/30">
                CLICK NODE TO EXPAND
              </span>
            </div>
          </motion.div>

          <p className="text-xs font-mono text-indigo-300/40">
            ↗ Drag canvas to tilt orbital plane · Click any planet to inspect
          </p>
        </div>

        {/* Right Interactive Node Direct Selection Deck */}
        <div className="lg:col-span-7 flex flex-wrap gap-2.5 justify-end content-center">
          {CELESTIAL_NODES.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            return (
              <button
                key={node.id}
                onMouseEnter={() => onHoverNode(node.id)}
                onMouseLeave={() => onHoverNode(null)}
                onClick={() => onSelectNode(node.id)}
                className={`group px-4 py-3 rounded-xl border backdrop-blur-xl text-left transition-all duration-200 flex items-center gap-3.5 focus:outline-none ${
                  isHovered || isSelected
                    ? "bg-white/10 border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105"
                    : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
                data-cursor="hover"
              >
                <div
                  className="size-3.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                  style={{ background: node.color }}
                />
                <div>
                  <p className="text-xs font-semibold text-white tracking-tight">
                    {node.label}
                  </p>
                  <p className="text-[10px] font-mono text-white/40">
                    {node.stats.metric}: {node.stats.value}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});
