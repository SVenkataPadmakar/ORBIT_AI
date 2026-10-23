"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GitCompare, AlertTriangle, RefreshCw, CheckCircle2,
    Layers, Database, Code2, Layout, Boxes, ArrowRight, Zap,
} from "lucide-react";
import { useStartupStore } from "@/lib/stores/startup-store";

export function ChangeImpactEngine() {
    const { name, features, dbTables, apiEndpoints, pages, tasks } = useStartupStore();

    const [selectedChange, setSelectedChange] = useState<"auth" | "multi_tenant" | "billing">("auth");
    const [regenerated, setRegenerated] = useState(false);

    const changeScenarios = {
        auth: {
            title: "Add Enterprise SAML / Single Sign-On (SSO)",
            type: "Requirement Change",
            impact: {
                screens: ["Login / Portal Page", "Team Security Settings"],
                apis: ["POST /api/v1/auth/sso/saml", "GET /api/v1/auth/sso/callback"],
                tables: ["sso_configurations", "organization_domains"],
                tasks: ["Implement SAML Service Provider endpoint", "Add SSO provider UI tab in settings", "Update user role auth middleware"],
                architecture: ["Auth middleware update required for SAML token validation"],
            },
        },
        multi_tenant: {
            title: "Switch to Strict Multi-Tenant Isolation",
            type: "Architecture Shift",
            impact: {
                screens: ["Workspace Switcher Dropdown"],
                apis: ["Add X-Workspace-ID Header check to all endpoints"],
                tables: ["Add tenant_id column and composite index to all 3 tables"],
                tasks: ["Migrate PostgreSQL schema with tenant_id", "Add RLS policies in PostgreSQL"],
                architecture: ["Database Row Level Security (RLS) enforcement"],
            },
        },
        billing: {
            title: "Add Stripe Usage-Based Metered Billing",
            type: "Business Model Change",
            impact: {
                screens: ["Usage & Billing Dashboard"],
                apis: ["POST /api/v1/billing/stripe-webhook", "GET /api/v1/billing/usage"],
                tables: ["subscriptions", "usage_records"],
                tasks: ["Integrate Stripe SDK webhook handler", "Build usage tracking middleware"],
                architecture: ["Asynchronous Redis queue for billing events"],
            },
        },
    };

    const current = changeScenarios[selectedChange];

    function handleRegenerate() {
        setRegenerated(true);
        setTimeout(() => setRegenerated(false), 3000);
    }

    return (
        <div className="work-surface" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div>
                    <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <GitCompare className="size-4" style={{ color: "var(--indigo)" }} />
                        Change Impact &amp; Dependency Engine
                    </p>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
                        Requirement Change Propagation
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                        Evaluate how requirement and scope modifications ripple across UI screens, APIs, DB schemas, and Sprint tasks for <strong>{name}</strong>.
                    </p>
                </div>

                <button className="btn-primary" onClick={handleRegenerate} disabled={regenerated}>
                    {regenerated ? <CheckCircle2 className="size-4" style={{ color: "var(--emerald)" }} /> : <RefreshCw className="size-4" />}
                    {regenerated ? "Artifacts Regenerated!" : "Regenerate Affected Artifacts"}
                </button>
            </div>

            {/* Change Scenario Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
                {[
                    { id: "auth",         label: "+ Enterprise SAML / SSO",     type: "Requirement Change" },
                    { id: "multi_tenant", label: "Multi-Tenant Isolation",       type: "Architecture Shift" },
                    { id: "billing",      label: "Stripe Metered Usage Billing", type: "Business Model Change" },
                ].map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSelectedChange(s.id as any)}
                        style={{
                            padding: "12px 16px", borderRadius: "var(--r-md)",
                            fontSize: "12px", fontWeight: 600,
                            color: selectedChange === s.id ? "var(--text-primary)" : "var(--text-muted)",
                            background: selectedChange === s.id ? "var(--surface-2)" : "var(--surface-1)",
                            border: selectedChange === s.id ? "1px solid var(--border-accent)" : "1px solid var(--border)",
                            transition: "all 120ms ease",
                            textAlign: "left",
                        }}
                    >
                        <span style={{ fontSize: "10px", color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                            {s.type}
                        </span>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Impact Analysis Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                {/* Affected Screens */}
                <ImpactBox
                    title="Affected UI Screens"
                    count={current.impact.screens.length}
                    icon={Layout}
                    color="#6366F1"
                    items={current.impact.screens}
                />

                {/* Affected APIs */}
                <ImpactBox
                    title="Affected API Endpoints"
                    count={current.impact.apis.length}
                    icon={Code2}
                    color="#22D3EE"
                    items={current.impact.apis}
                />

                {/* Affected Database Tables */}
                <ImpactBox
                    title="Affected DB Tables"
                    count={current.impact.tables.length}
                    icon={Database}
                    color="#A855F7"
                    items={current.impact.tables}
                />

                {/* Affected Sprint Tasks */}
                <ImpactBox
                    title="Affected Sprint Tasks"
                    count={current.impact.tasks.length}
                    icon={Boxes}
                    color="#F59E0B"
                    items={current.impact.tasks}
                />
            </div>
        </div>
    );
}

function ImpactBox({ title, count, icon: Icon, color, items }: {
    title: string; count: number; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; items: string[];
}) {
    return (
        <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon className="size-4" style={{ color }} />
                    {title}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: color, background: color + "18", padding: "2px 8px", borderRadius: "var(--r-full)" }}>
                    {count} items
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item, i) => (
                    <div key={i} style={{ padding: "8px 12px", background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
