"use client";

import { useEffect, useState } from "react";

let cachedSupport: boolean | null = null;

// Install safe interceptor for THREE.WebGLRenderer context creation error
// so Next.js React Dev Overlay (intercept-console-error.ts) does not hijack the screen with a fatal crash modal
if (typeof window !== "undefined") {
  const originalError = window.console.error;
  window.console.error = function (...args: unknown[]) {
    const first = typeof args[0] === "string" ? args[0] : "";
    if (
      first.includes("THREE.WebGLRenderer: A WebGL context could not be created") ||
      first.includes("Could not create a WebGL context") ||
      first.includes("webglcontextcreationerror")
    ) {
      // Demote to warning so it is visible in DevTools console without crashing the UI overlay
      console.warn("[Orbit WebGL Notice]", ...args);
      return;
    }
    return originalError.apply(this, args);
  };
}

/**
 * Checks whether WebGL / WebGL2 context creation is actually supported and enabled by the browser.
 * Safe for server-side rendering (returns false on server).
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || !window.document) {
    return false;
  }
  if (cachedSupport !== null) {
    return cachedSupport;
  }

  try {
    const canvas = document.createElement("canvas");

    // Silence any context creation error events on test probe
    const suppressErrorEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    canvas.addEventListener("webglcontextcreationerror", suppressErrorEvent, false);

    const attributes: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
      stencil: false,
    };

    const gl = (
      canvas.getContext("webgl2", attributes) ||
      canvas.getContext("webgl", attributes) ||
      canvas.getContext("experimental-webgl", attributes)
    ) as (WebGLRenderingContext | WebGL2RenderingContext | null);

    canvas.removeEventListener("webglcontextcreationerror", suppressErrorEvent, false);

    if (!gl) {
      cachedSupport = false;
      return false;
    }

    // Check if the context is lost immediately (common in sandboxed / disabled GPU environments)
    if (typeof gl.isContextLost === "function" && gl.isContextLost()) {
      cachedSupport = false;
      return false;
    }

    // Test program creation to verify driver can actually allocate shaders/programs
    const program = gl.createProgram();
    if (!program) {
      cachedSupport = false;
      return false;
    }
    gl.deleteProgram(program);

    // Clean up context immediately
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) {
      loseContext.loseContext();
    }

    cachedSupport = true;
    return true;
  } catch {
    cachedSupport = false;
    return false;
  }
}

/**
 * React hook to determine if WebGL is available.
 * Defaults to false initially to prevent Three.js from mounting before verification.
 * Only switches to true if client-side probe succeeds.
 */
export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    setSupported(isWebGLSupported());
  }, []);

  return supported;
}
