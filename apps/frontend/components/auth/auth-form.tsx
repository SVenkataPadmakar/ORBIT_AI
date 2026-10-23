"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiError, authApi, projectsApi } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { OrbitLogo } from "@/components/ui/orbit-logo";

function errorMessage(cause: unknown): string {
    if (!(cause instanceof ApiError)) return "Could not reach Orbit Idea servers. Check your connection.";
    if (cause.code === "NETWORK_ERROR") return cause.message;
    if (cause.status === 401) return "That email and password combination is not valid.";
    if (cause.status === 409) return "An account exists for this email. Sign in instead.";
    if (cause.status === 422) return cause.message || "Check your details and try again.";
    if (cause.status >= 500) return "The authentication service is temporarily unavailable.";
    return cause.message || "Authentication could not be completed.";
}

// Google icon SVG
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
    );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const setSession   = useAuthStore((s) => s.setSession);
    const [pending, setPending] = useState(false);
    const [phase, setPhase]     = useState<"idle" | "authenticating" | "restoring">("idle");
    const [showPw, setShowPw]   = useState(false);
    const [error, setError]     = useState<string | null>(null);
    const [shake, setShake]     = useState(false);
    const isRegister = mode === "register";

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setPhase("authenticating");
        setError(null);

        const form     = new FormData(e.currentTarget);
        const email    = String(form.get("email") || "").trim();
        const password = String(form.get("password") || "");
        const fullName = String(form.get("fullName") || "").trim();

        try {
            const session = isRegister
                ? await authApi.register({ email, password, ...(fullName ? { full_name: fullName } : {}) })
                : await authApi.login({ email, password });

            setSession(session);
            setPhase("restoring");

            const requested = searchParams.get("next");
            if (requested?.startsWith("/") && !requested.startsWith("//")) {
                router.replace(requested);
                return;
            }
            const projects = await projectsApi.list({ limit: 1 });
            router.replace(projects.items[0] ? `/projects/${projects.items[0].id}` : "/projects/new");
        } catch (cause) {
            setError(errorMessage(cause));
            setPhase("idle");
            setPending(false);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    }

    return (
        <div className="auth-panel">
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <div className="mb-5">
                    <OrbitLogo size="lg" subtitle="Autonomous Startup Copilot" />
                </div>

                <h1 style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                }}>
                    {isRegister ? "Create your workspace" : "Welcome back"}
                </h1>

                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {isRegister
                        ? "Start with one idea. Your AI co-founder handles the rest."
                        : "Your agents and project memory are waiting."}
                </p>
            </div>

            {/* Google OAuth */}
            <button
                type="button"
                className="btn-google"
                disabled={pending}
                onClick={() => {/* TODO: Google OAuth redirect */}}
            >
                <GoogleIcon />
                Continue with Google
            </button>

            {/* Divider */}
            <div className="auth-divider">or continue with email</div>

            {/* Form */}
            <motion.form
                onSubmit={submit}
                noValidate
                animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
                {isRegister && (
                    <div>
                        <label className="label" htmlFor="fullName">Full name</label>
                        <input
                            className="field"
                            id="fullName"
                            name="fullName"
                            autoComplete="name"
                            placeholder="Alex Morgan"
                            maxLength={255}
                            disabled={pending}
                        />
                    </div>
                )}

                <div>
                    <label className="label" htmlFor="email">Email address</label>
                    <input
                        className="field"
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@company.com"
                        required
                        maxLength={255}
                        disabled={pending}
                        aria-describedby={error ? "auth-error" : undefined}
                    />
                </div>

                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                        {!isRegister && (
                            <a href="#" style={{ fontSize: "12px", color: "var(--indigo)" }}>Forgot password?</a>
                        )}
                    </div>
                    <div style={{ position: "relative" }}>
                        <input
                            className="field"
                            id="password"
                            name="password"
                            type={showPw ? "text" : "password"}
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            placeholder={isRegister ? "Min. 8 characters" : "Enter your password"}
                            required
                            minLength={isRegister ? 8 : 1}
                            maxLength={128}
                            disabled={pending}
                            style={{ paddingRight: "44px" }}
                        />
                        <button
                            type="button"
                            style={{
                                position: "absolute",
                                right: "4px", top: "4px",
                                width: "36px", height: "36px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--text-muted)",
                                borderRadius: "var(--r-md)",
                                transition: "color 140ms ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                            onClick={() => setShowPw((v) => !v)}
                            aria-label={showPw ? "Hide password" : "Show password"}
                            disabled={pending}
                        >
                            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            id="auth-error"
                            role="alert"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "flex-start",
                                padding: "12px 14px",
                                background: "var(--red-dim)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                borderRadius: "var(--r-md)",
                                fontSize: "13px",
                                color: "#FCA5A5",
                                overflow: "hidden",
                            }}
                        >
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                    className="btn-primary"
                    type="submit"
                    disabled={pending}
                    whileHover={!pending ? { scale: 1.01 } : {}}
                    whileTap={!pending ? { scale: 0.99 } : {}}
                    style={{ width: "100%", height: "48px", fontSize: "15px", marginTop: "4px" }}
                >
                    {pending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <ArrowRight className="size-4" />
                    )}
                    {phase === "authenticating"
                        ? "Verifying..."
                        : phase === "restoring"
                        ? "Opening workspace..."
                        : isRegister
                        ? "Create workspace"
                        : "Enter workspace"}
                </motion.button>
            </motion.form>

            {/* Trust note */}
            <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginTop: "20px",
                fontSize: "12px",
                color: "var(--text-muted)",
            }}>
                <CheckCircle2 className="size-4" style={{ color: "var(--emerald)", flexShrink: 0 }} />
                Sessions rotate automatically. No data is shared without consent.
            </div>

            {/* Switch mode */}
            <p style={{ marginTop: "28px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                {isRegister ? "Already have a workspace? " : "New to Orbit Idea? "}
                <Link
                    href={isRegister ? "/login" : "/register"}
                    style={{ fontWeight: 600, color: "var(--indigo)" }}
                >
                    {isRegister ? "Sign in" : "Create account"}
                </Link>
            </p>
        </div>
    );
}
