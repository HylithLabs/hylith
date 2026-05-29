import { Suspense } from "react";
import { Auth, AuthView } from "@/components/ui/auth-form-1";

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Auth defaultView={AuthView.SIGN_UP} />
    </Suspense>
  );
}
