"use client";

import Link from "next/link";
import { Check, Mail, ShieldCheck, UserRound, ArrowRight, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none py-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-[#7C5CFF]">
            <span className="size-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_8px_#7C5CFF]" />
            <span>ACCOUNT & SECURITY</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Account Details
          </h1>
          <p className="text-sm text-white/50">
            Your identity and workspace access credentials.
          </p>
        </div>

        <Link
          href="/settings/profile"
          className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white flex items-center gap-2 transition-all"
        >
          <span>Edit Profile</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-[#7C5CFF] flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(124,92,255,0.4)]">
            <UserRound className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{user?.full_name || "Alex Vance"}</h2>
            <p className="text-xs font-mono text-[#22D3EE] mt-0.5">{user?.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Detail icon={Mail} label="Email Address" value={user?.email || "founder@orbit.dev"} />
          <Detail icon={ShieldCheck} label="Workspace Role" value={user?.role || "founder"} />
          <Detail icon={Check} label="Account Status" value={user?.is_active ? "Active" : "Inactive"} />
          <Detail icon={Check} label="Verification Status" value={user?.email_verified ? "Verified (Enterprise SSO)" : "Pending"} />
        </dl>
      </div>

      <div className="rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 p-6 flex items-start gap-4">
        <Lock className="size-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">Session Security & Token Rotation</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Access tokens rotate automatically with 256-bit AES encryption. Logging out revokes the active token immediately across all nodes.
          </p>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="size-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#7C5CFF]">
        <Icon className="size-4" />
      </div>
      <div>
        <dt className="text-xs font-mono text-white/50">{label}</dt>
        <dd className="text-sm font-semibold text-white capitalize mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
