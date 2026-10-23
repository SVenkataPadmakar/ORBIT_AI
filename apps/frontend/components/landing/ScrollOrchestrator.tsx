"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollState } from "@/hooks/useScrollProgress";

interface CameraRigProps {
  progressRef: React.MutableRefObject<ScrollState>;
  prefersReducedMotion?: boolean;
}

function easeOutExpo(x: number): number {
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function CameraRig({ progressRef, prefersReducedMotion = false }: CameraRigProps) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 6));
  const targetPos = useRef(new THREE.Vector3(0, 0, 6));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const { currentScene, sceneProgress } = progressRef.current;

    // Calculate camera target based on current scene state machine
    if (currentScene === 0) {
      // SCENE 1: Static, then slow dolly-in over 100vh scroll (z 6.0 -> 4.5)
      const targetZ = 6.0 - sceneProgress * 1.5;
      targetPos.current.set(0, 0, targetZ);
      lookAtTarget.current.set(0, 0, 0);
    } else if (currentScene === 1) {
      // SCENE 2: Slight orbital arc, 15° over 150vh, ease-out-expo
      const eased = easeOutExpo(sceneProgress);
      const arcAngle = THREE.MathUtils.degToRad(15) * eased;
      const radius = 4.6;
      const targetX = Math.sin(arcAngle) * radius;
      const targetZ = Math.cos(arcAngle) * radius;
      const targetY = eased * 0.25;

      targetPos.current.set(targetX, targetY, targetZ);
      lookAtTarget.current.set(0.2 * eased, 0, 0);
    } else if (currentScene === 2) {
      // SCENE 3: Slow tilt + pull-back, ease-out-expo, 1.2s lerp (Section 6 & 8)
      const eased = easeOutExpo(sceneProgress);
      const startX = Math.sin(THREE.MathUtils.degToRad(15)) * 4.6;
      const startZ = Math.cos(THREE.MathUtils.degToRad(15)) * 4.6;
      const startY = 0.25;

      // Slow tilt: y rises from 0.25 to 0.85; pull-back: z retreats from 4.44 to 5.60
      const targetX = THREE.MathUtils.lerp(startX, 0.55, eased);
      const targetY = THREE.MathUtils.lerp(startY, 0.85, eased);
      const targetZ = THREE.MathUtils.lerp(startZ, 5.60, eased);

      targetPos.current.set(targetX, targetY, targetZ);
      lookAtTarget.current.set(0.35, 0.05, 0);
    } else if (currentScene === 3) {
      // SCENE 4: Slow orbit around core, 30° over 200vh, ease-out-expo (Section 6 & user prompt)
      const eased = easeOutExpo(sceneProgress);
      const rXZ = 5.627;
      const theta0 = 0.098; // ~5.6° starting angle from Scene 3 endpoint
      const orbitAngle = theta0 + THREE.MathUtils.degToRad(30) * eased;

      const targetX = Math.sin(orbitAngle) * rXZ;
      const targetZ = Math.cos(orbitAngle) * rXZ;
      const targetY = THREE.MathUtils.lerp(0.85, 0.65, eased);

      targetPos.current.set(targetX, targetY, targetZ);
      lookAtTarget.current.set(THREE.MathUtils.lerp(0.35, 0.0, eased), 0.0, 0.0);
    } else if (currentScene === 4) {
      // SCENE 5: Pull back, wide shot, slow rise, ease-out-expo (Section 6 & user prompt)
      const eased = easeOutExpo(sceneProgress);
      const startAngle = 0.098 + THREE.MathUtils.degToRad(30);
      const orbitAngle = startAngle + THREE.MathUtils.degToRad(15) * eased;
      const radius = THREE.MathUtils.lerp(5.627, 8.80, eased);
      const targetY = THREE.MathUtils.lerp(0.65, 2.85, eased);

      const targetX = Math.sin(orbitAngle) * radius;
      const targetZ = Math.cos(orbitAngle) * radius;

      targetPos.current.set(targetX, targetY, targetZ);
      lookAtTarget.current.set(0, 0, 0);
    } else if (currentScene === 5) {
      // SCENE 6: Lock-off, then slow dolly to wordmark over 150vh, then static (Section 6 & user prompt)
      const finalAngle = 0.098 + THREE.MathUtils.degToRad(45);
      const startX = Math.sin(finalAngle) * 8.80;
      const startY = 2.85;
      const startZ = Math.cos(finalAngle) * 8.80;

      if (sceneProgress < 0.15) {
        // 1. Lock-off during initial galaxy implosion
        targetPos.current.set(startX, startY, startZ);
        lookAtTarget.current.set(0, 0, 0);
      } else if (sceneProgress < 0.80) {
        // 2. Slow dolly to wordmark over 150vh (ease-out-expo)
        const dollyT = easeOutExpo((sceneProgress - 0.15) / 0.65);
        const targetX = THREE.MathUtils.lerp(startX, 0.0, dollyT);
        const targetY = THREE.MathUtils.lerp(startY, 0.10, dollyT);
        const targetZ = THREE.MathUtils.lerp(startZ, 3.80, dollyT);

        targetPos.current.set(targetX, targetY, targetZ);
        lookAtTarget.current.set(0, 0.05 * dollyT, 0);
      } else {
        // 3. Static lock-off on wordmark & surfaced product UI
        targetPos.current.set(0.0, 0.10, 3.80);
        lookAtTarget.current.set(0, 0.05, 0);
      }
    } else {
      // Future scenes maintain camera track
      targetPos.current.set(0.0, 0.10, 3.80);
      lookAtTarget.current.set(0, 0.05, 0);
    }

    // Pointer parallax offset (±0.15 rad, damped 0.9)
    let px = 0;
    let py = 0;
    if (!prefersReducedMotion) {
      px = state.pointer.x * 0.25;
      py = state.pointer.y * 0.18;
    }

    // Smooth lerp over 1.2s ease-out-expo (damped factor)
    const factor = Math.min(delta * 3.2, 0.09);
    currentPos.current.x += (targetPos.current.x + px - currentPos.current.x) * factor;
    currentPos.current.y += (targetPos.current.y + py - currentPos.current.y) * factor;
    currentPos.current.z += (targetPos.current.z - currentPos.current.z) * factor;

    currentLookAt.current.lerp(lookAtTarget.current, factor);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

interface ScrollProgressBarProps {
  progress: number;
}

/**
 * 1px top-line scroll progress bar in accent color
 * Section 7: "Scroll progress bar: 1px top-line, accent color, no label"
 */
export function ScrollProgressBar({ progress }: ScrollProgressBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-[1px] z-50 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#7C5CFF] transition-all duration-75 ease-out shadow-[0_0_8px_#7C5CFF]"
        style={{ width: `${Math.min(Math.max(progress * 100, 0), 100)}%` }}
      />
    </div>
  );
}
