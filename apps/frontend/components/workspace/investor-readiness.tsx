"use client";

import { motion } from "framer-motion";
import {
    Award, ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
    TrendingUp, Target, Users, Zap, FileText, ArrowRight, Star,
} from "lucide-react";
import type { ExecutionPlan, PipelineOutputs } from "@/types/api";

export function InvestorReadinessCenter({
    projectName,
    plan,
    outputs,
}: {
    projectName: string;
    plan: ExecutionPlan;
    outputs: PipelineOutputs;
}) {
    // Calculate 5 readiness scores
    const validationScore = plan.validation.confidence_score ?? 65;
    const productScore = outputs.product_strategy ? 88 : 55;
    const marketScore = outputs.market_research ? 82 : 60;
    const teamScore = 75; // Founder capability baseline
    const investmentScore = Math.round((validationScore + productScore + marketScore + teamScore) / 4);

    const scores = [
        { label: "Overall VC Readiness", score: investmentScore, icon: Award, color: "#6366F1" },
        { label: "Product & Tech Blueprint", score: productScore, icon: Target, color: "#A855F7" },
        { label: "Market & TAM Signal", score: marketScore, icon: TrendingUp, color: "#22D3EE" },
        { label: "Customer Validation", score: validationScore, icon: ShieldCheck, color: "#10B981" },
        { label: "Team & Execution Risk", score: teamScore, icon: Users, color: "#F59E0B" },
    ];

    const dealbreakers = [
        {
            title: "Unverified ICP Willingness-to-Pay",
            passed: Boolean(outputs.problem_discovery),
            fix: "Conduct 10 customer interviews with target budget holders and log willingness-to-pay evidence.",
        },
        {
            title: "Technical Architecture Definition",
            passed: Boolean(plan.technical_blueprint.stack.length > 0),
            fix: "Finalize frontend, database schema, and deployment architecture blueprint.",
        },
        {
            title: "Competitive Moat & Differentiation",
            passed: Boolean(outputs.market_research),
            fix: "Define proprietary dataset, network effects, or workflow lock-in mechanism.",
        },
        {
            title: "Regulatory & Compliance Risk Audit",
            passed: true,
            fix: "Verify GDPR/SOC2 requirements for initial target geography.",
        },
    ];

    return (
        <div className="work-surface" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
                <div>
                    <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Award className="size-4" style={{ color: "var(--indigo)" }} />
                        Investor Readiness Center
                    </p>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
                        Institutional Due Diligence Audit
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                        Evaluating <strong>{projectName}</strong> against 5 core venture capital investment benchmarks.
                    </p>
                </div>

                <div style={{
                    padding: "16px 24px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "var(--r-lg)",
                    textAlign: "right",
                }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                        Overall Readiness Score
                    </span>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--indigo)", marginTop: "2px" }}>
                        {investmentScore} <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>/ 100</span>
                    </div>
                </div>
            </div>

            {/* Score Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {scores.map(({ label, score, icon: Icon, color }) => (
                    <div key={label} style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-md)",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{
                                width: "32px", height: "32px", borderRadius: "var(--r-md)",
                                background: color + "18", color: color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Icon className="size-4" />
                            </span>
                            <span style={{ fontSize: "20px", fontWeight: 700, color: color }}>
                                {score}%
                            </span>
                        </div>

                        <div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block" }}>
                                {label}
                            </span>
                            <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: "2px" }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dealbreakers & Risk Audit */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                {/* Due Diligence Checklist */}
                <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: "24px",
                }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <ShieldCheck className="size-4" style={{ color: "var(--emerald)" }} />
                        VC Dealbreaker Checklist
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {dealbreakers.map((item) => (
                            <div key={item.title} style={{
                                padding: "14px",
                                background: "var(--surface-1)",
                                border: `1px solid ${item.passed ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                                borderRadius: "var(--r-md)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    {item.passed ? (
                                        <CheckCircle2 className="size-4 shrink-0" style={{ color: "var(--emerald)" }} />
                                    ) : (
                                        <AlertTriangle className="size-4 shrink-0" style={{ color: "var(--amber)" }} />
                                    )}
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                        {item.title}
                                    </span>
                                </div>
                                {!item.passed && (
                                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", paddingLeft: "26px", lineHeight: 1.5 }}>
                                        <strong>Action required:</strong> {item.fix}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Investment Memo Summary */}
                <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}>
                    <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FileText className="size-4" style={{ color: "var(--indigo)" }} />
                            VC Investment Thesis Teaser
                        </h3>

                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            {outputs.pitch_deck?.one_liner || `${projectName} addresses urgent inefficiencies with specialized automated workflows.`}
                        </p>

                        <div style={{ marginTop: "20px", padding: "16px", background: "var(--surface-1)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                                Target Investment Round
                            </span>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "6px" }}>
                                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Pre-Seed / Seed</span>
                                <span style={{ fontSize: "13px", color: "var(--indigo)", fontWeight: 600 }}>$500k – $1.2M</span>
                            </div>
                        </div>
                    </div>

                    <a href="?view=council" className="btn-primary" style={{ marginTop: "24px", width: "100%", justifyContent: "center" }}>
                        Inspect Specialist Risk Review <ArrowRight className="size-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
