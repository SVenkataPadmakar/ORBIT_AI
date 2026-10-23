import { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { AuthPortalSkeleton } from "@/components/auth/AuthPortalSkeleton";

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthPortalSkeleton mode="register" />}>
      <AuthPortal initialMode="register" />
    </Suspense>
  );
}
