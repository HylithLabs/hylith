import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="portal-auth-card mx-auto w-full max-w-md border-border bg-card shadow-[0_1px_1px_rgba(15,11,10,0.05),0_2px_8px_rgba(15,11,10,0.08),0_8px_24px_rgba(15,11,10,0.06)]">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold tracking-[-0.03em]">
          {title}
        </CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
