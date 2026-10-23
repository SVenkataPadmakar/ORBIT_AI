"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import "@/lib/hooks/use-webgl";
import { CustomCursor } from "@/components/ui/cursor";
import { CommandPalette } from "@/components/ui/command-palette";
import { NavigationProgressBar } from "@/components/ui/navigation-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <NavigationProgressBar />
      </Suspense>
      <CustomCursor />
      <CommandPalette />
      {children}
    </QueryClientProvider>
  );
}
