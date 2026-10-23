"use client";

import { Zap, CircleAlert, Inbox, LoaderCircle, Bot, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

import { OrbitLogo } from "@/components/ui/orbit-logo";

/* ─── Brand / Logo ─────────────────────────────────────────────────────────── */

export function Brand({ compact = false }: { compact?: boolean }) {
    return <OrbitLogo size="sm" showText={!compact} subtitle="AI Copilot" />;
}

/* ─── Status Badge ─────────────────────────────────────────────────────────── */

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    draft:     { bg: "rgba(255,255,255,0.04)", text: "var(--text-muted)",    dot: "var(--text-muted)" },
    active:    { bg: "var(--indigo-dim)",      text: "#A5B4FC",              dot: "var(--indigo)" },
    archived:  { bg: "rgba(255,255,255,0.04)", text: "var(--text-muted)",    dot: "var(--text-muted)" },
    queued:    { bg: "rgba(255,255,255,0.04)", text: "var(--text-muted)",    dot: "var(--text-muted)" },
    pending:   { bg: "var(--amber-dim)",       text: "#FCD34D",              dot: "var(--amber)" },
    running:   { bg: "var(--indigo-dim)",      text: "#A5B4FC",              dot: "var(--indigo)" },
    completed: { bg: "var(--emerald-dim)",     text: "#6EE7B7",              dot: "var(--emerald)" },
    complete:  { bg: "var(--emerald-dim)",     text: "#6EE7B7",              dot: "var(--emerald)" },
    success:   { bg: "var(--emerald-dim)",     text: "#6EE7B7",              dot: "var(--emerald)" },
    failed:    { bg: "var(--red-dim)",         text: "#FCA5A5",              dot: "var(--red)" },
    not_started: { bg: "rgba(255,255,255,0.04)", text: "var(--text-muted)", dot: "var(--text-muted)" },
};

export function StatusBadge({ status }: { status: string }) {
    const label = status.replaceAll("_", " ");
    const styles = statusStyles[status] ?? statusStyles.draft;
    if (!styles) return null;
    return (
        <span
            className="status-pill capitalize"
            style={{ background: styles.bg, color: styles.text }}
        >
            <span className="size-1.5 rounded-full" style={{ background: styles.dot }} />
            {label}
        </span>
    );
}

/* ─── Loading State ────────────────────────────────────────────────────────── */

export function LoadingState({ label = "Loading" }: { label?: string }) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-sm" role="status"
            style={{ color: "var(--text-muted)" }}>
            <div className="relative">
                <div className="size-10 rounded-full"
                    style={{ border: "2px solid var(--border-strong)" }} />
                <div className="absolute inset-0 size-10 rounded-full animate-spin"
                    style={{ border: "2px solid transparent", borderTopColor: "var(--indigo)" }} />
            </div>
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        </div>
    );
}

/* ─── Error State ──────────────────────────────────────────────────────────── */

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
    return (
        <div className="surface flex min-h-48 flex-col items-center justify-center gap-4 p-8 text-center"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)" }}>
            <span className="flex size-12 items-center justify-center rounded-xl"
                style={{ background: "var(--red-dim)", color: "var(--red)" }}>
                <CircleAlert className="size-6" aria-hidden="true" />
            </span>
            <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Something went wrong</p>
                <p className="mt-1.5 max-w-md break-words text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}>{message}</p>
            </div>
            {action}
        </div>
    );
}

/* ─── Empty State ──────────────────────────────────────────────────────────── */

export function EmptyState({ title, description, action }: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)" }}>
            <span className="mb-5 flex size-12 items-center justify-center rounded-xl"
                style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}>
                <Inbox className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}>{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

/* ─── Page Header ──────────────────────────────────────────────────────────── */

export function PageHeader({ eyebrow, title, description, action }: {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <header className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end"
            style={{ borderColor: "var(--border)" }}>
            <div className="min-w-0">
                {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl"
                    style={{ color: "var(--text-primary)" }}>{title}</h1>
                {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}>{description}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </header>
    );
}

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("skeleton h-4 w-full", className)} />;
}

/* ─── Agent Thinking Indicator ─────────────────────────────────────────────── */

export function AgentThinking({ label = "Agents working" }: { label?: string }) {
    return (
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 rounded-full"
                        style={{
                            background: "var(--indigo)",
                            animation: `pulse-ring 1.2s ease-in-out ${i * 200}ms infinite`
                        }} />
                ))}
            </div>
            <span>{label}</span>
        </div>
    );
}
