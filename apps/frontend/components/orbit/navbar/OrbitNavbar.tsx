"use client";

import { useEffect, useState, useRef, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Menu, X, ArrowRight } from "lucide-react";
import { OrbitLogo } from "@/components/ui/orbit-logo";
import { cn } from "@/lib/utils/cn";

interface OrbitNavbarProps {
  isScrolled: boolean;
  onOpenDemo: () => void;
  onNavigateSector?: (progress: number) => void;
}

interface NavItem {
  label: string;
  href: string;
  sectorProgress?: number;
  isDemo?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product", sectorProgress: 0.28 },
  { label: "Features", href: "#features", sectorProgress: 0.52 },
  { label: "How It Works", href: "#how-it-works", sectorProgress: 0.72 },
  { label: "Demo", href: "#demo", isDemo: true },
  { label: "Pricing", href: "/settings/billing" },
];

export const OrbitNavbar = memo(function OrbitNavbar({
  isScrolled,
  onOpenDemo,
  onNavigateSector,
}: OrbitNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function handleItemClick(item: NavItem) {
    if (item.isDemo) {
      onOpenDemo();
      setMobileMenuOpen(false);
      return;
    }
    if (item.sectorProgress !== undefined && onNavigateSector) {
      onNavigateSector(item.sectorProgress);
      setMobileMenuOpen(false);
      return;
    }
    setMobileMenuOpen(false);
  }

  return (
    <>
      <header
        role="banner"
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300 px-6 lg:px-12 py-3.5",
          isScrolled
            ? "bg-[#040409]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.65)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* ── LEFT: Brand + Dominant Descriptor Hierarchy ── */}
          <Link
            href="/"
            aria-label="Orbit — AI Founder Operating System"
            className="flex items-center gap-3 group select-none"
            data-cursor="hover"
          >
            <OrbitLogo size="sm" showText={false} />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-none group-hover:text-cyan-200 transition-colors">
                Orbit
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wide text-white/45 mt-0.5 group-hover:text-white/60 transition-colors">
                AI Founder Operating System
              </span>
            </div>
          </Link>

          {/* ── CENTER: Primary Nav Links (Desktop) ── */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1.5 lg:gap-2 px-3 py-1 rounded-full border border-white/[0.05] bg-white/[0.02] backdrop-blur-md"
          >
            {NAV_ITEMS.map((item) => (
              item.isDemo ? (
                <button
                  key={item.label}
                  onClick={onOpenDemo}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-white/65 hover:text-white hover:bg-white/[0.06] transition-all"
                  data-cursor="hover"
                >
                  {item.label}
                </button>
              ) : item.href.startsWith("/") ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-white/65 hover:text-white hover:bg-white/[0.06] transition-all"
                  data-cursor="hover"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-white/65 hover:text-white hover:bg-white/[0.06] transition-all"
                  data-cursor="hover"
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          {/* ── RIGHT: Actions (Sign In, Register, Watch Demo) ── */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              prefetch={true}
              className="px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
              data-cursor="hover"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              prefetch={true}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md transition-all"
              data-cursor="hover"
            >
              Register
            </Link>

            <button
              onClick={onOpenDemo}
              aria-label="Watch Demo"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center gap-2 transition-all hover:scale-[1.02]"
              data-cursor="hover"
            >
              <Play className="size-3 fill-white" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* ── Mobile Hamburger Menu Toggle ── */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="md:hidden size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* ── Premium Mobile Navigation Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[60px] z-30 md:hidden bg-[#070712]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-8 shadow-2xl space-y-6"
          >
            {/* Center Navigation Links in Mobile */}
            <nav aria-label="Mobile Navigation" className="flex flex-col space-y-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center justify-between p-3 rounded-xl text-left text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="size-4 text-white/30" />
                </button>
              ))}
            </nav>

            {/* Mobile Actions Hierarchy */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
              <button
                onClick={() => {
                  onOpenDemo();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
              >
                <Play className="size-3.5 fill-white" />
                <span>Watch Demo</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-medium text-white/80 border border-white/10 hover:border-white/20 bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-medium text-white border border-white/15 bg-white/10"
                >
                  Register
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
