import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/ui/core";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<LoadingState label="Opening founder workspace" />}>
            <AppShell>{children}</AppShell>
        </Suspense>
    );
}
