"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Command, Menu, X } from "lucide-react";
import { OrbitLogo } from "@/components/ui/orbit-logo";

interface NavbarProps {
  onOpenDemo?: () => void;
  onOpenCommandPalette?: () => void;
}

export function Navbar({ onOpenDemo, onOpenCommandPalette }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Blur & border threshold (>40px)
      setIsScrolled(currentScrollY > 40);

      // Auto-hide on scroll down, reveal on scroll up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current + 4) {
          // Scrolling down
          setIsVisible(false);
          setIsMobileMenuOpen(false);
        } else if (currentScrollY < lastScrollY.current - 4) {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-[#050507]/80 backdrop-blur-xl border-b border-[#1A1A24]"
          : "bg-transparent border-b border-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#EDEDF2] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] rounded-md px-1"
          aria-label="Orbit Home"
        >
          <OrbitLogo size="sm" />
          <span className="font-semibold tracking-tight text-base font-mono">ORBIT</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 text-[0.875rem] text-[#8A8A96]"
          aria-label="Primary Navigation"
        >
          <Link
            href="#product"
            className="hover:text-[#EDEDF2] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C5CFF] rounded px-1"
          >
            Features
          </Link>
          <Link
            href="#agents"
            className="hover:text-[#EDEDF2] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C5CFF] rounded px-1"
          >
            How it works
          </Link>
          <button
            type="button"
            onClick={onOpenDemo}
            className="hover:text-[#EDEDF2] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C5CFF] rounded px-1"
          >
            Demo
          </button>
          <Link
            href="#core"
            className="hover:text-[#EDEDF2] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C5CFF] rounded px-1"
          >
            Pricing
          </Link>
        </nav>

        {/* Right Action Cluster */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cmd+K Command Palette Trigger */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#8A8A96] bg-[#0A0A0F] hover:bg-[#14141E] hover:text-[#EDEDF2] border border-[#1E1E2A] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
            aria-label="Open command palette (Press Command K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">⌘K</span>
          </button>

          {/* Auth Actions */}
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-medium text-[#8A8A96] hover:text-[#EDEDF2] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C5CFF] rounded"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-3.5 py-1.5 text-xs font-medium text-[#EDEDF2] bg-[#7C5CFF] hover:bg-[#6845F5] rounded-md transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A48BFF]"
          >
            Register
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="p-2 text-[#8A8A96] hover:text-[#EDEDF2] rounded-md border border-[#1E1E2A] bg-[#0A0A0F]"
            aria-label="Search"
          >
            <Command className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#8A8A96] hover:text-[#EDEDF2] rounded-md border border-[#1E1E2A] bg-[#0A0A0F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-2xl border-b border-[#1A1A24] px-4 pt-3 pb-6 flex flex-col gap-4 animate-in fade-in duration-200">
          <Link
            href="#product"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm text-[#EDEDF2] py-2 border-b border-[#14141E]"
          >
            Features
          </Link>
          <Link
            href="#agents"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm text-[#EDEDF2] py-2 border-b border-[#14141E]"
          >
            How it works
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenDemo?.();
            }}
            className="text-sm text-left text-[#EDEDF2] py-2 border-b border-[#14141E]"
          >
            Demo
          </button>
          <Link
            href="#core"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm text-[#EDEDF2] py-2 border-b border-[#14141E]"
          >
            Pricing
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 py-2 text-center text-xs font-medium text-[#8A8A96] bg-[#111118] border border-[#1E1E2A] rounded-md"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 py-2 text-center text-xs font-medium text-[#EDEDF2] bg-[#7C5CFF] rounded-md"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
