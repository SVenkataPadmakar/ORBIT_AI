"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Zap, Target, FlaskConical, Bot, Boxes, Rocket,
    TrendingUp, Settings, LogOut, Plus, Search, Shield,
    ChevronDown, Cpu, Brain, Menu, X, Calculator, Award, Activity,
    Layout, Database, Sparkles, FileText, GitCompare,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi, projectsApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils/cn";
import { Brand, LoadingState } from "@/components/ui/core";
import { OrbitLogo } from "@/components/ui/orbit-logo";

/* ─── Navigation items ──────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard",        icon: Layout, href: "/dashboard",        isProjectScoped: false },
    { id: "pipeline",  label: "7-Agent Pipeline", icon: Bot,    href: "",                  isProjectScoped: true  },
] as const;

/* ─── Rail icon button ──────────────────────────────────────────────────────── */
function RailLink({
    icon: Icon,
    label,
    href,
    active,
    onClick,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
}) {
    const cls = `rail-link${active ? " active" : ""}`;

    const inner = (
        <>
            <Icon className="size-4" />
            <span className="rail-tooltip">{label}</span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={cls} title={label} aria-label={label} data-cursor="hover">
                {inner}
            </Link>
        );
    }
    return (
        <button className={cls} title={label} aria-label={label} onClick={onClick} data-cursor="hover">
            {inner}
        </button>
    );
}

/* ─── Main AppShell ─────────────────────────────────────────────────────────── */
export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname     = usePathname();
    const params       = useParams();
    const router       = useRouter();
    const searchParams = useSearchParams();
    const [mobileOpen,  setMobileOpen]  = useState(false);
    const [restoring,   setRestoring]   = useState(false);
    const [searchOpen,  setSearchOpen]  = useState(false);
    const { accessToken, expiresAt, hasHydrated, user } = useAuthStore();

    const projectId = typeof params.projectId === "string" ? params.projectId : undefined;
    const isAdmin   = pathname.startsWith("/admin");
    const view      = searchParams.get("view") || "mission";

    const projects = useQuery({
        queryKey: ["projects", "shell"],
        queryFn: () => projectsApi.list({ limit: 25 }),
        enabled: Boolean(accessToken) && !isAdmin,
    });
    const activeProject = projects.data?.items.find((p) => p.id === projectId) ?? projects.data?.items[0];

    const refreshAttemptedRef = useRef(false);

    useEffect(() => {
        useAuthStore.getState().setHasHydrated(true);
    }, []);

    // Auth guard: single guarded restore attempt on unauthenticated mount
    useEffect(() => {
        if (!hasHydrated) return;
        if (accessToken) {
            refreshAttemptedRef.current = false;
            return;
        }
        if (refreshAttemptedRef.current || restoring) return;

        refreshAttemptedRef.current = true;
        setRestoring(true);
        authApi.refresh()
            .catch(() => {
                const target = `/login?next=${encodeURIComponent(pathname)}`;
                try {
                    router.replace(target);
                } catch {
                    window.location.href = target;
                }
            })
            .finally(() => {
                setRestoring(false);
            });
    }, [accessToken, hasHydrated, pathname, router]);

    // Token refresh
    useEffect(() => {
        if (!accessToken || !expiresAt || expiresAt > Date.now() + 30_000) return;
        authApi.refresh().catch(() => {
            const target = `/login?next=${encodeURIComponent(pathname)}`;
            try {
                router.replace(target);
            } catch {
                window.location.href = target;
            }
        });
    }, [accessToken, expiresAt, pathname, router]);

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Cmd+K search
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen((v) => !v);
            }
            if (e.key === "Escape") setSearchOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    async function handleLogout() {
        await authApi.logout().catch(() => undefined);
        router.replace("/login");
    }

    const projectHref = useMemo(
        () => (activeProject ? `/projects/${activeProject.id}` : "/projects/new"),
        [activeProject],
    );

    if (!hasHydrated || (!accessToken && restoring)) return <LoadingState label="Restoring workspace" />;
    if (!accessToken) return <LoadingState label="Verifying session" />;

    if (isAdmin) {
        return <AdminShell userName={user?.full_name || "Operator"} onLogout={handleLogout}>{children}</AdminShell>;
    }

    const userInitial = (user?.full_name || user?.email || "F").slice(0, 1).toUpperCase();

    return (
        <div className="workspace-os">
            {/* ── Icon Rail (desktop) ── */}
            <aside className="workspace-rail hidden lg:flex">
                {/* Brand orb */}
                <Link href="/dashboard" className="rail-brand" title="Orbit Idea" aria-label="Orbit Idea Dashboard" data-cursor="hover">
                    <OrbitLogo size="sm" showText={false} />
                </Link>

                {/* Project nav */}
                {NAV_ITEMS.map((item) => {
                    const href = item.isProjectScoped ? projectHref : item.href;
                    const active = item.isProjectScoped
                        ? pathname.startsWith("/projects/")
                        : pathname === item.href;
                    return (
                        <RailLink key={item.id} icon={item.icon} label={item.label} href={href} active={active} />
                    );
                })}

                <div className="rail-divider" />

                <RailLink icon={Plus}     label="New startup"   href="/projects/new" />
                <RailLink icon={Settings} label="Settings"      href="/settings/account" />
                {user?.role === "admin" && (
                    <RailLink icon={Shield} label="Admin" href="/admin" />
                )}

                {/* Spacer + user avatar at bottom */}
                <div style={{ flex: 1 }} />
                <div className="rail-divider" />
                <button
                    className="rail-link"
                    title={user?.email || "Account"}
                    aria-label={`Sign out (${user?.email || "Account"})`}
                    onClick={handleLogout}
                    data-cursor="hover"
                    style={{ marginBottom: "8px" }}
                >
                    <span style={{
                        width: "28px", height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--indigo), var(--violet))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, color: "white",
                    }}>
                        {userInitial}
                    </span>
                    <span className="rail-tooltip">Sign out ({user?.email})</span>
                </button>
            </aside>

            {/* ── Body ── */}
            <div className="workspace-body">
                {/* ── Top bar ── */}
                <header className="workspace-topbar">
                    {/* Mobile menu */}
                    <button
                        className="icon-button lg:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                    >
                        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>

                    {/* Project switcher */}
                    <Link
                        href={projectHref}
                        className="topbar-project"
                        data-cursor="hover"
                        aria-label={`Current project: ${activeProject?.name || "New startup"}. Click to switch project`}
                    >
                        <span className="project-orb">
                            {(activeProject?.name || "N").slice(0, 1).toUpperCase()}
                        </span>
                        <span style={{
                            fontSize: "13px", fontWeight: 600,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {activeProject?.name || "New startup"}
                        </span>
                        <ChevronDown className="size-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                    </Link>

                    {/* Search bar */}
                    <button
                        className="topbar-search"
                        onClick={() => setSearchOpen(true)}
                        data-cursor="hover"
                        aria-label="Search or jump to (Ctrl+K)"
                    >
                        <Search className="size-3.5" />
                        <span style={{ fontSize: "13px" }}>Search or jump to...</span>
                        <kbd>⌘K</kbd>
                    </button>

                    {/* Agent status indicator */}
                    <div className="topbar-agent-status ml-auto" style={{ display: "flex" }}>
                        <span className="topbar-agent-dot" />
                        <span>Agents ready</span>
                    </div>

                    {/* User avatar */}
                    <button
                        onClick={handleLogout}
                        title={`Sign out (${user?.email})`}
                        aria-label={`Sign out (${user?.email})`}
                        data-cursor="hover"
                        style={{
                            width: "32px", height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--indigo), var(--violet))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: 700, color: "white",
                            flexShrink: 0,
                        }}
                    >
                        {userInitial}
                    </button>
                </header>

                {/* Mobile nav overlay */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 60,
                                background: "var(--surface-1)",
                                borderRight: "1px solid var(--border)",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                                <Brand />
                                <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
                                    <X className="size-4" />
                                </button>
                            </div>

                            {NAV_ITEMS.map((item) => {
                                const href = item.isProjectScoped ? projectHref : item.href;
                                const active = item.isProjectScoped
                                    ? pathname.startsWith("/projects/")
                                    : pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        href={href}
                                        onClick={() => setMobileOpen(false)}
                                        aria-label={item.label}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px 14px",
                                            borderRadius: "var(--r-md)",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: active ? "#A5B4FC" : "var(--text-secondary)",
                                            background: active ? "var(--indigo-dim)" : "transparent",
                                            transition: "all 140ms ease",
                                        }}
                                    >
                                        <Icon className="size-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <div style={{ flex: 1 }} />
                            <button
                                onClick={handleLogout}
                                aria-label="Sign out of account"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 14px",
                                    borderRadius: "var(--r-md)",
                                    fontSize: "14px",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <LogOut className="size-4" />
                                Sign out
                            </button>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <main className="workspace-main">
                    {children}
                </main>
            </div>
        </div>
    );
}

/* ─── Admin Shell ───────────────────────────────────────────────────────────── */
function AdminShell({ userName, onLogout, children }: {
    userName: string;
    onLogout: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <Brand />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                        borderLeft: "1px solid var(--border)",
                        paddingLeft: "12px",
                        fontSize: "12px",
                        color: "#6EE7B7",
                        fontWeight: 600,
                    }}>
                        Platform Control
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{userName}</span>
                    <button className="icon-button" onClick={onLogout} title="Sign out" aria-label="Sign out">
                        <LogOut className="size-4" />
                    </button>
                </div>
            </header>
            <aside className="admin-rail">
                <Link href="/admin" className="admin-link admin-link-active">
                    <Cpu className="size-4" />
                    Operations
                </Link>
                <Link href="/dashboard" className="admin-link">
                    <Zap className="size-4" />
                    Workspace
                </Link>
            </aside>
            <main className="admin-main">{children}</main>
        </div>
    );
}
