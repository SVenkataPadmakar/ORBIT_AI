"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Globe2, Activity, ArrowRight, Layers, Radio } from "lucide-react";
import { CELESTIAL_NODES, CelestialNode } from "../canvas/PlanetarySystem";

interface CelestialInspectorProps {
  selectedNodeId: string | null;
  onClose: () => void;
}

export function CelestialInspector({
  selectedNodeId,
  onClose,
}: CelestialInspectorProps) {
  const node = CELESTIAL_NODES.find((n) => n.id === selectedNodeId);

  return (
    <AnimatePresence>
      {node && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-8 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Inspector Card */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md backdrop-blur-2xl bg-[#090912]/90 border border-white/15 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden z-10"
          >
            {/* Top Accent Line */}
            <div
              className="absolute top-0 inset-x-0 h-1"
              style={{ background: `linear-gradient(90deg, transparent, ${node.color}, transparent)` }}
            />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `${node.color}20`,
                    border: `1px solid ${node.color}60`,
                    color: node.color,
                  }}
                >
                  <Globe2 className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/40">
                    {node.sector}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {node.label}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                data-cursor="hover"
                aria-label="Close inspector"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-indigo-100/70 mt-4 leading-relaxed">
              {node.description}
            </p>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-6">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  Telemetry Metric
                </span>
                <p className="text-xs font-semibold text-white/90 mt-0.5">
                  {node.stats.metric}
                </p>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  Measured Value
                </span>
                <p
                  className="text-sm font-mono font-bold mt-0.5"
                  style={{ color: node.color }}
                >
                  {node.stats.value}
                </p>
              </div>
            </div>

            {/* Sub-system Status */}
            <div className="flex items-center justify-between text-xs font-mono text-white/50 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Activity className="size-3.5 text-emerald-400" />
                <span>ORBIT STATUS: STABLE</span>
              </div>
              <span>R: {node.orbitRadius} AU</span>
            </div>

            {/* Action CTA */}
            <button
              onClick={onClose}
              className="w-full mt-5 py-3 px-4 rounded-xl font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-white shadow-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${node.color}, #4338CA)`,
              }}
              data-cursor="hover"
            >
              <span>Commit Telemetry Node</span>
              <ArrowRight className="size-3.5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
