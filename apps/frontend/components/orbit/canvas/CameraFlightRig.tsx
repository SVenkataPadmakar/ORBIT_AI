"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraFlightRigProps {
  scrollProgress: number | React.MutableRefObject<number>; // Normalized 0.0 -> 1.0 or mutable ref
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  activeFocusNode?: [number, number, number] | null;
}

export function CameraFlightRig({
  scrollProgress,
  mouse,
  activeFocusNode,
}: CameraFlightRigProps) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 1.8, 7.5));
  const currentTarget = useRef(new THREE.Vector3(0, 0.2, 0));

  // ── 5 Orbital Waypoints matching the 5 narrative sectors ──
  const { pathSpline, targetSpline } = useMemo(() => {
    // Camera positions along the scroll trajectory
    const pathPoints = [
      new THREE.Vector3(0.0, 1.8, 7.5),   // Sector 01: Hero / Intelligence Core Gaze
      new THREE.Vector3(4.2, 3.8, 7.2),   // Sector 02: High Inclination Ecosystem
      new THREE.Vector3(-3.8, 1.6, 5.2),  // Sector 03: Autonomous Agent Council
      new THREE.Vector3(0.0, 7.5, 2.5),   // Sector 04: Hyper-Warp Execution Dive
      new THREE.Vector3(0.0, 0.4, 4.2),   // Sector 05: Orbital Insertion Launch
    ];

    // Look-at targets along the scroll trajectory
    const targetPoints = [
      new THREE.Vector3(0.0, 0.2, 0.0),   // Intelligence Core center
      new THREE.Vector3(0.5, 0.2, 0.0),   // Planetary System centroid
      new THREE.Vector3(-0.8, 0.4, 0.5),  // Agent Constellation cluster
      new THREE.Vector3(0.0, -1.5, -6.0), // Deep space warp vector
      new THREE.Vector3(0.0, 0.0, -8.0),  // Boundless launch horizon
    ];

    return {
      pathSpline: new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.5),
      targetSpline: new THREE.CatmullRomCurve3(targetPoints, false, "catmullrom", 0.5),
    };
  }, []);

  useFrame((_, delta) => {
    // Clamped progress between 0 and 1 (reads from number or mutable ref without React re-renders)
    const rawProgress = typeof scrollProgress === "number" ? scrollProgress : scrollProgress.current;
    const p = Math.max(0.0001, Math.min(0.9999, rawProgress));

    // Desired base camera position and target from spline
    const basePos = pathSpline.getPointAt(p);
    const baseTarget = targetSpline.getPointAt(p);

    // Mouse parallax offset (subtle aerospace head-tracking)
    const parallaxX = mouse.current.x * 0.45;
    const parallaxY = -mouse.current.y * 0.3;

    // If an orbital node is explicitly inspected/focused, blend target towards it
    const desiredTarget = activeFocusNode
      ? new THREE.Vector3(...activeFocusNode)
      : baseTarget;

    const desiredPos = basePos.clone().add(new THREE.Vector3(parallaxX, parallaxY, 0));

    // Smooth lerp damping (feels heavy, cinematic, and responsive)
    const lerpFactor = 1.0 - Math.exp(-delta * 3.5);
    currentPos.current.lerp(desiredPos, lerpFactor);
    currentTarget.current.lerp(desiredTarget, lerpFactor);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
