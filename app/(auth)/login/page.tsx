import { Suspense } from "react";
import { AuthCard } from "@/components/portal/auth-card";
import { LoginForm } from "@/components/portal/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to schedule a discovery call with Hylith."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
