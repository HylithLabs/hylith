import type { Metadata } from "next";
import { Suspense } from "react";
import { Auth, AuthView } from "@/components/ui/auth-form-1";
import { pageTitle } from "@/lib/seo/metadata";

export const metadata: Metadata = pageTitle("Create account");

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Auth defaultView={AuthView.SIGN_UP} />
    </Suspense>
  );
}
