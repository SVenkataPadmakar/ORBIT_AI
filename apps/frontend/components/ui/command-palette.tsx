"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Zap, Target, FlaskConical, Brain, Boxes, Rocket, TrendingUp, Settings, Plus, Hash, Clock, X, Cpu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/client";

type CommandItem = {
    id: string;
    label: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
    group: string;
    keywords?: string[];
    accent?: string;
};

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const projects = useQuery({
        queryKey: ["projects", "command"],
        queryFn: () => projectsApi.list({ limit: 10 }),
        enabled: open,
    });

    // Cmd+K toggle
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((v) => !v);
                setQuery("");
                setSelected(0);
            }
            if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Focus input when open
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const navigate = useCallback((path: string) => {
        router.push(path);
        setOpen(false);
        setQuery("");
    }, [router]);

    // Build command list
    const staticCommands: CommandItem[] = [
        {
            id: "new-project",
            label: "New Startup",
            description: "Start with a fresh idea",
            icon: Plus,
            action: () => navigate("/projects/new"),
            group: "Actions",
            keywords: ["create", "new", "idea", "start"],
            accent: "#6366F1",
        },
        {
            id: "dashboard",
            label: "Dashboard",
            description: "Your startup workspace hub",
            icon: Zap,
            action: () => navigate("/dashboard"),
            group: "Navigation",
            accent: "#8B5CF6",
        },
        {
            id: "settings",
            label: "Account Settings",
            description: "Profile, billing, API keys",
            icon: Settings,
            action: () => navigate("/settings/account"),
            group: "Navigation",
        },
        {
            id: "admin",
            label: "Admin Panel",
            description: "Platform operations",
            icon: Cpu,
            action: () => navigate("/admin"),
            group: "Navigation",
        },
    ];

    const viewCommands: CommandItem[] = [
        { id: "view-mission",   label: "Mission Control",  description: "Decisions & execution",  icon: Target,      action: () => {}, group: "Views", accent: "#6366F1" },
        { id: "view-evidence",  label: "Evidence Lab",     description: "Assumptions & gaps",     icon: FlaskConical,action: () => {}, group: "Views", accent: "#22D3EE" },
        { id: "view-agents",    label: "Agent Council",    description: "Specialist analysis",    icon: Brain,       action: () => {}, group: "Views", accent: "#8B5CF6" },
        { id: "view-build",     label: "Build Workspace",  description: "Architecture & sprints", icon: Boxes,       action: () => {}, group: "Views", accent: "#A855F7" },
        { id: "view-launch",    label: "Launch Center",    description: "Market entry readiness", icon: Rocket,      action: () => {}, group: "Views", accent: "#10B981" },
        { id: "view-growth",    label: "Growth Command",   description: "Post-launch scaling",    icon: TrendingUp,  action: () => {}, group: "Views", accent: "#F59E0B" },
    ];

    const projectCommands: CommandItem[] = (projects.data?.items ?? []).map((p) => ({
        id: `project-${p.id}`,
        label: p.name,
        description: p.industry || "Startup project",
        icon: Hash,
        action: () => navigate(`/projects/${p.id}`),
        group: "Projects",
        keywords: [p.name.toLowerCase(), p.industry?.toLowerCase() ?? ""],
        accent: "#6366F1",
    }));

    const allCommands = [...staticCommands, ...projectCommands, ...viewCommands];

    const filtered = query.trim()
        ? allCommands.filter((cmd) => {
            const q = query.toLowerCase();
            return (
                cmd.label.toLowerCase().includes(q) ||
                cmd.description?.toLowerCase().includes(q) ||
                cmd.keywords?.some((k) => k.includes(q))
            );
        })
        : allCommands;

    // Group filtered results
    const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group]!.push(item);
        return acc;
    }, {});

    const flat = filtered;

    // Keyboard nav
    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, flat.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
        if (e.key === "Enter") {
            e.preventDefault();
            const item = flat[selected];
            if (item) { item.action(); setOpen(false); setQuery(""); }
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 9000,
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                        }}
                        onClick={() => { setOpen(false); setQuery(""); }}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, scale: 0.96, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: "fixed",
                            top: "12vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "min(640px, calc(100vw - 32px))",
                            zIndex: 9001,
                            background: "var(--surface-2)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--r-xl)",
                            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
                            overflow: "hidden",
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Command palette"
                    >
                        {/* Search input */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "16px 20px",
                            borderBottom: "1px solid var(--border)",
                        }}>
                            <Search className="size-5 shrink-0" style={{ color: "var(--text-muted)" }} />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                                onKeyDown={onKeyDown}
                                placeholder="Search startups, views, actions..."
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    fontSize: "15px",
                                    color: "var(--text-primary)",
                                    caretColor: "var(--indigo)",
                                }}
                                aria-label="Search"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    style={{ color: "var(--text-muted)", lineHeight: 1 }}
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                            <kbd style={{
                                padding: "2px 8px",
                                background: "var(--surface-3)",
                                border: "1px solid var(--border-strong)",
                                borderRadius: "4px",
                                fontSize: "11px",
                                color: "var(--text-muted)",
                                fontFamily: "inherit",
                                flexShrink: 0,
                            }}>
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div style={{ maxHeight: "420px", overflowY: "auto", padding: "8px" }}>
                            {Object.entries(grouped).map(([group, items]) => (
                                <div key={group}>
                                    <p style={{
                                        padding: "8px 12px 4px",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        color: "var(--text-muted)",
                                    }}>
                                        {group}
                                    </p>
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        const globalIdx = flat.indexOf(item);
                                        const isSelected = globalIdx === selected;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => { item.action(); setOpen(false); setQuery(""); }}
                                                onMouseEnter={() => setSelected(globalIdx)}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    width: "100%",
                                                    padding: "10px 12px",
                                                    borderRadius: "var(--r-md)",
                                                    background: isSelected ? "var(--surface-3)" : "transparent",
                                                    border: isSelected ? `1px solid var(--border-strong)` : "1px solid transparent",
                                                    transition: "all 80ms ease",
                                                    textAlign: "left",
                                                }}
                                            >
                                                <span style={{
                                                    display: "flex",
                                                    width: "32px", height: "32px",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "var(--r-md)",
                                                    background: item.accent ? `${item.accent}18` : "var(--surface-3)",
                                                    color: item.accent ?? "var(--text-muted)",
                                                    flexShrink: 0,
                                                }}>
                                                    <Icon className="size-4" />
                                                </span>
                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                                        {item.label}
                                                    </span>
                                                    {item.description && (
                                                        <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </span>
                                                {isSelected && (
                                                    <ArrowRight className="size-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}

                            {filtered.length === 0 && (
                                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                        No results for &ldquo;{query}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "10px 20px",
                            borderTop: "1px solid var(--border)",
                            background: "var(--surface-1)",
                        }}>
                            {[
                                { keys: ["↑", "↓"], label: "Navigate" },
                                { keys: ["↵"], label: "Open" },
                                { keys: ["Esc"], label: "Close" },
                            ].map(({ keys, label }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
                                    {keys.map((k) => (
                                        <kbd key={k} style={{
                                            padding: "2px 6px",
                                            background: "var(--surface-3)",
                                            border: "1px solid var(--border-strong)",
                                            borderRadius: "3px",
                                            fontFamily: "inherit",
                                            fontSize: "10px",
                                        }}>
                                            {k}
                                        </kbd>
                                    ))}
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
