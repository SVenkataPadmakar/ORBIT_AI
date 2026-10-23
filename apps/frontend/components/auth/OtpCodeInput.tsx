"use client";

import { useState, useRef, useEffect } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface OtpCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  onResend?: () => void;
  disabled?: boolean;
  isSending?: boolean;
  resendCooldown?: number;
}

export function OtpCodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  onResend,
  disabled = false,
  isSending = false,
  resendCooldown = 60,
}: OtpCodeInputProps) {
  const [secondsLeft, setSecondsLeft] = useState(resendCooldown);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into individual characters
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  function handleDigitChange(index: number, char: string) {
    if (disabled) return;
    const clean = char.replace(/\D/g, "");
    if (!clean) {
      // Clear current digit
      const next = digits.map((d, i) => (i === index ? "" : d)).join("");
      onChange(next);
      return;
    }

    // If multiple digits pasted
    if (clean.length > 1) {
      const next = clean.slice(0, length);
      onChange(next);
      if (next.length === length) {
        onComplete?.(next);
      }
      const focusIndex = Math.min(next.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = clean[0] || "";
    const nextVal = nextDigits.join("");
    onChange(nextVal);

    // Auto-advance
    if (index < length - 1 && clean[0]) {
      inputsRef.current[index + 1]?.focus();
    }

    // Check complete
    if (nextVal.length === length && !nextVal.includes("")) {
      onComplete?.(nextVal);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        onChange(nextDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    if (disabled) return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      if (pasted.length === length) {
        onComplete?.(pasted);
      }
      const focusIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  }

  function triggerResend() {
    if (secondsLeft > 0 || disabled || isSending) return;
    setSecondsLeft(resendCooldown);
    onResend?.();
  }

  return (
    <div className="w-full space-y-4">
      {/* 6 Digit Cells */}
      <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, idx) => {
          const isFilled = digit.length > 0;
          return (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-1 aspect-[4/5] rounded-xl border backdrop-blur-xl transition-all duration-200 flex items-center justify-center ${
                isFilled
                  ? "border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <input
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={disabled}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-full h-full text-center text-xl sm:text-2xl font-mono font-bold text-white bg-transparent focus:outline-none select-none disabled:opacity-50"
              />
              {/* Subtle bottom indicator line */}
              <div
                className={`absolute bottom-2 inset-x-3 h-[2px] rounded-full transition-colors ${
                  isFilled ? "bg-indigo-400" : "bg-white/10"
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Resend Cooldown Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-1">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-indigo-400" />
          <span>Security pin expires in 5m</span>
        </span>

        <button
          type="button"
          onClick={triggerResend}
          disabled={secondsLeft > 0 || disabled || isSending}
          className="flex items-center gap-1 hover:text-indigo-300 transition-colors disabled:opacity-40 disabled:hover:text-white/50 focus:outline-none"
        >
          <RefreshCw className={`size-3 ${isSending ? "animate-spin" : ""}`} />
          <span>
            {secondsLeft > 0
              ? `Resend in ${secondsLeft}s`
              : "Resend Code"}
          </span>
        </button>
      </div>
    </div>
  );
}
