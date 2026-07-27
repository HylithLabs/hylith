"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { markSkipHomeIntro } from "@/lib/home-intro";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={() => {
        markSkipHomeIntro();
        void signOut({ callbackUrl: "/" });
      }}
    >
      Sign out
    </Button>
  );
}
