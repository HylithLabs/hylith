import { Suspense } from "react";
import { Auth, AuthView } from "@/components/ui/auth-form-1";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Auth defaultView={AuthView.SIGN_IN} />
    </Suspense>
  );
}
