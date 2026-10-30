import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone is required for the slim Docker runtime image. On Windows,
  // creating that output needs symlink privileges (Developer Mode / admin),
  // so only enable it when building inside Docker or when explicitly requested.
  ...(process.env.DOCKER_BUILD === "1" || process.env.NEXT_OUTPUT_STANDALONE === "1"
    ? { output: "standalone" as const }
    : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    cpus: 1,
    workerThreads: false,
    optimizePackageImports: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "lucide-react",
      "recharts",
      "framer-motion",
      "@tanstack/react-query",
      "clsx",
      "tailwind-merge",
      "react-markdown",
      "lenis",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/runs/:path*",
        destination: "http://localhost:8000/api/runs/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
      {
        source: "/v1/:path*",
        destination: "http://localhost:8000/v1/:path*",
      },
    ];
  },
  onDemandEntries: {
    maxInactiveAge: 300 * 1000,
    pagesBufferLength: 8,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem packfile cache in dev to prevent Array buffer allocation issues
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
