export default function RootLoading() {
  return (
    <div className="fixed inset-0 bg-[#06060A] flex flex-col items-center justify-center z-50 text-white select-none">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing orbit ring */}
        <div className="size-20 rounded-full border border-purple-500/20 animate-ping opacity-30" />
        {/* Inner rotating gradient spinner */}
        <div className="absolute size-14 rounded-full border-2 border-transparent border-t-purple-500 border-r-indigo-400 animate-spin" />
        {/* Core radiant glow */}
        <div className="size-4 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-1.5">
        <span className="text-sm font-bold tracking-wider uppercase text-zinc-200">
          Orbit
        </span>
        <span className="text-[11px] font-mono text-zinc-500">
          Loading workspace...
        </span>
      </div>
    </div>
  );
}
