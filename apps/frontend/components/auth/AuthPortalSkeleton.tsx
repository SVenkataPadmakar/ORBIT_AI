export function AuthPortalSkeleton({ mode = "login" }: { mode?: "login" | "register" }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#030308]">
      {/* ── Instant Cosmic Ambient Atmosphere ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(circle at 50% 10%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 40%)",
        }}
      />

      {/* ── Master Glassmorphic Portal Skeleton ── */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="relative rounded-3xl border border-white/[0.12] bg-[#0A0A14]/85 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] p-6 sm:p-8 overflow-hidden animate-pulse">
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-mono text-indigo-300">
              <span className="size-1.5 rounded-full bg-indigo-400" />
              <span>ORBIT AI PORTAL · v3.0</span>
            </div>
            <span className="text-xs font-mono text-white/30">Connecting...</span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6 text-xs font-mono">
            <div className={`py-2 rounded-lg text-center ${mode === "login" ? "bg-indigo-600/70 text-white font-semibold" : "text-white/40"}`}>
              Password
            </div>
            <div className="py-2 rounded-lg text-center text-white/40">
              Magic OTP
            </div>
            <div className={`py-2 rounded-lg text-center ${mode === "register" ? "bg-indigo-600/70 text-white font-semibold" : "text-white/40"}`}>
              Create
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2 mb-6">
            <div className="h-6 w-48 rounded-lg bg-white/10" />
            <div className="h-3.5 w-64 rounded-md bg-white/5" />
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-white/10" />
              <div className="h-11 w-full rounded-xl bg-white/[0.04] border border-white/10" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/10" />
              <div className="h-11 w-full rounded-xl bg-white/[0.04] border border-white/10" />
            </div>
          </div>

          {/* Action Button */}
          <div className="h-12 w-full rounded-2xl bg-indigo-600/80 shadow-[0_0_20px_rgba(99,102,241,0.3)] mb-4 flex items-center justify-center">
            <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          </div>

          {/* Divider */}
          <div className="h-4 w-full flex items-center justify-center my-4">
            <div className="h-px w-full bg-white/10" />
          </div>

          {/* Google Button */}
          <div className="h-11 w-full rounded-xl bg-white/[0.04] border border-white/10" />
        </div>
      </div>
    </div>
  );
}
