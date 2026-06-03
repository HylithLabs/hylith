import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import NavbarMenu from "@/components/NavbarMenu";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#what-we-do" },
  { label: "Works", href: "#what-we-do" },
  { label: "Team", href: "#team" },
  { label: "Reviews", href: "#reviews" },
] as const;

export type NavItem = {
  label: string;
  href: string;
  isDashboard: boolean;
};

const GLASS_STYLE = {
  background: "rgba(255, 255, 255, 0.4)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: `
    0 10px 40px -10px rgba(0, 0, 0, 0.08),
    0 4px 15px 0px rgba(0, 0, 0, 0.04),
    inset 0 2px 4px 0px rgba(255, 255, 255, 0.8),
    inset 0 -2px 4px 0px rgba(0, 0, 0, 0.05)
  `,
} as const;

export default async function Navbar() {
  const session = await auth();
  const isUserAdmin = session?.user?.email
    ? isAdminEmail(session.user.email)
    : false;
  const dashboardHref = isUserAdmin ? "/admin" : "/dashboard";

  const navItems: NavItem[] = NAV_LINKS.map((link) => ({
    ...link,
    isDashboard: false,
  }));

  if (session?.user?.id) {
    const teamIndex = navItems.findIndex((link) => link.label === "Team");
    const insertAt = teamIndex === -1 ? navItems.length : teamIndex + 1;
    navItems.splice(insertAt, 0, {
      label: "Dashboard",
      href: dashboardHref,
      isDashboard: true,
    });
  }

  return (
    <nav className="top-0 left-0 z-50 flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-4 px-4 py-4 sm:px-8 sm:py-5 lg:flex-nowrap lg:px-12 xl:px-18 xl:py-6">
      <Link href="/" aria-label="Hylith home">
        <Image
          className="h-auto w-[105px] sm:w-[118px] xl:w-[125px]"
          src="/assets/logo.svg"
          alt="Hylith"
          width={125}
          height={40}
          priority
        />
      </Link>

      <div
        style={GLASS_STYLE}
        className="nav relative order-2 hidden h-11 min-w-0 items-center justify-between gap-3 rounded-full px-4 text-xs font-semibold sm:h-12 sm:gap-5 sm:px-6 sm:text-sm md:order-none md:flex md:w-auto md:justify-start xl:h-14 xl:gap-8 xl:px-10"
      >
        {navItems.map((link) => (
          <Link
            key={link.label}
            className={
              link.isDashboard
                ? "cursor-pointer font-medium text-blue-600 transition hover:opacity-70"
                : "cursor-pointer font-medium transition hover:opacity-70"
            }
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <NavbarMenu navItems={navItems} />
    </nav>
  );
}
