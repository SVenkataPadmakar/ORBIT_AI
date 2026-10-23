"use client";

import { useEffect, useRef, useState } from "react";

export interface FpsStatus {
  fps: number;
  degradationStage: 0 | 1 | 2 | 3;
  shouldDegradeParticles: boolean;
  shouldDisableBloom: boolean;
  shouldFallbackToStatic: boolean;
}

export function useFpsMonitor(enabled: boolean = true): FpsStatus {
  const [status, setStatus] = useState<FpsStatus>({
    fps: 60,
    degradationStage: 0,
    shouldDegradeParticles: false,
    shouldDisableBloom: false,
    shouldFallbackToStatic: false,
  });

  const framesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const under45StartTime = useRef<number | null>(null);
  const under40StartTime = useRef<number | null>(null);
  const under30StartTime = useRef<number | null>(null);
  const stageRef = useRef<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let animId: number;

    const tick = (now: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
        animId = requestAnimationFrame(tick);
        return;
      }

      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (delta > 0) {
        const instantFps = 1000 / delta;
        framesRef.current.push(instantFps);
        if (framesRef.current.length > 60) {
          framesRef.current.shift();
        }
      }

      // Compute average over last 60 frames
      const avgFps =
        framesRef.current.length > 0
          ? Math.round(
              framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length
            )
          : 60;

      // Check degradation conditions (lasting > 3000ms)
      if (avgFps < 45) {
        if (!under45StartTime.current) under45StartTime.current = now;
        if (now - under45StartTime.current > 3000 && stageRef.current < 1) {
          stageRef.current = 1;
        }
      } else {
        under45StartTime.current = null;
      }

      if (avgFps < 40) {
        if (!under40StartTime.current) under40StartTime.current = now;
        if (now - under40StartTime.current > 3000 && stageRef.current < 2) {
          stageRef.current = 2;
        }
      } else {
        under40StartTime.current = null;
      }

      if (avgFps < 30) {
        if (!under30StartTime.current) under30StartTime.current = now;
        if (now - under30StartTime.current > 3000 && stageRef.current < 3) {
          stageRef.current = 3;
        }
      } else {
        under30StartTime.current = null;
      }

      // Update state if stage changed or periodically update reported FPS
      setStatus({
        fps: avgFps,
        degradationStage: stageRef.current,
        shouldDegradeParticles: stageRef.current >= 1,
        shouldDisableBloom: stageRef.current >= 2,
        shouldFallbackToStatic: stageRef.current >= 3,
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [enabled]);

  return status;
}
