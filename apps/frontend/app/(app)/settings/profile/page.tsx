"use client";

import { useState } from "react";
import { User, Mail, Shield, Sparkles, Check, ArrowRight, Lock, Key, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function ProfilePage() {
  const currentUser = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const sessionToken = useAuthStore((s) => s.accessToken);

  const [fullName, setFullName] = useState(currentUser?.full_name || "Alex Vance (Founder)");
  const [email, setEmail] = useState(currentUser?.email || "founder@orbit.dev");
  const [role, setRole] = useState(currentUser?.role || "founder");
  const [thesis, setThesis] = useState("Building autonomous multi-agent co-founders for developer-first startups.");
  const [isSaved, setIsSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        full_name: fullName,
        email: email,
        role: role,
        updated_at: new Date().toISOString(),
      };
      setSession({
        access_token: sessionToken || "mock-jwt-token-orbit-founder-session",
        token_type: "bearer",
        expires_in: 86400 * 30,
        user: updatedUser,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none py-4">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-[#7C5CFF]">
          <span className="size-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_8px_#7C5CFF]" />
          <span>FOUNDER SETTINGS</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
          Profile & Identity
        </h1>
        <p className="text-sm text-white/50">
          Manage your operator identity, workspace access, and founder credentials.
        </p>
      </div>

      {/* ── Glassmorphic Profile Card ── */}
      <div className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-6 sm:p-8 shadow-xl space-y-8">
        {/* Profile Avatar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-white/10">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-[#7C5CFF] flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(124,92,255,0.4)] border border-indigo-400/30">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">{fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-white/50">
              <span className="text-[#22D3EE]">{email}</span>
              <span>·</span>
              <span className="capitalize px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/70">
                {role}
              </span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="size-3" />
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/70 flex items-center gap-2">
                <User className="size-3.5 text-[#7C5CFF]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7C5CFF] transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/70 flex items-center gap-2">
                <Mail className="size-3.5 text-[#22D3EE]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7C5CFF] transition-all"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/70 flex items-center gap-2">
                <Shield className="size-3.5 text-[#A855F7]" />
                <span>Workspace Role</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7C5CFF] transition-all"
              />
            </div>

            {/* Session Status */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/70 flex items-center gap-2">
                <Lock className="size-3.5 text-emerald-400" />
                <span>Session Security</span>
              </label>
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400/90 flex items-center justify-between">
                <span>Active (256-bit AES Token)</span>
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>
            </div>
          </div>

          {/* Founder Thesis */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/70 flex items-center gap-2">
              <Sparkles className="size-3.5 text-[#FB7185]" />
              <span>Founder Thesis / Vision</span>
            </label>
            <textarea
              rows={3}
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#7C5CFF] transition-all resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-mono text-white/40">
              Changes persist instantly across all agent workspaces.
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-[#7C5CFF] hover:from-indigo-500 hover:to-[#8E72FF] text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,92,255,0.4)] border border-indigo-400/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isSaved ? (
                <>
                  <Check className="size-3.5 text-emerald-300" />
                  <span>Saved Instantly!</span>
                </>
              ) : (
                <>
                  <span>Save Changes</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Operational Telemetry Card ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 p-4">
          <div className="text-2xl font-black text-white">7/7</div>
          <div className="text-[11px] font-mono uppercase text-white/50 mt-1">Autonomous Agents</div>
        </div>
        <div className="rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 p-4">
          <div className="text-2xl font-black text-white">&lt; 300ms</div>
          <div className="text-[11px] font-mono uppercase text-white/50 mt-1">SLA Latency</div>
        </div>
        <div className="rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10 p-4">
          <div className="text-2xl font-black text-white">v3.0 Online</div>
          <div className="text-[11px] font-mono uppercase text-white/50 mt-1">Kernel Status</div>
        </div>
      </div>
    </div>
  );
}

