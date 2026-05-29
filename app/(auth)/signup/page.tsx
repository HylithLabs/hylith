import { Suspense } from "react";
import { AuthCard } from "@/components/portal/auth-card";
import { SignupForm } from "@/components/portal/signup-form";

export default function SignupPage() {
  return (
    <AuthCard
      title="Discuss your system"
      description="Create an account to book a discovery call with our team."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
