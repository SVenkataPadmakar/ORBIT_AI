"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Sparkles,
  KeyRound,
  Mail,
  ShieldAlert,
  LoaderCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import dynamic from "next/dynamic";
import { authApi, projectsApi, ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AnimatedInputField } from "./AnimatedInputField";
import { MagneticButton } from "./MagneticButton";
import { OtpCodeInput } from "./OtpCodeInput";
import { SessionRecoveryHUD } from "./SessionRecoveryHUD";
import type { AuthPortalVisualState } from "./AuthPortalCanvas";

const AuthPortalCanvas = dynamic(() => import("./AuthPortalCanvas"), {
  ssr: false,
});

export type AuthMode =
  | "login"
  | "register"
  | "otp"
  | "forgot-password"
  | "reset-password";

interface AuthPortalProps {
  initialMode?: AuthMode;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthPortal({ initialMode = "login" }: AuthPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const currentUser = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const [mode, setMode] = useState<AuthMode>(
    tokenFromUrl ? "reset-password" : initialMode
  );
  const [visualState, setVisualState] = useState<AuthPortalVisualState>("idle");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");

  // Check for active session recovery
  const [showSessionRecovery, setShowSessionRecovery] = useState(false);
  const [canMountCanvas, setCanMountCanvas] = useState(false);

  useEffect(() => {
    // Mount heavy 3D canvas non-blockingly so the form is interactive instantly
    const timer = setTimeout(() => setCanMountCanvas(true), 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentUser && (mode === "login" || mode === "register")) {
      setShowSessionRecovery(true);
    }
  }, [currentUser, mode]);

  function triggerError(msg: string) {
    setError(msg);
    setVisualState("error");
    setPending(false);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setVisualState("idle");
    }, 1500);
  }

  async function handleSuccessRedirect() {
    setVisualState("success");
    const requested = searchParams.get("next");
    if (requested?.startsWith("/") && !requested.startsWith("//")) {
      router.replace(requested);
      return;
    }
    try {
      const projects = await projectsApi.list({ limit: 1 });
      router.replace(
        projects.items[0] ? `/projects/${projects.items[0].id}` : "/projects/new"
      );
    } catch {
      router.replace("/projects");
    }
  }

  // 1. Password Login or Workspace Creation
  async function handleSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    setVisualState("authenticating");

    try {
      const session =
        mode === "register"
          ? await authApi.register({
              email,
              password,
              ...(fullName ? { full_name: fullName } : {}),
            })
          : await authApi.login({ email, password });

      setSession(session);
      await handleSuccessRedirect();
    } catch (err) {
      if (err instanceof ApiError) {
        triggerError(err.message);
      } else {
        triggerError("Authentication service is temporarily unavailable.");
      }
    }
  }

  // 2. Send Magic Code (OTP)
  async function handleSendOtp() {
    if (!email || !email.includes("@")) {
      triggerError("Please provide a valid email address.");
      return;
    }
    setPending(true);
    setError(null);
    setVisualState("authenticating");

    try {
      const res = await authApi.sendOtp({ email });
      setMode("otp");
      setSuccessMsg(res.detail);
      setVisualState("idle");
      setPending(false);
    } catch (err) {
      if (err instanceof ApiError) {
        triggerError(err.message);
      } else {
        triggerError("Could not dispatch access code. Try again.");
      }
    }
  }

  // 3. Verify OTP
  async function handleVerifyOtp(codeToVerify?: string) {
    const code = codeToVerify || otpCode;
    if (code.length < 6 || pending) return;

    setPending(true);
    setError(null);
    setVisualState("authenticating");

    try {
      const session = await authApi.verifyOtp({ email, code });
      setSession(session);
      await handleSuccessRedirect();
    } catch (err) {
      if (err instanceof ApiError) {
        triggerError(err.message);
      } else {
        triggerError("Invalid or expired access code.");
      }
    }
  }

  // 4. Request Password Reset
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      triggerError("Enter your registered email address.");
      return;
    }
    setPending(true);
    setError(null);
    setVisualState("authenticating");

    try {
      const res = await authApi.forgotPassword({ email });
      setSuccessMsg(res.detail);
      setVisualState("idle");
      setPending(false);
    } catch (err) {
      if (err instanceof ApiError) {
        triggerError(err.message);
      } else {
        triggerError("Failed to initiate password recovery.");
      }
    }
  }

  // 5. Complete Password Reset
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      triggerError("Reset token and new password are required.");
      return;
    }
    setPending(true);
    setError(null);
    setVisualState("authenticating");

    try {
      const session = await authApi.resetPassword({
        token: resetToken,
        password: newPassword,
      });
      setSession(session);
      await handleSuccessRedirect();
    } catch (err) {
      if (err instanceof ApiError) {
        triggerError(err.message);
      } else {
        triggerError("Password reset failed. Link may be expired.");
      }
    }
  }

  // 6. Google OAuth
  async function handleGoogleAuth() {
    if (!email || !email.includes("@")) {
      triggerError("Please enter your email address to continue with Google.");
      return;
    }
    setPending(true);
    setError(null);
    setVisualState("authenticating");

    try {
      const session = await authApi.googleOAuth({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim() || undefined,
        avatar_url: undefined,
      });
      setSession(session);
      await handleSuccessRedirect();
    } catch (err) {
      if (err instanceof ApiError) {
        triggerError(err.message);
      } else {
        triggerError("Google authentication failed. Please try credentials instead.");
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#030308]">
      {/* ── Background 3D Floating AI Core (Progressive non-blocking load) ── */}
      {canMountCanvas && (
        <div className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700">
          <AuthPortalCanvas state={visualState} />
        </div>
      )}

      {/* ── Instant Cosmic Atmospheric Gradient & Ambient Nebula ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(circle at 50% 10%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 40%)",
        }}
      />

      {/* ── Master Glassmorphic Portal Container ── */}
      <div className="relative z-10 w-full max-w-[440px]">
        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-3xl border border-white/[0.12] bg-[#0A0A14]/85 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] p-6 sm:p-8 overflow-hidden"
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-mono text-indigo-300">
              <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>ORBIT AI PORTAL · v3.0</span>
            </div>

            <Link
              href="/"
              prefetch={true}
              className="text-xs font-mono text-white/40 hover:text-white transition-colors"
            >
              ← Back to Mission
            </Link>
          </div>

          {/* Mode Selector Tabs (Arc Browser / Linear Style) */}
          {!showSessionRecovery &&
            mode !== "forgot-password" &&
            mode !== "reset-password" && (
              <div className="grid grid-cols-3 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-6 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "login"
                      ? "bg-indigo-600 text-white shadow-md font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("otp");
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "otp"
                      ? "bg-indigo-600 text-white shadow-md font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Magic OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "register"
                      ? "bg-indigo-600 text-white shadow-md font-semibold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Create
                </button>
              </div>
            )}

          {/* ── Active Form Sections ── */}
          <AnimatePresence mode="wait">
            {/* 1. Session Recovery Mode */}
            {showSessionRecovery && currentUser ? (
              <SessionRecoveryHUD
                key="session-recovery"
                user={currentUser}
                isLoading={pending}
                onResume={handleSuccessRedirect}
                onSwitchAccount={() => {
                  clearSession();
                  setShowSessionRecovery(false);
                }}
              />
            ) : mode === "otp" ? (
              /* 2. Magic OTP Login Mode */
              <motion.div
                key="otp-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Enter Verification Passcode
                  </h2>
                  <p className="text-xs text-indigo-200/60 mt-1">
                    Sent to <span className="text-white font-medium">{email}</span>
                  </p>
                </div>

                <OtpCodeInput
                  value={otpCode}
                  onChange={setOtpCode}
                  onComplete={handleVerifyOtp}
                  onResend={handleSendOtp}
                  disabled={pending}
                  isSending={pending}
                />

                <MagneticButton
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={otpCode.length < 6 || pending}
                  className="w-full py-3.5 text-sm"
                >
                  {pending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  <span>Verify & Unlock Workspace</span>
                </MagneticButton>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs font-mono text-indigo-300 hover:text-white transition-colors"
                  >
                    ← Sign in with password instead
                  </button>
                </div>
              </motion.div>
            ) : mode === "forgot-password" ? (
              /* 3. Forgot Password Request Mode */
              <motion.form
                key="forgot-mode"
                onSubmit={handleForgotPassword}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Reset Security Key
                  </h2>
                  <p className="text-xs text-indigo-200/60 mt-1">
                    Receive an encrypted token to reset your password.
                  </p>
                </div>

                <AnimatedInputField
                  id="resetEmail"
                  label="Registered Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocusStateChange={(focused) =>
                    setVisualState(focused ? "typing" : "idle")
                  }
                  required
                />

                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <MagneticButton
                  type="submit"
                  disabled={pending || !email}
                  className="w-full py-3.5 text-sm"
                >
                  {pending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  <span>Send Reset Token</span>
                </MagneticButton>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setSuccessMsg(null);
                      setError(null);
                    }}
                    className="text-xs font-mono text-indigo-300 hover:text-white transition-colors"
                  >
                    ← Return to Login
                  </button>
                </div>
              </motion.form>
            ) : mode === "reset-password" ? (
              /* 4. Complete Password Reset */
              <motion.form
                key="reset-password-mode"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-xs text-indigo-200/60 mt-1">
                    Choose a strong password for your workspace.
                  </p>
                </div>

                <AnimatedInputField
                  id="resetToken"
                  label="Reset Token"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />

                <AnimatedInputField
                  id="newPassword"
                  label="New Password (min 8 chars)"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocusStateChange={(focused) =>
                    setVisualState(focused ? "typing" : "idle")
                  }
                  required
                />

                <MagneticButton
                  type="submit"
                  disabled={pending || !newPassword || !resetToken}
                  className="w-full py-3.5 text-sm"
                >
                  {pending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  <span>Update Password & Enter</span>
                </MagneticButton>
              </motion.form>
            ) : (
              /* 5. Standard Login & Register Mode */
              <motion.form
                key={mode}
                onSubmit={handleSubmitPassword}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {mode === "register"
                      ? "Initialize Founder Workspace"
                      : "Operator Authorization"}
                  </h2>
                  <p className="text-xs text-indigo-200/60 mt-1">
                    {mode === "register"
                      ? "Deploy your 10 autonomous startup agents."
                      : "Enter your neural workspace and project state."}
                  </p>
                </div>

                {/* Google OAuth Button */}
                <MagneticButton
                  type="button"
                  variant="google"
                  onClick={handleGoogleAuth}
                  disabled={pending}
                  className="w-full py-3 text-xs tracking-wide font-semibold"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </MagneticButton>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-[1px] bg-white/10" />
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    OR WITH CREDENTIALS
                  </span>
                  <div className="flex-1 h-[1px] bg-white/10" />
                </div>

                {mode === "register" && (
                  <AnimatedInputField
                    id="fullName"
                    label="Founder / Operator Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocusStateChange={(focused) =>
                      setVisualState(focused ? "typing" : "idle")
                    }
                    disabled={pending}
                  />
                )}

                <AnimatedInputField
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocusStateChange={(focused) =>
                    setVisualState(focused ? "typing" : "idle")
                  }
                  required
                  disabled={pending}
                />

                <AnimatedInputField
                  id="password"
                  label={mode === "register" ? "Password (min 8 chars)" : "Password"}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocusStateChange={(focused) =>
                    setVisualState(focused ? "typing" : "idle")
                  }
                  required
                  disabled={pending}
                />

                {mode === "login" && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-xs font-mono text-indigo-300/80 hover:text-indigo-200 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <MagneticButton
                  type="submit"
                  disabled={pending}
                  className="w-full py-3.5 text-sm mt-2"
                >
                  {pending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  <span>
                    {mode === "register"
                      ? "Deploy Workspace"
                      : "Enter Workspace"}
                  </span>
                </MagneticButton>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Global Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 font-mono flex items-start gap-2"
            >
              <ShieldAlert className="size-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Footer Security Note */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40">
            <span className="flex items-center gap-1.5">
              <Lock className="size-3 text-emerald-400" />
              <span>256-bit TLS Session Rotation</span>
            </span>
            <span className="text-indigo-300/50">Gemini Neural Core</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
export default AuthPortal;
