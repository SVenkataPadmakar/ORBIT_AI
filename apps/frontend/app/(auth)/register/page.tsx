import { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#050507]" />}>
      <AuthPortal initialMode="register" />
    </Suspense>
  );
}
