import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06060A",
};

export const metadata: Metadata = {
  title: {
    default: "Orbit Idea — Autonomous 15-Agent AI Co-Founder Platform",
    template: "%s — Orbit Idea",
  },
  description: "Transform your startup idea into production code and traction. Autonomous 15-agent AI orchestration with LangGraph, Gemini, PostgreSQL persistence, and real-time execution.",
  keywords: [
    "Orbit Idea", "AI co-founder", "autonomous agents", "LangGraph startup", "Gemini 2.0 Flash",
    "startup platform", "idea validation", "product architecture", "PostgreSQL DDL schema",
    "OpenAPI generator", "sprint planner", "investor readiness", "startup tools"
  ],
  authors: [{ name: "Orbit Idea Team" }],
  creator: "Orbit Idea",
  icons: {
    icon: "/images/orbit-idea-logo.webp",
    shortcut: "/images/orbit-idea-logo.webp",
    apple: "/images/orbit-idea-logo.webp",
  },
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Orbit Idea",
    title: "Orbit Idea — Autonomous 15-Agent AI Co-Founder Platform",
    description: "From idea to scalable company. 15 specialized AI agents autonomously research, reflect, verify, debate, and architect your startup.",
    images: [{ url: "/images/orbit-idea-logo.webp", width: 512, height: 512, alt: "Orbit Idea Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit Idea — Autonomous 15-Agent AI Co-Founder Platform",
    description: "Autonomous AI agent system for startup validation, technical architecture, and sprint execution.",
    images: ["/images/orbit-idea-logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Orbit Idea",
  "url": "http://localhost:3000",
  "description": "Autonomous 15-agent AI co-founder system transforming startup concepts into production architecture, validated evidence, and sprint plans.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "15-Agent Autonomous LangGraph Orchestration",
    "Persistent 4-Layer Memory (Project, Decision, Product, Execution)",
    "Automated PostgreSQL DDL & OpenAPI Contract Generation",
    "Real-time Multi-Agent Trade-Off Debate & Consensus Engine",
    "Socratic Assumption Stress-Testing with 7-Day Experiments"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
