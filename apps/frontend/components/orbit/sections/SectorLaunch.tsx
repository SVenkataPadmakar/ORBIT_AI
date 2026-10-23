"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, ShieldCheck, Terminal, Radio } from "lucide-react";
import { Brand } from "@/components/ui/core";

export const SectorLaunch = memo(function SectorLaunch() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between px-6 md:px-14 pt-28 pb-12 select-none pointer-events-auto">
      {/* ── Main Launch CTA Console ── */}
      <div className="max-w-4xl mx-auto w-full text-center my-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SECTOR 05 · TERMINAL ORBIT INSERTION</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight"
        >
          Stop pitching ideas. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300">
            Launch autonomous companies.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg sm:text-xl text-indigo-100/70 max-w-xl mx-auto leading-relaxed"
        >
          Your first idea validation run is free. No credit card. No demo sales pitch.
          Immediate agent deliberation.
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            prefetch={true}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-105"
          >
            <Zap className="size-5 fill-white" />
            <span>Create Founder Account</span>
            <ArrowRight className="size-5" />
          </Link>

          <Link
            href="/login"
            prefetch={true}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium text-sm transition-colors"
          >
            Sign In
          </Link>
        </motion.div>

        <div className="flex items-center justify-center gap-6 text-xs font-mono text-white/40 pt-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>ZERO CREDIT CARD</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Radio className="size-3.5 text-indigo-400" />
            <span>LIVE GEMINI INTELLIGENCE</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Terminal className="size-3.5 text-cyan-400" />
            <span>INSTANT DEPLOYMENT</span>
          </span>
        </div>
      </div>

      {/* ── Deep Space Footer ── */}
      <footer className="w-full border-t border-white/10 pt-8 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/40">
        <Brand />
        <p className="font-mono text-[11px]">
          © 2026 Orbit Idea · Autonomous AI Startup Orchestration Platform.
        </p>
        <div className="flex gap-6 font-mono">
          {["Privacy", "Terms", "Documentation", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-white transition-colors"
              data-cursor="hover"
            >
              {item}
            </a>
          ))}
        </div>
      </footer>
    </section>
  );
});
