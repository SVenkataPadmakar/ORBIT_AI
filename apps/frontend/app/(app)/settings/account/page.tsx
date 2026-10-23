"use client";

import { Check, Mail, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui/core";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AccountPage() {
    const user = useAuthStore((state) => state.user);
    return <div className="mx-auto max-w-4xl space-y-7"><PageHeader eyebrow="Settings" title="Account" description="Your identity and workspace access details." /><section className="surface p-5 sm:p-7"><div className="flex items-center gap-4 border-b pb-6"><span className="flex size-12 items-center justify-center rounded-md bg-accent-soft text-accent"><UserRound className="size-6" /></span><div className="min-w-0"><h2 className="truncate font-bold">{user?.full_name || "Founder"}</h2><p className="truncate text-sm text-muted-foreground">{user?.email}</p></div></div><dl className="mt-6 grid gap-5 sm:grid-cols-2"><Detail icon={Mail} label="Email address" value={user?.email || "Not available"} /><Detail icon={ShieldCheck} label="Workspace role" value={user?.role || "member"} /><Detail icon={Check} label="Account status" value={user?.is_active ? "Active" : "Inactive"} /><Detail icon={Check} label="Email verification" value={user?.email_verified ? "Verified" : "Pending verification"} /></dl></section><section className="border-l-2 border-coral pl-5"><h2 className="font-bold">Session security</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Access tokens are short-lived and the secure refresh session rotates automatically. Logging out revokes the current refresh session.</p></section></div>;
}
function Detail({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-accent" /><div><dt className="text-xs font-semibold text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-semibold capitalize">{value}</dd></div></div>; }
