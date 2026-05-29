"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full rounded-full border-border bg-card text-foreground shadow-[0_1px_1px_rgba(15,11,10,0.05),0_2px_6px_rgba(15,11,10,0.06)]"
      onClick={() => signIn("google", { callbackUrl })}
    >
      Continue with Google
    </Button>
  );
}
