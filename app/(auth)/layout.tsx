import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-shell min-h-screen font-[family-name:var(--font-dm-sans)] text-foreground antialiased">
      {children}
    </div>
  );
}
