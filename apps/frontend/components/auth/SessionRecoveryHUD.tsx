"use client";

import { User, ArrowRight, ShieldCheck, LogOut, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";

interface SessionRecoveryHUDProps {
  user: {
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  onResume: () => void;
  onSwitchAccount: () => void;
  isLoading?: boolean;
}

export function SessionRecoveryHUD({
  user,
  onResume,
  onSwitchAccount,
  isLoading = false,
}: SessionRecoveryHUDProps) {
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-6"
    >
      {/* Active Session Status Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>ACTIVE SESSION RECOGNIZED</span>
      </div>

      {/* Operator Identity Card */}
      <div className="relative p-5 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="flex items-center gap-4">
          {/* Avatar / Initials */}
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[2px] shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <div className="size-full rounded-[14px] bg-[#0A0A14] flex items-center justify-center font-mono font-bold text-base text-white">
              {initials}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                {user.full_name || "Founder Operator"}
              </h3>
              <ShieldCheck className="size-4 text-emerald-400 flex-shrink-0" />
            </div>
            <p className="text-xs font-mono text-indigo-200/60 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
          <span className="flex items-center gap-1.5">
            <Radio className="size-3 text-indigo-400" />
            <span>Neural state synced</span>
          </span>
          <span className="text-indigo-300">Token valid</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <MagneticButton
          type="button"
          onClick={onResume}
          disabled={isLoading}
          className="w-full py-4 text-base tracking-wide"
        >
          <span>Continue to Operating System</span>
          <ArrowRight className="size-4" />
        </MagneticButton>

        <button
          type="button"
          onClick={onSwitchAccount}
          disabled={isLoading}
          className="w-full py-2.5 text-xs font-mono text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <LogOut className="size-3.5" />
          <span>Switch or connect different account</span>
        </button>
      </div>
    </motion.div>
  );
}
