"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#030308] text-white selection:bg-indigo-500/30 overflow-x-clip">
      {children}
    </div>
  );
}
