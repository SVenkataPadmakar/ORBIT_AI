"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface OrbitLogoProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
    showText?: boolean;
    subtitle?: string;
    className?: string;
    variant?: "image" | "vector";
}

const sizeMap = {
    xs: { px: 20, ring: "size-5", text: "text-xs", badge: "text-[9px]" },
    sm: { px: 28, ring: "size-7", text: "text-sm", badge: "text-[10px]" },
    md: { px: 36, ring: "size-9", text: "text-base", badge: "text-[10px]" },
    lg: { px: 44, ring: "size-11", text: "text-lg", badge: "text-xs" },
    xl: { px: 56, ring: "size-14", text: "text-xl", badge: "text-xs" },
    hero: { px: 80, ring: "size-20", text: "text-3xl", badge: "text-sm" },
};

export function OrbitLogo({
    size = "md",
    showText = true,
    subtitle,
    className,
    variant = "image",
}: OrbitLogoProps) {
    const config = sizeMap[size];

    return (
        <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
            <div className="relative shrink-0 flex items-center justify-center">
                {/* Ambient glow behind logo */}
                <div 
                    className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-cyan-500/40 via-indigo-500/30 to-amber-500/20 blur-md opacity-80"
                    aria-hidden="true" 
                />

                {variant === "image" ? (
                    <div 
                        className={cn(
                            "relative overflow-hidden rounded-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.25)] bg-[#030712]",
                            config.ring
                        )}
                    >
                        <Image
                            src="/images/orbit-idea-logo.webp"
                            alt="Orbit Idea"
                            width={config.px}
                            height={config.px}
                            priority
                            className="h-full w-full object-cover scale-105"
                        />
                    </div>
                ) : (
                    /* Futuristic Animated Vector Orb */
                    <div 
                        className={cn(
                            "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0c1024] to-[#050711] border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]",
                            config.ring
                        )}
                    >
                        {/* Rotating outer orbital ellipse */}
                        <svg 
                            className="absolute inset-0 size-full animate-[spin_12s_linear_infinite]" 
                            viewBox="0 0 40 40" 
                            fill="none"
                        >
                            <ellipse cx="20" cy="20" rx="16" ry="8" stroke="url(#cyan-grad)" strokeWidth="1.2" strokeDasharray="3 3" transform="rotate(-30 20 20)" />
                            <circle cx="6" cy="16" r="1.5" fill="#00f0ff" />
                            <defs>
                                <linearGradient id="cyan-grad" x1="0" y1="0" x2="40" y2="40">
                                    <stop stopColor="#00f0ff" />
                                    <stop offset="1" stopColor="#818cf8" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Counter-rotating orbital ring */}
                        <svg 
                            className="absolute inset-0 size-full animate-[spin_18s_linear_infinite_reverse]" 
                            viewBox="0 0 40 40" 
                            fill="none"
                        >
                            <ellipse cx="20" cy="20" rx="16" ry="8" stroke="url(#amber-grad)" strokeWidth="1.2" transform="rotate(45 20 20)" opacity="0.8" />
                            <circle cx="32" cy="18" r="1.2" fill="#fbbf24" />
                            <defs>
                                <linearGradient id="amber-grad" x1="0" y1="0" x2="40" y2="40">
                                    <stop stopColor="#fbbf24" />
                                    <stop offset="1" stopColor="#d946ef" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Core luminous pulsar */}
                        <div className="size-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00f0ff]" />
                    </div>
                )}
            </div>

            {showText && (
                <div className="flex flex-col">
                    <div className={cn("font-bold tracking-tight leading-none flex items-center gap-1", config.text)}>
                        <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">Orbit</span>
                        <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent font-extrabold">
                            Idea
                        </span>
                    </div>
                    {subtitle && (
                        <span className={cn("text-slate-400 font-medium tracking-wide uppercase mt-0.5", config.badge)}>
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
