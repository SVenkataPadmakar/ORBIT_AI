"use client";

import { useState, useRef } from "react";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedInputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  isValid?: boolean;
  onFocusStateChange?: (focused: boolean) => void;
}

export function AnimatedInputField({
  label,
  type = "text",
  error,
  isValid,
  onFocusStateChange,
  id,
  value,
  onChange,
  disabled,
  ...props
}: AnimatedInputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocusStateChange?.(true);
    props.onFocus?.(e);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onFocusStateChange?.(false);
    props.onBlur?.(e);
  }

  return (
    <div className="relative w-full space-y-1">
      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative rounded-xl transition-all duration-300 backdrop-blur-xl border ${
          error
            ? "border-rose-500/80 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            : focused
            ? "border-indigo-500/80 bg-white/[0.06] shadow-[0_0_25px_rgba(99,102,241,0.25)]"
            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.04]"
        }`}
      >
        {/* Active Traveling Energy Border Glow */}
        {focused && !error && (
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-60 blur-[1px] animate-pulse"
            style={{
              background:
                "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(168,85,247,0.6), rgba(56,189,248,0.5))",
            }}
          />
        )}

        <div className="relative px-4 pt-5 pb-2">
          {/* Floating Micro-Label */}
          <motion.label
            htmlFor={id}
            initial={false}
            animate={{
              y: focused || hasValue ? -12 : 2,
              scale: focused || hasValue ? 0.75 : 1,
              color: error
                ? "#FDA4AF"
                : focused
                ? "#A5B4FC"
                : "rgba(255, 255, 255, 0.5)",
            }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none absolute left-4 top-3 origin-top-left font-mono text-xs uppercase tracking-wider select-none"
          >
            {label}
          </motion.label>

          <input
            ref={inputRef}
            id={id}
            type={actualType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className="w-full bg-transparent text-sm text-white placeholder-transparent focus:outline-none focus:ring-0 disabled:opacity-50"
            {...props}
          />
        </div>

        {/* Right Action Accessory (Password Toggle / Valid Check) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-white/50">
          {isValid && !error && (
            <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="size-3 stroke-[2.5]" />
            </span>
          )}

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="p-1 rounded-lg hover:text-white transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Validation Error Banner */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-rose-300 font-mono pl-1 pt-0.5"
        >
          <AlertCircle className="size-3.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
}
