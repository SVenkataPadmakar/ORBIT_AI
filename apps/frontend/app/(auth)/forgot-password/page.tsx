import { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { LoadingState } from "@/components/ui/core";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading Password Recovery..." />}>
      <AuthPortal initialMode="forgot-password" />
    </Suspense>
  );
}
