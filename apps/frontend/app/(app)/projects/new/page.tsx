"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Bot, Check,
         LoaderCircle, Zap, Target, Lightbulb, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiError, projectsApi } from "@/lib/api/client";
import { Brand } from "@/components/ui/core";
import type { Project, ProjectCreate } from "@/types/api";

const BUDGET_OPTIONS = ["Bootstrapped", "Under $25k", "$25k – $100k", "$100k – $500k", "$500k+"];

const STEPS = [
    { id: "name",        label: "Name",        icon: Lightbulb, question: "What are you building?",    hint: "Give your startup a working name. You can always rename it." },
    { id: "idea",        label: "Problem",     icon: Target,    question: "What problem does it solve?", hint: "Describe the painful situation and your proposed change. Be specific about the customer." },
    { id: "audience",    label: "Audience",    icon: Users,     question: "Who feels this most?",       hint: "Describe the role, company type, and current behavior of your target customer." },
    { id: "constraints", label: "Constraints", icon: Wallet,    question: "What are your constraints?",  hint: "Market, budget, timing, and any non-negotiables." },
] as const;

const EXAMPLE_NAMES = ["Relay Health", "Orbit Finance", "Anchor Legal", "Beacon HR", "Surge Analytics"];
const EXAMPLE_PROBLEMS = [
    "Operations leaders spend 4+ hours/week reconciling fragmented handoffs across tools. We want to create a single async command center...",
    "Small law firms lose clients between intake and first appointment. We want to automate the qualification and scheduling pipeline...",
    "HR teams at 50-200 person companies can't see which employees are flight risks until it's too late. We want to surface early signals...",
];

export default function NewProjectPage() {
    const router  = useRouter();
    const client  = useQueryClient();
    const [step,  setStep]  = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const [name,    setName]    = useState("");
    const [idea,    setIdea]    = useState("");
    const [audience,setAud]     = useState("");
    const [industry,setInd]     = useState("");
    const [budget,  setBudget]  = useState("");
    const [goals,   setGoals]   = useState("");

    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    useEffect(() => {
        setTimeout(() => (inputRef.current as HTMLInputElement | null)?.focus(), 120);
    }, [step]);

    const generateMutation = useMutation({
        mutationFn: async (payload: ProjectCreate): Promise<Project> => {
            const project = await projectsApi.create(payload);
            try {
                // Instantly kickoff the 7-agent pipeline with idea
                await projectsApi.startPipeline(project.id, { idea: payload.idea_description });
            } catch (err) {
                console.warn("Pipeline start kickoff warning:", err);
            }
            return project;
        },
        onSuccess: (project: Project) => {
            client.invalidateQueries({ queryKey: ["projects"] });
            // Instantly transition to workspace containing AgentPipeline
            router.push(`/projects/${project.id}`);
        },
        onError: (cause) => setError(cause instanceof ApiError ? cause.message : "The workspace could not be initialized."),
    });

    const canAdvance = [
        name.trim().length > 0,
        idea.trim().length > 20,
        audience.trim().length > 10,
        true, // constraints optional
    ][step] ?? true;

    function advance() {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else submit();
    }

    function submit() {
        setError(null);
        generateMutation.mutate({
            name: name.trim(),
            idea_description: idea.trim(),
            industry: industry.trim() || undefined,
            target_audience: audience.trim() || undefined,
            budget_band: budget || undefined,
            goals: goals.trim() || undefined,
        });
    }

    function onKey(e: React.KeyboardEvent) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) advance();
    }

    const currentStep = STEPS[step]!;
    const Icon = currentStep.icon;
    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div style={{
            minHeight: "100dvh",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Top bar */}
            <header style={{
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(10,10,15,0.8)",
                backdropFilter: "blur(20px)",
                position: "sticky", top: 0, zIndex: 40,
            }}>
                <Brand />
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Step dots */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {STEPS.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => i < step && setStep(i)}
                                style={{
                                    width: i === step ? "24px" : "8px",
                                    height: "8px",
                                    borderRadius: "4px",
                                    background: i < step ? "var(--emerald)" : i === step ? "var(--indigo)" : "var(--surface-3)",
                                    transition: "all 300ms ease",
                                    cursor: i < step ? "pointer" : "default",
                                }}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {step + 1} / {STEPS.length}
                    </span>
                </div>
                <Link
                    href="/dashboard"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)" }}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Link>
            </header>

            {/* Progress bar */}
            <div style={{ height: "2px", background: "var(--surface-3)" }}>
                <motion.div
                    style={{
                        height: "100%",
                        background: "linear-gradient(90deg, var(--indigo), var(--violet))",
                        borderRadius: "2px",
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* Main */}
            <div style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr min(560px, 100%)",
                maxWidth: "1280px",
                margin: "0 auto",
                width: "100%",
                padding: "0 24px",
                gap: "80px",
                alignItems: "center",
            }}>
                {/* Left: question area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{ padding: "64px 0" }}
                    >
                        {/* Eyebrow */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "5px 12px",
                            background: "var(--indigo-dim)",
                            border: "1px solid var(--border-accent)",
                            borderRadius: "var(--r-full)",
                            marginBottom: "28px",
                        }}>
                            <Icon className="size-3.5" style={{ color: "var(--indigo)" }} />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#A5B4FC", letterSpacing: "0.06em" }}>
                                {currentStep.label}
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: "clamp(28px, 4vw, 52px)",
                            fontWeight: 300,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            color: "var(--text-primary)",
                            maxWidth: "480px",
                            marginBottom: "16px",
                        }}>
                            {currentStep.question}
                        </h1>

                        <p style={{
                            fontSize: "15px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.65,
                            maxWidth: "400px",
                            marginBottom: "40px",
                        }}>
                            {currentStep.hint}
                        </p>

                        {/* Step input */}
                        <StepInput
                            step={step}
                            inputRef={inputRef}
                            name={name} setName={setName}
                            idea={idea} setIdea={setIdea}
                            audience={audience} setAud={setAud}
                            industry={industry} setInd={setInd}
                            budget={budget} setBudget={setBudget}
                            goals={goals} setGoals={setGoals}
                            onKey={onKey}
                        />

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        marginTop: "16px",
                                        padding: "12px 16px",
                                        background: "var(--red-dim)",
                                        border: "1px solid rgba(239,68,68,0.2)",
                                        borderRadius: "var(--r-md)",
                                        fontSize: "13px",
                                        color: "#FCA5A5",
                                    }}
                                    role="alert"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Navigation */}
                        <div style={{ display: "flex", gap: "12px", marginTop: "32px", alignItems: "center" }}>
                            {step > 0 && (
                                <button
                                    className="btn-secondary"
                                    onClick={() => setStep((s) => s - 1)}
                                    style={{ height: "48px" }}
                                >
                                    <ArrowLeft className="size-4" />
                                    Back
                                </button>
                            )}
                            <button
                                className="btn-primary"
                                onClick={advance}
                                disabled={!canAdvance || generateMutation.isPending}
                                style={{ height: "48px", paddingLeft: "24px", paddingRight: "24px" }}
                                data-cursor="hover"
                            >
                                {generateMutation.isPending ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : step === STEPS.length - 1 ? (
                                    <Zap className="size-4" fill="white" />
                                ) : (
                                    <ArrowRight className="size-4" />
                                )}
                                {generateMutation.isPending
                                    ? "Generating 7-Agent Pipeline..."
                                    : step === STEPS.length - 1
                                    ? "Generate"
                                    : "Continue"}
                            </button>

                            {step < STEPS.length - 1 && (
                                <button
                                    onClick={() => setStep((s) => s + 1)}
                                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                                >
                                    Skip for now
                                </button>
                            )}
                        </div>

                        <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--text-muted)" }}>
                            {step < STEPS.length - 1 ? (
                                <>Press <kbd style={{ padding: "1px 5px", background: "var(--surface-3)", borderRadius: "3px", border: "1px solid var(--border)", fontFamily: "inherit", fontSize: "10px" }}>⌘ Enter</kbd> to continue</>
                            ) : (
                                "Your analysis begins immediately after creation"
                            )}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Right: live preview panel */}
                <motion.aside
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-xl)",
                        overflow: "hidden",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                    }}
                >
                    {/* Panel header */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface-2)",
                    }}>
                        <span style={{
                            width: "28px", height: "28px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--violet), var(--purple))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <Bot className="size-3.5" style={{ color: "white" }} />
                        </span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Orbit Idea Co-Founder</p>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Building your workspace profile</p>
                        </div>
                        <span style={{
                            width: "6px", height: "6px",
                            borderRadius: "50%",
                            background: "var(--emerald)",
                            animation: "pulse-ring 2s ease-in-out infinite",
                        }} />
                    </div>

                    {/* Preview content */}
                    <div style={{ padding: "24px 20px" }}>

                        {/* Startup card preview */}
                        <div style={{
                            padding: "16px",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--r-lg)",
                            marginBottom: "20px",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                <span style={{
                                    width: "32px", height: "32px",
                                    borderRadius: "var(--r-md)",
                                    background: "linear-gradient(135deg, var(--indigo), var(--violet))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px", fontWeight: 700, color: "white",
                                }}>
                                    {name.trim() ? name.trim()[0]!.toUpperCase() : "?"}
                                </span>
                                <div>
                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                        {name.trim() || <span style={{ color: "var(--text-muted)" }}>Working name...</span>}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        {industry.trim() || "Market TBD"} · New workspace
                                    </p>
                                </div>
                            </div>

                            {idea.trim() && (
                                <p style={{
                                    fontSize: "12px",
                                    lineHeight: 1.6,
                                    color: "var(--text-secondary)",
                                    borderLeft: "2px solid var(--indigo)",
                                    paddingLeft: "10px",
                                }}>
                                    {idea.trim().slice(0, 120)}{idea.trim().length > 120 ? "..." : ""}
                                </p>
                            )}
                        </div>

                        {/* What happens next */}
                        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>
                            What happens next
                        </p>
                        {[
                            { label: "10 specialist agents activate",         done: step >= 0 },
                            { label: "Problem, Market, Risk agents debate",   done: step >= 1 },
                            { label: "Execution plan generated",              done: step >= 2 },
                            { label: "Architecture blueprint created",        done: step >= 3 },
                            { label: "Mission Control opens on first action", done: false },
                        ].map(({ label, done }, i) => (
                            <div key={label} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "9px 0",
                                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                            }}>
                                <span style={{
                                    width: "18px", height: "18px",
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                    background: done ? "var(--emerald-dim)" : "var(--surface-3)",
                                    border: `1px solid ${done ? "var(--emerald)" : "var(--border-strong)"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {done && <Check className="size-2.5" style={{ color: "var(--emerald)" }} />}
                                </span>
                                <span style={{ fontSize: "12px", color: done ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                    {label}
                                </span>
                            </div>
                        ))}

                        {/* Budget preview if set */}
                        {budget && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                style={{
                                    marginTop: "16px",
                                    padding: "12px 14px",
                                    background: "var(--amber-dim)",
                                    border: "1px solid rgba(245,158,11,0.2)",
                                    borderRadius: "var(--r-md)",
                                    fontSize: "12px",
                                    color: "#FCD34D",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <Wallet className="size-3.5 shrink-0" />
                                Capital band: <strong>{budget}</strong>
                            </motion.div>
                        )}
                    </div>
                </motion.aside>
            </div>
        </div>
    );
}

/* ─── Per-step input ────────────────────────────────────────────────────────── */

function StepInput({
    step, inputRef,
    name, setName,
    idea, setIdea,
    audience, setAud,
    industry, setInd,
    budget, setBudget,
    goals, setGoals,
    onKey,
}: {
    step: number;
    inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    name: string; setName: (v: string) => void;
    idea: string; setIdea: (v: string) => void;
    audience: string; setAud: (v: string) => void;
    industry: string; setInd: (v: string) => void;
    budget: string; setBudget: (v: string) => void;
    goals: string; setGoals: (v: string) => void;
    onKey: (e: React.KeyboardEvent) => void;
}) {
    if (step === 0) return (
        <div>
            <input
                ref={(el) => { inputRef.current = el; }}
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onKey}
                placeholder={EXAMPLE_NAMES[Math.floor(Math.random() * EXAMPLE_NAMES.length)]}
                maxLength={255}
                required
                style={{ height: "52px", fontSize: "18px", fontWeight: 500 }}
            />
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                A working name. You can rename this later.
            </p>
        </div>
    );

    if (step === 1) return (
        <textarea
            ref={(el) => { inputRef.current = el; }}
            className="field-area"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={onKey}
            placeholder={EXAMPLE_PROBLEMS[0]}
            maxLength={20000}
            style={{ minHeight: "200px", fontSize: "14px", lineHeight: 1.7 }}
        />
    );

    if (step === 2) return (
        <textarea
            ref={(el) => { inputRef.current = el; }}
            className="field-area"
            value={audience}
            onChange={(e) => setAud(e.target.value)}
            onKeyDown={onKey}
            placeholder="Operations managers at 100–500 person companies who currently use spreadsheets and Slack threads to coordinate cross-team handoffs..."
            maxLength={5000}
            style={{ minHeight: "160px", fontSize: "14px", lineHeight: 1.7 }}
        />
    );

    if (step === 3) return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
                <label className="label" htmlFor="industry-input">Market or domain</label>
                <input
                    id="industry-input"
                    ref={(el) => { inputRef.current = el; }}
                    className="field"
                    value={industry}
                    onChange={(e) => setInd(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Healthcare operations"
                    maxLength={100}
                />
            </div>

            <div>
                <label className="label" htmlFor="budget-select">Available starting capital</label>
                <select
                    id="budget-select"
                    className="field"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{ cursor: "pointer" }}
                >
                    <option value="">Not decided</option>
                    {BUDGET_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
            </div>

            <div>
                <label className="label" htmlFor="goals-input">Constraints &amp; non-negotiables</label>
                <textarea
                    id="goals-input"
                    className="field-area"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Launch within 6 months, solo technical founder, EU-only market, must be profitable before raising..."
                    maxLength={5000}
                    style={{ minHeight: "100px" }}
                />
            </div>
        </div>
    );

    return null;
}
