import { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { AuthPortalSkeleton } from "@/components/auth/AuthPortalSkeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPortalSkeleton mode="login" />}>
      <AuthPortal initialMode="login" />
    </Suspense>
  );
}
