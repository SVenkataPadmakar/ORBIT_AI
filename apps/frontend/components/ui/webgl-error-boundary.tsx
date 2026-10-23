"use client";

import React, { Component, type ReactNode } from "react";

interface WebGLErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): WebGLErrorBoundaryState {
    return {
      hasError: true,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn(
      "[WebGLErrorBoundary] Caught WebGL context creation error. Rendering CSS cosmic fallback gracefully:",
      error.message
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
