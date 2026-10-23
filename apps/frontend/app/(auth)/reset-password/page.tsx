import { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";
import { LoadingState } from "@/components/ui/core";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading Key Reset..." />}>
      <AuthPortal initialMode="reset-password" />
    </Suspense>
  );
}
