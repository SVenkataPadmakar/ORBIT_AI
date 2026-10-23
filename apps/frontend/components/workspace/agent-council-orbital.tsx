"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
    Lightbulb, Search, Target, Gauge, MessageSquareText,
    ShieldCheck, ArrowRight, Play, LoaderCircle, Zap,
} from "lucide-react";
import type { AgentStage, PipelineOutputs, PipelineStatusResponse } from "@/types/api";

type AgentMeta = {
    key: AgentStage;
    label: string;
    role: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    angle: number; // degrees around the circle
};

const AGENTS: AgentMeta[] = [
    { key: "problem_discovery", label: "Problem",      role: "Opportunity",  icon: Lightbulb,          color: "#6366F1", angle: 0   },
    { key: "market_research",   label: "Market",       role: "Research",     icon: Search,             color: "#22D3EE", angle: 60  },
    { key: "product_strategy",  label: "Product",      role: "Product",      icon: Target,             color: "#A855F7", angle: 120 },
    { key: "finance",           label: "Economics",    role: "Finance",      icon: Gauge,              color: "#F59E0B", angle: 180 },
    { key: "pitch_deck",        label: "Narrative",    role: "Synthesis",    icon: MessageSquareText,  color: "#EC4899", angle: 240 },
    { key: "vc_evaluation",     label: "Verification", role: "Risk",         icon: ShieldCheck,        color: "#10B981", angle: 300 },
];

function summaryFor(key: AgentStage, output: PipelineOutputs[AgentStage]): string {
    if (!output) return "";
    if ("executive_summary" in output) return output.executive_summary;
    if (key === "product_strategy" && "product_vision" in output) return output.product_vision;
    if (key === "finance" && "pricing_strategy" in output) return output.pricing_strategy;
    if (key === "pitch_deck" && "one_liner" in output) return output.one_liner;
    if (key === "vc_evaluation" && "concerns" in output) return output.concerns[0] ?? "";
    return "";
}

function AgentNode({
    agent, status, outputs, isSelected, onClick, radius,
}: {
    agent: AgentMeta;
    status?: { status: string; provider: string } | undefined;
    outputs: PipelineOutputs;
    isSelected: boolean;
    onClick: () => void;
    radius: number;
}) {
    const angleRad = (agent.angle - 90) * (Math.PI / 180);
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    const Icon = agent.icon;

    const runStatus = status?.status ?? "idle";
    const isRunning   = runStatus === "running";
    const isSuccess   = runStatus === "success";
    const hasOutput   = Boolean(outputs[agent.key]);

    return (
        <motion.g
            style={{ cursor: "pointer" }}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: agent.angle / 600, ease: [0.34, 1.56, 0.64, 1] }}
        >
            {/* Pulse ring for active */}
            {(isRunning || isSelected) && (
                <circle
                    cx={x}
                    cy={y}
                    r={30}
                    fill="none"
                    stroke={agent.color}
                    strokeWidth={1.5}
                    opacity={0.3}
                    style={{ animation: "pulse-ring 1.5s ease-in-out infinite" }}
                />
            )}

            {/* Background circle */}
            <circle
                cx={x}
                cy={y}
                r={24}
                fill={isSelected ? agent.color + "30" : "#1C1C28"}
                stroke={isSelected || hasOutput ? agent.color : "#2A2A3E"}
                strokeWidth={isSelected ? 2 : 1}
            />

            {/* Status glow */}
            {isSuccess && (
                <circle
                    cx={x}
                    cy={y}
                    r={24}
                    fill="none"
                    stroke={agent.color}
                    strokeWidth={1}
                    opacity={0.4}
                />
            )}

            {/* Icon (rendered via foreignObject) */}
            <foreignObject x={x - 12} y={y - 12} width={24} height={24} style={{ pointerEvents: "none" }}>
                <div
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: "100%", height: "100%",
                        color: isSelected || hasOutput ? agent.color : "#52526E",
                    }}
                >
                    <Icon className="size-4" />
                </div>
            </foreignObject>

            {/* Label */}
            <text
                x={x}
                y={y + 38}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight={isSelected ? 700 : 500}
                fill={isSelected ? agent.color : "#52526E"}
                fontFamily="Inter, ui-sans-serif"
                style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
                {agent.label}
            </text>

            {/* Running indicator dot */}
            {isRunning && (
                <circle cx={x + 16} cy={y - 16} r={5} fill={agent.color}>
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                </circle>
            )}

            {/* Success checkmark dot */}
            {isSuccess && !isRunning && (
                <circle cx={x + 16} cy={y - 16} r={5} fill="#10B981" />
            )}
        </motion.g>
    );
}

export function AgentCouncilOrbital({
    status,
    outputs,
    mode,
    onRun,
    busy,
}: {
    status?: PipelineStatusResponse;
    outputs: PipelineOutputs;
    mode?: string;
    onRun: () => void;
    busy: boolean;
}) {
    const [selected, setSelected] = useState<AgentStage | null>(null);
    const [synthVisible, setSynthVisible] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const [svgSize, setSvgSize] = useState(560);

    // Responsive sizing
    useEffect(() => {
        function measure() {
            const w = svgRef.current?.parentElement?.clientWidth ?? 560;
            setSvgSize(Math.min(w, 560));
        }
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    useEffect(() => {
        if (status?.status === "completed") {
            setTimeout(() => setSynthVisible(true), 800);
        }
    }, [status]);

    const selectedAgent = AGENTS.find((a) => a.key === selected);
    const selectedRun   = status?.runs.find((r) => r.stage === selected);
    const selectedOut   = selected ? outputs[selected] : null;
    const selectedSummary = selected && selectedOut ? summaryFor(selected, selectedOut) : null;

    const center = svgSize / 2;
    const radius = svgSize * 0.32;

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div className="work-surface-toolbar" style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                gap: "20px", padding: "24px 28px", borderBottom: "1px solid var(--border)",
            }}>
                <div>
                    <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Zap className="size-4" style={{ color: "var(--indigo)" }} />
                        Specialist council
                    </p>
                    <h2 style={{ marginTop: "8px", fontSize: "20px", fontWeight: 600, color: "var(--text-primary)" }}>
                        6 agents. One founder decision.
                    </h2>
                    <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px" }}>
                        Each agent reviews your startup from a different angle. They debate assumptions, surface conflicts,
                        and produce a unified founder brief. Click any agent to inspect its finding.
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={onRun}
                    disabled={busy}
                    style={{ flexShrink: 0 }}
                    data-cursor="hover"
                >
                    {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Play className="size-4" />}
                    {status ? "Re-run council" : "Convene council"}
                </button>
            </div>

            {/* Orbital diagram + detail panel */}
            <div style={{
                display: "grid",
                gridTemplateColumns: selected ? "1fr 320px" : "1fr",
                gap: 0,
                minHeight: "520px",
            }}>
                {/* Orbital SVG */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
                    <div style={{ width: "100%", maxWidth: "560px" }}>
                        <svg
                            ref={svgRef}
                            width={svgSize}
                            height={svgSize}
                            viewBox={`0 0 ${svgSize} ${svgSize}`}
                            style={{ overflow: "visible" }}
                        >
                            {/* Orbit ring */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={1}
                                strokeDasharray="4 6"
                            />

                            {/* Edge lines from center to each agent */}
                            {AGENTS.map((agent) => {
                                const angleRad = (agent.angle - 90) * (Math.PI / 180);
                                const x = center + Math.cos(angleRad) * radius;
                                const y = center + Math.sin(angleRad) * radius;
                                const isActive = selected === agent.key || status?.runs.find((r) => r.stage === agent.key);
                                return (
                                    <line
                                        key={agent.key}
                                        x1={center} y1={center}
                                        x2={x} y2={y}
                                        stroke={isActive ? agent.color : "rgba(255,255,255,0.04)"}
                                        strokeWidth={isActive ? 1.5 : 1}
                                        strokeOpacity={isActive ? 0.4 : 1}
                                        strokeDasharray={isActive ? "none" : "2 4"}
                                    />
                                );
                            })}

                            {/* Center hub */}
                            <circle cx={center} cy={center} r={36} fill="#1E1E2E" stroke="rgba(99,102,241,0.3)" strokeWidth={1.5} />
                            <circle cx={center} cy={center} r={28} fill="#111118" stroke="rgba(99,102,241,0.15)" strokeWidth={1} />

                            {/* Center status */}
                            <foreignObject x={center - 14} y={center - 14} width={28} height={28}>
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: "100%", height: "100%",
                                    color: busy ? "#A5B4FC" : synthVisible ? "#6EE7B7" : "#52526E",
                                }}>
                                    {busy
                                        ? <LoaderCircle style={{ width: "20px", height: "20px", animation: "spin 1.5s linear infinite" }} />
                                        : <Zap style={{ width: "20px", height: "20px" }} fill={synthVisible ? "#6EE7B7" : "none"} />
                                    }
                                </div>
                            </foreignObject>

                            {busy && (
                                <text x={center} y={center + 52} textAnchor="middle" fontSize={10} fill="#9494B8" fontFamily="Inter, ui-sans-serif">
                                    Running council...
                                </text>
                            )}

                            {/* Agent nodes centered on hub */}
                            <g transform={`translate(${center}, ${center})`}>
                                {AGENTS.map((agent) => {
                                    const run = status?.runs.find((r) => r.stage === agent.key);
                                    return (
                                        <AgentNode
                                            key={agent.key}
                                            agent={agent}
                                            status={run ? { status: run.status, provider: run.provider } : undefined}
                                            outputs={outputs}
                                            isSelected={selected === agent.key}
                                            onClick={() => setSelected((v) => v === agent.key ? null : agent.key)}
                                            radius={radius}
                                        />
                                    );
                                })}
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                    {selected && selectedAgent && (
                        <motion.div
                            key={selected}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                borderLeft: "1px solid var(--border)",
                                padding: "28px 24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }}
                        >
                            {/* Agent header */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                    <span style={{
                                        width: "36px", height: "36px",
                                        borderRadius: "var(--r-md)",
                                        background: selectedAgent.color + "18",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: selectedAgent.color,
                                    }}>
                                        <selectedAgent.icon className="size-4" />
                                    </span>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                                            {selectedAgent.role} Agent
                                        </p>
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                            {selectedAgent.label} perspective
                                        </p>
                                    </div>
                                    <span style={{
                                        marginLeft: "auto",
                                        width: "8px", height: "8px",
                                        borderRadius: "50%",
                                        background: selectedRun?.status === "success"
                                            ? "var(--emerald)"
                                            : selectedRun?.status === "running"
                                            ? selectedAgent.color
                                            : "var(--text-disabled)",
                                        animation: selectedRun?.status === "running" ? "pulse-ring 1.5s ease-in-out infinite" : "none",
                                    }} />
                                </div>

                                <div style={{
                                    padding: "8px 12px",
                                    background: "var(--surface-2)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--r-md)",
                                    fontSize: "11px",
                                    color: "var(--text-muted)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}>
                                    <span>Provider: {selectedRun?.provider ?? mode ?? "not run"}</span>
                                    <span style={{ textTransform: "capitalize" }}>{selectedRun?.status ?? "idle"}</span>
                                </div>
                            </div>

                            {/* Finding */}
                            {selectedSummary ? (
                                <div>
                                    <p style={{
                                        fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                                        letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "10px",
                                    }}>
                                        Key Finding
                                    </p>
                                    <div style={{
                                        padding: "16px",
                                        background: "var(--surface-2)",
                                        border: `1px solid ${selectedAgent.color}25`,
                                        borderLeft: `3px solid ${selectedAgent.color}`,
                                        borderRadius: "var(--r-md)",
                                        fontSize: "13px",
                                        lineHeight: 1.65,
                                        color: "var(--text-secondary)",
                                    }}>
                                        {selectedSummary}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: "20px 16px",
                                    background: "var(--surface-2)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--r-md)",
                                    textAlign: "center",
                                }}>
                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                        No output yet for this agent.
                                    </p>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                                        Run the council to generate a {selectedAgent.label} analysis.
                                    </p>
                                    <button
                                        className="btn-primary"
                                        onClick={onRun}
                                        disabled={busy}
                                        style={{ marginTop: "16px", height: "36px", fontSize: "12px" }}
                                    >
                                        <Play className="size-3.5" />
                                        Convene council
                                    </button>
                                </div>
                            )}

                            {/* Close */}
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    marginTop: "auto",
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <ArrowRight className="size-3.5" />
                                Back to council view
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Synthesis bar */}
            <AnimatePresence>
                {synthVisible && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="council-synthesis"
                    >
                        <div>
                            <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <ShieldCheck className="size-4" style={{ color: "var(--emerald)" }} />
                                Synthesis boundary
                            </p>
                            <h3 style={{ marginTop: "8px", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                                Council review complete. Investor/risk verification included.
                            </h3>
                            <p style={{ marginTop: "8px", fontSize: "12px", lineHeight: 1.6, color: "var(--text-secondary)", maxWidth: "480px" }}>
                                Execution, reflection, and growth are expressed through mission plans and co-founder guidance —
                                not separate backend agents. No debate events are invented.
                            </p>
                        </div>
                        <a href="?view=mission" className="btn-secondary" style={{ flexShrink: 0 }}>
                            Open mission <ArrowRight className="size-4" />
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
