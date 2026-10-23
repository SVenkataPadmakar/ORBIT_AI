"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Bot, CircleDollarSign, Database, Gauge, Server, Users } from "lucide-react";
import { adminApi } from "@/lib/api/client";
import { ErrorState, LoadingState, StatusBadge } from "@/components/ui/core";
import type { AdminMetric } from "@/types/api";

export default function AdminDashboard() {
    const overview = useQuery({ queryKey: ["admin-overview"], queryFn: adminApi.overview });
    const users = useQuery({ queryKey: ["admin-users"], queryFn: adminApi.users });
    if (overview.isLoading || users.isLoading) return <LoadingState label="Loading platform operations" />;
    if (overview.isError || !overview.data) return <ErrorState message={overview.error?.message ?? "Administrator access required"} />;
    const data = overview.data;
    return <div className="space-y-7">
        <header className="border-b border-border pb-6"><div className="flex items-center gap-2 text-xs font-semibold text-amber-200"><Gauge className="size-4" />Platform operations</div><h1 className="mt-3 text-2xl font-semibold">Control plane</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Real account, agent-run, token, and service records. Revenue remains modeled from subscription rows until Stripe synchronization is implemented.</p></header>
        <div className="evidence-warning"><AlertTriangle className="size-5 text-amber-300" /><div><p className="text-sm font-semibold">Revenue data is not Stripe cash truth</p><p className="mt-1 text-xs text-muted-foreground">Estimated MRR and ARPA use active paid-plan records at a fixed modeled price. Do not use these figures for financial reporting.</p></div></div>
        <AdminMetricStrip title="Customer operations" icon={Users} metrics={data.users} />
        <div className="grid gap-6 xl:grid-cols-2"><AdminMetricStrip title="Agent reliability" icon={Bot} metrics={data.agents} /><AdminMetricStrip title="AI consumption" icon={Activity} metrics={data.api_usage} /></div>
        <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><AdminMetricStrip title="Modeled subscriptions" icon={CircleDollarSign} metrics={data.revenue} /><section className="surface"><div className="flex items-center gap-2 border-b border-border p-5"><Server className="size-4 text-emerald-300" /><h2 className="text-sm font-semibold">Service state</h2></div><div className="grid gap-px bg-border sm:grid-cols-3">{data.system.map((metric) => <div key={metric.label} className="bg-surface p-5"><p className="text-[11px] text-muted-foreground">{metric.label}</p><p className="mt-3 flex items-center gap-2 text-sm font-semibold"><span className="size-2 bg-emerald-300" />{metric.value}</p></div>)}</div></section></div>
        <section className="surface overflow-hidden"><div className="flex items-center gap-2 border-b border-border p-5"><Database className="size-4 text-cyan-300" /><h2 className="text-sm font-semibold">Accounts and authorization</h2><span className="ml-auto text-xs text-muted-foreground">{users.data?.length ?? 0} records</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="border-b border-border text-[10px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Identity</th><th>Role</th><th>Status</th><th>Created</th></tr></thead><tbody>{users.data?.map((user) => <tr key={user.id} className="border-b border-border last:border-0"><td className="px-5 py-4"><p className="font-semibold">{user.full_name || "Founder"}</p><p className="mt-1 text-muted-foreground">{user.email}</p></td><td className="capitalize">{user.role}</td><td><StatusBadge status={user.is_active ? "active" : "inactive"} /></td><td className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>
    </div>;
}

function AdminMetricStrip({ title, icon: Icon, metrics }: { title: string; icon: typeof Database; metrics: AdminMetric[] }) { return <section><div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-amber-200" /><h2 className="text-sm font-semibold">{title}</h2></div><div className="grid gap-px border border-border bg-border sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="min-h-28 bg-surface p-5"><p className="text-[11px] text-muted-foreground">{metric.label}</p><p className="mt-5 text-2xl font-semibold">{metric.value}</p>{metric.trend_percent !== null && <p className="mt-1 text-[11px] text-emerald-300">{metric.trend_percent}% change</p>}</div>)}</div></section>; }
