"use client";

import { useEffect, useRef, useState, createContext, useContext, useCallback } from "react";

type CursorState = "default" | "hover" | "agent" | "thinking" | "text" | "play" | "seek" | "magnetic";

const CursorContext = createContext<{
    setState: (state: CursorState) => void;
}>({ setState: () => {} });

export function useCursor() {
    return useContext(CursorContext);
}

export function CustomCursor() {
    const dotRef  = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const pos     = useRef({ x: 0, y: 0 });
    const ring    = useRef({ x: 0, y: 0 });
    const rafRef  = useRef<number>(0);
    const [cursorState, setCursorState] = useState<CursorState>("default");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Disable on touch / mobile devices or reduced motion to eliminate RAF overhead
        if (typeof window !== "undefined") {
            if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                return;
            }
        }

        // Animate ring with lag (lerp)
        function lerp(a: number, b: number, t: number) {
            return a + (b - a) * t;
        }

        function animate() {
            ring.current.x = lerp(ring.current.x, pos.current.x, 0.14);
            ring.current.y = lerp(ring.current.y, pos.current.y, 0.14);

            if (dotRef.current) {
                dotRef.current.style.transform =
                    `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate3d(-50%, -50%, 0)`;
            }
            if (ringRef.current) {
                ringRef.current.style.transform =
                    `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate3d(-50%, -50%, 0)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        }

        function onMove(e: MouseEvent) {
            pos.current = { x: e.clientX, y: e.clientY };
            setVisible(true);
        }

        function onLeave() { setVisible(false); }
        function onEnter() { setVisible(true); }

        window.addEventListener("mousemove", onMove, { passive: true });
        document.addEventListener("mouseleave", onLeave);
        document.addEventListener("mouseenter", onEnter);

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Wire up data attributes on interactive elements
    useEffect(() => {
        function onOver(e: MouseEvent) {
            const target = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
            if (!target) { setCursorState("default"); return; }
            const state = target.dataset.cursor as CursorState ?? "hover";
            setCursorState(state);
        }

        document.addEventListener("mouseover", onOver, { passive: true });
        return () => document.removeEventListener("mouseover", onOver);
    }, []);

    // Auto-detect links / buttons with stable single attachment
    const cursorStateRef = useRef<CursorState>(cursorState);
    cursorStateRef.current = cursorState;

    useEffect(() => {
        function onOver(e: MouseEvent) {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            const isText = target.closest("input:not([type='button']):not([type='submit']), textarea, [contenteditable='true']");
            if (isText) {
                if (cursorStateRef.current !== "text") setCursorState("text");
                return;
            }

            const isInteractive = target.closest("a, button, [role='button'], select, label, [data-cursor='hover']");
            if (isInteractive) {
                if (cursorStateRef.current !== "hover") setCursorState("hover");
            } else {
                if (cursorStateRef.current === "hover" || cursorStateRef.current === "text") {
                    setCursorState("default");
                }
            }
        }

        document.addEventListener("mouseover", onOver, { passive: true });
        return () => {
            document.removeEventListener("mouseover", onOver);
        };
    }, []);

    const stateClass = cursorState !== "default" ? `cursor-${cursorState}` : "";

    return (
        <>
            <div
                ref={dotRef}
                className={`cursor-dot ${stateClass}`}
                style={{
                    position: "fixed",
                    top: 0, left: 0,
                    pointerEvents: "none",
                    zIndex: 9999,
                    opacity: visible ? 1 : 0,
                    willChange: "transform",
                }}
            />
            <div
                ref={ringRef}
                className={`cursor-ring ${stateClass}`}
                style={{
                    position: "fixed",
                    top: 0, left: 0,
                    pointerEvents: "none",
                    zIndex: 9998,
                    opacity: visible ? 1 : 0,
                    willChange: "transform",
                }}
            />
        </>
    );
}

/* ─── Magnetic Button Wrapper ───────────────────────────────────────────────── */

export function MagneticButton({
    children,
    className,
    strength = 0.3,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { strength?: number }) {
    const ref = useRef<HTMLButtonElement>(null);
    const rectRef = useRef<DOMRect | null>(null);

    function onMove(e: React.MouseEvent) {
        if (!ref.current || !rectRef.current) return;
        const rect = rectRef.current;
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        ref.current.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    }

    function onLeave() {
        if (!ref.current) return;
        rectRef.current = null;
        ref.current.style.transform = "translate3d(0, 0, 0)";
        ref.current.style.transition = "transform 400ms cubic-bezier(0.34,1.56,0.64,1)";
    }

    function onEnter() {
        if (!ref.current) return;
        rectRef.current = ref.current.getBoundingClientRect();
        ref.current.style.transition = "transform 80ms linear";
    }

    return (
        <button
            ref={ref}
            className={className}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onMouseEnter={onEnter}
            {...props}
        >
            {children}
        </button>
    );
}

