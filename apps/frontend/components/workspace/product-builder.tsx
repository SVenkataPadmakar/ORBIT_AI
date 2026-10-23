"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target, Users, Lightbulb, CheckCircle2, Plus, ArrowRight,
    Layers, Shield, Sparkles, FileText, Check, AlertCircle,
} from "lucide-react";
import { useStartupStore, Feature, Persona } from "@/lib/stores/startup-store";

export function ProductBuilder() {
    const {
        name, idea, problem, valueProposition, personas, userStories, features, mvpScope,
        updateProductMemory, addFeature,
    } = useStartupStore();

    const [activeTab, setActiveTab] = useState<"prd" | "personas" | "stories" | "features">("prd");
    const [newFeatureName, setNewFeatureName] = useState("");
    const [newFeatureDesc, setNewFeatureDesc] = useState("");

    function handleAddFeature(e: React.FormEvent) {
        e.preventDefault();
        if (!newFeatureName.trim()) return;
        const newFeat: Feature = {
            id: `f-${Date.now()}`,
            name: newFeatureName.trim(),
            description: newFeatureDesc.trim() || "Generated MVP feature",
            priority: "must",
            inMvp: true,
            acceptanceCriteria: ["Feature requirement verified"],
        };
        addFeature(newFeat);
        setNewFeatureName("");
        setNewFeatureDesc("");
    }

    function toggleMvp(id: string) {
        const updated = features.map((f) => f.id === id ? { ...f, inMvp: !f.inMvp } : f);
        const newScope = updated.filter((f) => f.inMvp).map((f) => f.name);
        updateProductMemory({ features: updated, mvpScope: newScope });
    }

    return (
        <div className="work-surface" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div>
                    <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Target className="size-4" style={{ color: "var(--indigo)" }} />
                        Product Builder Engine
                    </p>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
                        Product Requirements &amp; MVP Scope Definition
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                        Transforms raw startup ideas into structured product requirements, personas, and user stories.
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div style={{ display: "flex", background: "var(--surface-2)", padding: "4px", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                    {[
                        { id: "prd",      label: "PRD Overview", icon: FileText },
                        { id: "personas", label: "User Personas", icon: Users },
                        { id: "stories",  label: "User Stories", icon: Lightbulb },
                        { id: "features", label: "MVP Scope",    icon: Layers },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "8px 14px", borderRadius: "var(--r-sm)",
                                fontSize: "12px", fontWeight: 600,
                                color: activeTab === id ? "var(--text-primary)" : "var(--text-muted)",
                                background: activeTab === id ? "var(--surface-3)" : "transparent",
                                border: activeTab === id ? "1px solid var(--border-strong)" : "1px solid transparent",
                                transition: "all 120ms ease",
                            }}
                        >
                            <Icon className="size-3.5" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Contents */}
            <AnimatePresence mode="wait">
                {activeTab === "prd" && (
                    <motion.div key="prd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Vision & Problem Statement */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--indigo)", letterSpacing: "0.08em" }}>
                                    Focus Problem Statement
                                </span>
                                <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, marginTop: "8px", lineHeight: 1.6 }}>
                                    {problem}
                                </p>
                            </div>

                            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--emerald)", letterSpacing: "0.08em" }}>
                                    Core Value Proposition
                                </span>
                                <p style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, marginTop: "8px", lineHeight: 1.6 }}>
                                    {valueProposition}
                                </p>
                            </div>
                        </div>

                        {/* MVP Scope Highlights */}
                        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <CheckCircle2 className="size-4" style={{ color: "var(--emerald)" }} />
                                MVP Release Boundaries ({mvpScope.length} Features Included)
                            </h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {mvpScope.map((item) => (
                                    <span key={item} style={{ padding: "6px 12px", background: "var(--emerald-dim)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "var(--r-full)", fontSize: "12px", fontWeight: 600, color: "#6EE7B7" }}>
                                        ✓ {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "personas" && (
                    <motion.div key="personas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                        {personas.map((p) => (
                            <div key={p.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div>
                                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</h4>
                                    <span style={{ fontSize: "12px", color: "var(--indigo)", fontWeight: 600 }}>{p.role}</span>
                                </div>

                                <div>
                                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Key Goals</span>
                                    <ul style={{ marginTop: "4px", paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                        {p.goals.map((g) => <li key={g}>{g}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--amber)" }}>Current Pains</span>
                                    <ul style={{ marginTop: "4px", paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                        {p.pains.map((pa) => <li key={pa}>{pa}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "stories" && (
                    <motion.div key="stories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {userStories.map((story, i) => (
                            <div key={i} style={{ padding: "16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6, display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--indigo-dim)", color: "var(--indigo)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                                    {i + 1}
                                </span>
                                {story}
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "features" && (
                    <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Add Feature Form */}
                        <form onSubmit={handleAddFeature} style={{ display: "flex", gap: "12px", background: "var(--surface-2)", padding: "16px", borderRadius: "var(--r-lg)", border: "1px solid var(--border)" }}>
                            <input
                                className="field"
                                placeholder="New Feature Name..."
                                value={newFeatureName}
                                onChange={(e) => setNewFeatureName(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <input
                                className="field"
                                placeholder="Feature Description..."
                                value={newFeatureDesc}
                                onChange={(e) => setNewFeatureDesc(e.target.value)}
                                style={{ flex: 1.5 }}
                            />
                            <button className="btn-primary" type="submit">
                                <Plus className="size-4" /> Add Feature
                            </button>
                        </form>

                        {/* Features List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {features.map((feat) => (
                                <div key={feat.id} style={{ padding: "16px", background: "var(--surface-2)", border: `1px solid ${feat.inMvp ? "var(--border-accent)" : "var(--border)"}`, borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{feat.name}</h4>
                                            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", background: feat.priority === "must" ? "var(--indigo-dim)" : "var(--surface-3)", color: feat.priority === "must" ? "#A5B4FC" : "var(--text-muted)" }}>
                                                {feat.priority}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{feat.description}</p>
                                    </div>

                                    <button
                                        onClick={() => toggleMvp(feat.id)}
                                        className={feat.inMvp ? "btn-primary" : "btn-secondary"}
                                        style={{ height: "34px", fontSize: "12px" }}
                                    >
                                        {feat.inMvp ? "In MVP Scope" : "Include in MVP"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
