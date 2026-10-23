"use client";

import React from "react";

interface SceneShellProps {
  id: string;
  minHeight?: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function SceneShell({
  id,
  minHeight = "min-h-screen",
  children,
  className = "",
  ariaLabel,
}: SceneShellProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative w-full ${minHeight} flex flex-col justify-center px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto z-10 pointer-events-auto select-text ${className}`}
    >
      {children}
    </section>
  );
}
