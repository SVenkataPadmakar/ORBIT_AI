"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Brain, ShieldCheck, AlertTriangle, Sparkles, MessageSquare,
    CheckCircle2, ArrowRight, Zap, RefreshCw, Cpu, Layers,
    Scale, HelpCircle, Check, LoaderCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type { PipelineOutputs, PipelineStatusResponse } from "@/types/api";

export type DebateEvent = {
    id: string;
    agentA: string;
    agentB: string;
    topic: string;
    agentAArg: string;
    agentBArg: string;
    resolution: string;
    confidenceScore: number;
    status: "verified" | "flagged";
};

export type DebateCycleResponse = {
    project_id: string;
    status: string;
    consensus_score: number;
    debates: DebateEvent[];
    round: number;
    reflection_count: number;
};

export function AgentDebateSystem({
    projectId,
    projectName,
    outputs,
    status,
    onRunCouncil,
    busy,
}: {
    projectId?: string;
    projectName: string;
    outputs: PipelineOutputs;
    status?: PipelineStatusResponse;
    onRunCouncil: () => void;
    busy: boolean;
}) {
    const queryClient = useQueryClient();
    const [selectedDebate, setSelectedDebate] = useState<string | null>(null);

    // Baseline fallback debates
    const fallbackDebates: DebateEvent[] = [
        {
            id: "d1",
            agentA: "Technical Architect Agent",
            agentB: "Finance & Economics Agent",
            topic: `Infrastructure Sizing vs Monthly Burn Rate for ${projectName}`,
            agentAArg: "PostgreSQL with JSONB provides ACID compliance and relational integrity for core workspace models.",
            agentBArg: "Serverless KV has lower initial baseline cost ($0 vs $15/mo managed DB instance).",
            resolution: "Adopt PostgreSQL on Supabase/Neon free tier to maintain relational data integrity without upfront infrastructure cost.",
            confidenceScore: 94,
            status: "verified",
        },
        {
            id: "d2",
            agentA: "Product Strategy Agent",
            agentB: "VC Evaluation Risk Agent",
            topic: `MVP Scope: Broad Workflow Automation vs Niche ICP Tooling for ${projectName}`,
            agentAArg: "Building horizontal workflow integrations expands TAM and attracts broader enterprise teams.",
            agentBArg: "Broad scope increases execution risk and obscures willingness-to-pay validation in Month 1.",
            resolution: "Cut horizontal enterprise features. Focus initial MVP sprint exclusively on the single highest-severity pain point.",
            confidenceScore: 89,
            status: "verified",
        },
        {
            id: "d3",
            agentA: "UI/UX Architect Agent",
            agentB: "Problem Discovery Agent",
            topic: "Onboarding Experience: Single-page form vs Conversational Step-Flow",
            agentAArg: "Conversational step-flow increases completion rate by reducing cognitive overload.",
            agentBArg: "Power users may feel slowed down compared to a standard 1-page form.",
            resolution: "Implement multi-step onboarding with optional keyboard shortcut jump-ahead for power users.",
            confidenceScore: 92,
            status: "verified",
        },
    ];

    // Fetch live LangGraph debate cycles
    const { data: debateData, isLoading: debateLoading } = useQuery<DebateCycleResponse>({
        queryKey: ["project-debates", projectId],
        queryFn: async () => {
            if (!projectId) return null as any;
            return await apiFetch<DebateCycleResponse>(`/projects/${projectId}/debate`);
        },
        enabled: Boolean(projectId),
        staleTime: 30_000,
    });

    // Mutation to trigger new LangGraph debate cycle
    const debateMutation = useMutation({
        mutationFn: async () => {
            if (!projectId) {
                onRunCouncil();
                return;
            }
            return await apiFetch<DebateCycleResponse>(`/projects/${projectId}/debate`, {
                method: "POST",
            });
        },
        onSuccess: (data) => {
            if (data && projectId) {
                queryClient.setQueryData(["project-debates", projectId], data);
            }
        },
    });

    const activeDebates: DebateEvent[] = (debateData?.debates && debateData.debates.length > 0)
        ? debateData.debates
        : fallbackDebates;

    const currentSelected = selectedDebate || activeDebates[0]?.id || "d1";
    const active = activeDebates.find((d) => d.id === currentSelected) ?? activeDebates[0]!;
    const consensusScore = debateData?.consensus_score ?? 91;
    const consensusStatus = debateData?.status ?? "Consensus Reached";
    const debateRound = debateData?.round ?? 1;

    const isRunning = busy || debateMutation.isPending;

    return (
        <div className="work-surface" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Brain className="size-4" style={{ color: "var(--indigo)" }} />
                            Multi-Agent Debate &amp; Consensus Engine
                        </p>
                        <span style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono, monospace)",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "var(--emerald)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontWeight: 700,
                        }}>
                            LangGraph Round {debateRound} · {consensusScore}/100 Confidence
                        </span>
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
                        Specialist Cross-Agent Trade-Off Reviews
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                        Agents debate architectural compromises, scope boundaries, and market assumptions for <strong>{projectName}</strong>.
                    </p>
                </div>

                <button
                    className="btn-primary"
                    onClick={() => debateMutation.mutate()}
                    disabled={isRunning}
                    data-cursor="hover"
                >
                    {isRunning ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    {isRunning ? "Debating with LangGraph..." : "Trigger New Debate Cycle"}
                </button>
            </div>

            {/* 6-Phase Pipeline Workflow Steps */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "10px",
                padding: "16px 20px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)",
            }}>
                {[
                    { step: "01", label: "Research",   desc: "Problem & Market" },
                    { step: "02", label: "Reflect",    desc: "Socratic Critique" },
                    { step: "03", label: "Verify",     desc: "Evidence Audit" },
                    { step: "04", label: "Debate",     desc: "Trade-off Review" },
                    { step: "05", label: "Consensus",  desc: `${consensusScore}% Threshold` },
                    { step: "06", label: "Execute",    desc: "Sprint & Launch" },
                ].map((s, i) => (
                    <div key={s.step} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                color: i === 4 ? "var(--emerald)" : "var(--indigo)",
                                background: i === 4 ? "rgba(16, 185, 129, 0.15)" : "var(--indigo-dim)",
                                padding: "2px 6px",
                                borderRadius: "var(--r-sm)",
                            }}>
                                {s.step}
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                                {s.label}
                            </span>
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", paddingLeft: "4px" }}>
                            {s.desc}
                        </span>
                    </div>
                ))}
            </div>

            {/* Debate Grid: List on Left, Resolution Detail on Right */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "28px" }}>
                {/* Debate Topics List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Active Debate Log ({activeDebates.length})
                    </h3>

                    {activeDebates.map((d) => {
                        const isSelected = d.id === currentSelected;
                        return (
                            <button
                                key={d.id}
                                onClick={() => setSelectedDebate(d.id)}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    padding: "16px",
                                    borderRadius: "var(--r-md)",
                                    background: isSelected ? "var(--surface-2)" : "var(--surface-1)",
                                    border: isSelected ? "1px solid var(--border-accent)" : "1px solid var(--border)",
                                    textAlign: "left",
                                    transition: "all 120ms ease",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Scale className="size-3.5" style={{ color: "var(--indigo)" }} />
                                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                                            {d.agentA.split(" ")[0]} vs {d.agentB.split(" ")[0]}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        color: d.confidenceScore >= 90 ? "var(--emerald)" : "var(--amber)",
                                    }}>
                                        {d.confidenceScore}% Consensus
                                    </span>
                                </div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                                    {d.topic}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Debate Resolution View */}
                {active && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        padding: "24px",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-lg)",
                    }}>
                        <div>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase" }}>
                                Topic Synthesis
                            </span>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                                {active.topic}
                            </h2>
                        </div>

                        {/* Two Arguments Columns */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {/* Agent A Argument */}
                            <div style={{
                                padding: "14px",
                                background: "var(--surface-2)",
                                borderRadius: "var(--r-md)",
                                borderLeft: "3px solid var(--indigo)",
                            }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--indigo)", marginBottom: "4px" }}>
                                    {active.agentA}
                                </p>
                                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    {active.agentAArg}
                                </p>
                            </div>

                            {/* Agent B Argument */}
                            <div style={{
                                padding: "14px",
                                background: "var(--surface-2)",
                                borderRadius: "var(--r-md)",
                                borderLeft: "3px solid var(--amber)",
                            }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--amber)", marginBottom: "4px" }}>
                                    {active.agentB}
                                </p>
                                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    {active.agentBArg}
                                </p>
                            </div>
                        </div>

                        {/* Synthesized Resolution */}
                        <div style={{
                            padding: "16px",
                            background: "rgba(16, 185, 129, 0.08)",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            borderRadius: "var(--r-md)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <CheckCircle2 className="size-4" style={{ color: "var(--emerald)" }} />
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--emerald)", textTransform: "uppercase" }}>
                                    Consensus Resolution ({active.confidenceScore}% Confidence)
                                </span>
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                                {active.resolution}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
