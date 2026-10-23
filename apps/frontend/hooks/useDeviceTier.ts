"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "TIER_A" | "TIER_B" | "TIER_C";

export interface DeviceTierConfig {
  tier: DeviceTier;
  maxParticles: number;
  raymarchSteps: number;
  enableBloom: boolean;
  enableTrails: boolean;
  isReady: boolean;
}

const TIER_SPECS: Record<DeviceTier, Omit<DeviceTierConfig, "tier" | "isReady">> = {
  TIER_A: {
    maxParticles: 100_000,
    raymarchSteps: 64,
    enableBloom: true,
    enableTrails: true,
  },
  TIER_B: {
    maxParticles: 30_000,
    raymarchSteps: 32,
    enableBloom: true,
    enableTrails: false,
  },
  TIER_C: {
    maxParticles: 5_000,
    raymarchSteps: 0,
    enableBloom: false,
    enableTrails: false,
  },
};

const STORAGE_KEY = "orbit_device_tier_v4";

export function useDeviceTier(): DeviceTierConfig {
  const [tierConfig, setTierConfig] = useState<DeviceTierConfig>({
    tier: "TIER_A", // optimistic default until probed
    ...TIER_SPECS.TIER_A,
    isReady: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check local storage cache
    try {
      const cached = localStorage.getItem(STORAGE_KEY) as DeviceTier | null;
      if (cached && TIER_SPECS[cached]) {
        setTierConfig({
          tier: cached,
          ...TIER_SPECS[cached],
          isReady: true,
        });
        return;
      }
    } catch {
      // ignore storage access errors (private mode)
    }

    // 2. Perform GPU Capability & Benchmark Probe
    const probeTier = (): DeviceTier => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const gl = canvas.getContext("webgl2");

        if (!gl) {
          // No WebGL2 support -> Tier C
          return "TIER_C";
        }

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase() : "";
        const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
        const cores = navigator.hardwareConcurrency || 4;

        // Discrete desktop GPUs or Apple M-series
        const isHighEndDesktop =
          !isMobile &&
          cores >= 6 &&
          (renderer.includes("apple") ||
            renderer.includes("nvidia") ||
            renderer.includes("rtx") ||
            renderer.includes("radeon") ||
            renderer.includes("geforce"));

        if (isHighEndDesktop) {
          return "TIER_A";
        }

        // Test draw call latency
        const start = performance.now();
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.finish();
        const duration = performance.now() - start;

        // Clean up context
        const loseContext = gl.getExtension("WEBGL_lose_context");
        if (loseContext) loseContext.loseContext();

        if (isMobile) {
          // iPhone 13+ or modern mobile -> Tier B, budget mobile -> Tier C
          if (cores >= 6 && duration < 8) {
            return "TIER_B";
          }
          return "TIER_C";
        }

        if (duration < 5 && cores >= 4) {
          return "TIER_A";
        }

        return "TIER_B";
      } catch {
        return "TIER_C";
      }
    };

    const resolvedTier = probeTier();

    try {
      localStorage.setItem(STORAGE_KEY, resolvedTier);
    } catch {
      // ignore
    }

    setTierConfig({
      tier: resolvedTier,
      ...TIER_SPECS[resolvedTier],
      isReady: true,
    });
  }, []);

  return tierConfig;
}
