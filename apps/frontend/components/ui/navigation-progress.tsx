"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation has completed
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);
      // Only trigger for same-origin, different-path navigation
      if (
        url.origin === window.location.origin &&
        url.pathname !== window.location.pathname &&
        !target.hasAttribute("download") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        setLoading(true);
        setProgress(35);
        const t1 = setTimeout(() => setProgress(65), 150);
        const t2 = setTimeout(() => setProgress(85), 400);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 pointer-events-none z-[99999] h-[2px] transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
        boxShadow: "0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(129, 140, 248, 0.6)",
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
}
