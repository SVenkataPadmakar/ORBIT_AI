"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface ScrollState {
  progress: number;       // Global 0.0 to 1.0
  velocity: number;       // Normalized scroll velocity
  currentScene: number;   // 0 through 5
  sceneProgress: number;  // 0.0 to 1.0 within current scene
  isScrolling: boolean;
}

const TOTAL_SCENES = 6;
// Scene height weights based on vh specs:
// S1: 100vh, S2: 150vh, S3: 150vh, S4: 200vh, S5: 200vh, S6: 150vh -> Total: 950vh
const SCENE_WEIGHTS = [100, 150, 150, 200, 200, 150];
const TOTAL_WEIGHT = SCENE_WEIGHTS.reduce((a, b) => a + b, 0);

// Cumulative boundaries [0, w1/T, (w1+w2)/T, ...]
const SCENE_BOUNDS: number[] = [0];
for (let i = 0; i < SCENE_WEIGHTS.length; i++) {
  const prev = SCENE_BOUNDS[i] ?? 0;
  const weight = SCENE_WEIGHTS[i] ?? 0;
  SCENE_BOUNDS.push(prev + weight / TOTAL_WEIGHT);
}

export function clampProgress(globalProgress: number): number {
  return Math.min(Math.max(globalProgress, 0), 1);
}

export function useScrollProgress() {
  const [scrollState, setScrollState] = useState<ScrollState>({
    progress: 0,
    velocity: 0,
    currentScene: 0,
    sceneProgress: 0,
    isScrolling: false,
  });

  // Mutable ref accessible inside Three.js useFrame without triggering re-renders
  const progressRef = useRef<ScrollState>({
    progress: 0,
    velocity: 0,
    currentScene: 0,
    sceneProgress: 0,
    isScrolling: false,
  });

  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateSceneInfo = useCallback((globalProgress: number) => {
    const clampedProgress = clampProgress(globalProgress);
    let scene = 0;
    for (let i = 0; i < TOTAL_SCENES; i++) {
      const lower = SCENE_BOUNDS[i] ?? 0;
      const upper = SCENE_BOUNDS[i + 1] ?? 1;
      if (clampedProgress >= lower && clampedProgress <= upper) {
        scene = i;
        break;
      }
    }
    const sceneStart = SCENE_BOUNDS[scene] ?? 0;
    const sceneEnd = SCENE_BOUNDS[scene + 1] ?? 1;
    const sceneSpan = sceneEnd - sceneStart;
    const sceneProg = sceneSpan > 0 ? (clampedProgress - sceneStart) / sceneSpan : 0;

    return {
      scene,
      sceneProgress: Math.min(Math.max(sceneProg, 0), 1),
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

      const now = performance.now();
      const dt = Math.max(now - lastTimestamp.current, 16);
      const dy = scrollY - lastScrollY.current;
      const rawVelocity = dy / dt;
      // Exponentially damped velocity
      const velocity = Math.min(Math.max(rawVelocity * 0.1, -1), 1);

      lastScrollY.current = scrollY;
      lastTimestamp.current = now;

      const { scene, sceneProgress } = calculateSceneInfo(progress);

      const newState: ScrollState = {
        progress,
        velocity,
        currentScene: scene,
        sceneProgress,
        isScrolling: true,
      };

      progressRef.current = newState;

      // Update state for DOM subscribers throttled
      setScrollState((prev) => {
        if (
          Math.abs(prev.progress - progress) > 0.005 ||
          prev.currentScene !== scene ||
          !prev.isScrolling
        ) {
          return newState;
        }
        return prev;
      });

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        progressRef.current.isScrolling = false;
        progressRef.current.velocity = 0;
        setScrollState((prev) => ({
          ...prev,
          isScrolling: false,
          velocity: 0,
        }));
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [calculateSceneInfo]);

  return { scrollState, progressRef };
}
