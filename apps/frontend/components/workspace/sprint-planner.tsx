"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Boxes, Check, Circle, Clock, AlertTriangle, ArrowRight,
    UserCheck, Terminal, ChevronRight, Play, LoaderCircle, Brain,
} from "lucide-react";
import { useStartupStore } from "@/lib/stores/startup-store";
import { CenterIntelligenceSection } from "@/components/cofounder/CenterIntelligenceSection";
import type { ExecutionPlan, ExecutionTask, ExecutionTaskStatus } from "@/types/api";

export function SprintPlanner({
    projectId,
    plan,
    onTaskStatus,
}: {
    projectId?: string;
    plan: ExecutionPlan;
    onTaskStatus: (taskId: string, status: ExecutionTaskStatus) => void;
}) {
    const { tasks: memoryTasks, updateTaskStatus } = useStartupStore();
    const [filterPhase, setFilterPhase] = useState<"all" | "build" | "launch" | "growth">("all");

    // Merge backend execution plan tasks with persistent startup memory tasks
    const allTasks = [
        ...memoryTasks.map((t) => ({
            id: t.id,
            phase: "build" as const,
            title: t.title,
            outcome: t.description,
            owner_role: t.role,
            duration_days: t.durationDays,
            dependencies: [],
            acceptance_criteria: ["Code completed and tested"],
            recommended_tools: ["Next.js", "FastAPI"],
            status: t.status as ExecutionTaskStatus,
            phaseLabel: "Product Sprint",
        })),
        ...plan.build.tasks.map((t) => ({ ...t, phaseLabel: "Build Sprint" })),
        ...plan.launch.tasks.map((t) => ({ ...t, phaseLabel: "Launch Sprint" })),
        ...plan.growth.tasks.map((t) => ({ ...t, phaseLabel: "Growth Sprint" })),
    ];

    const filtered = filterPhase === "all" ? allTasks : allTasks.filter((t) => t.phase === filterPhase);

    function handleTaskAdvance(taskId: string, status: ExecutionTaskStatus) {
        updateTaskStatus(taskId, status);
        onTaskStatus(taskId, status);
    }

    const columns: Array<{ id: ExecutionTaskStatus; label: string; tone: string }> = [
        { id: "todo",        label: "Backlog",     tone: "var(--text-muted)" },
        { id: "in_progress", label: "In Development", tone: "var(--cyan)" },
        { id: "blocked",     label: "Blocked / Review", tone: "var(--amber)" },
        { id: "done",        label: "Completed",   tone: "var(--emerald)" },
    ];

    return (
        <div className="work-surface" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                <div>
                    <p className="section-kicker" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Boxes className="size-4" style={{ color: "var(--indigo)" }} />
                        Development Manager Engine
                    </p>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
                        Interactive Sprint &amp; Task Kanban Board
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "600px" }}>
                        Manage sprint outcomes, developer roles, acceptance gates, and recommended tooling.
                    </p>
                </div>

                {/* Filter */}
                <div style={{ display: "flex", gap: "6px", background: "var(--surface-2)", padding: "4px", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                    {[
                        { id: "all",    label: "All Sprints" },
                        { id: "build",  label: "Build Phase" },
                        { id: "launch", label: "Launch Phase" },
                        { id: "growth", label: "Growth Phase" },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilterPhase(f.id as any)}
                            style={{
                                padding: "6px 12px", borderRadius: "var(--r-sm)",
                                fontSize: "12px", fontWeight: 600,
                                color: filterPhase === f.id ? "var(--text-primary)" : "var(--text-muted)",
                                background: filterPhase === f.id ? "var(--surface-3)" : "transparent",
                                transition: "all 120ms ease",
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Proactive Gemini Sprint Sentinel */}
            {projectId && (
                <CenterIntelligenceSection
                    projectId={projectId}
                    workspace="sprints"
                    headlineOverride="Sprint Board Intelligence: Scope Containment & Throughput Sentinel"
                />
            )}

            {/* Kanban Columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", minHeight: "480px" }}>
                {columns.map((col) => {
                    const colTasks = filtered.filter((t) => t.status === col.id);
                    return (
                        <div
                            key={col.id}
                            style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--r-lg)",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "14px",
                            }}
                        >
                            {/* Column Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: col.tone, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.tone }} />
                                    {col.label}
                                </span>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", background: "var(--surface-3)", padding: "2px 8px", borderRadius: "var(--r-full)" }}>
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Task Cards */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                                {colTasks.map((task) => (
                                    <TaskKanbanCard key={task.id} task={task} onStatus={handleTaskAdvance} />
                                ))}
                                {colTasks.length === 0 && (
                                    <div style={{ padding: "32px 16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--r-md)", marginTop: "12px" }}>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>No tasks in this state</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TaskKanbanCard({
    task,
    onStatus,
}: {
    task: ExecutionTask & { phaseLabel?: string };
    onStatus: (id: string, status: ExecutionTaskStatus) => void;
}) {
    const nextStatus: Record<ExecutionTaskStatus, ExecutionTaskStatus> = {
        todo: "in_progress",
        in_progress: "done",
        blocked: "in_progress",
        done: "todo",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--indigo)", letterSpacing: "0.06em" }}>
                    {task.phaseLabel ?? task.phase}
                </span>
                <button
                    onClick={() => onStatus(task.id, nextStatus[task.status])}
                    style={{ fontSize: "11px", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Advance status"
                >
                    {task.status === "done" ? <Check className="size-3 text-emerald-400" /> : <ChevronRight className="size-3" />}
                </button>
            </div>

            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                {task.title}
            </h4>

            <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {task.outcome}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--border)", fontSize: "10px", color: "var(--text-muted)" }}>
                <span>{task.owner_role}</span>
                <span>{task.duration_days}d est.</span>
            </div>
        </motion.div>
    );
}
