"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { scrollToAnchor, scrollToTop } from "@/lib/smooth-scroll-anchor";
import { isAdminEmail } from "@/lib/admin";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#what-we-do" },
  { label: "Works", href: "#what-we-do" },
  { label: "Team", href: "#team" },
  { label: "Reviews", href: "#reviews" },
];

type NavItem = {
  label: string;
  href: string;
  isDashboard: boolean;
};

/** Shared glass style for both desktop pill and mobile menu */
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

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [session, setSession] = useState<{ user?: { email: string } } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${backendUrl}/users/me`, { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setSession({ user });
        }
      } catch (err) {
        // ignore
      }
    };
    fetchSession();
  }, []);

  const isUserAdmin = session?.user?.email ? isAdminEmail(session.user.email) : false;
  const dashboardHref = isUserAdmin ? "/admin" : "/dashboard";

  const navItems = useMemo((): NavItem[] => {
    const items: NavItem[] = NAV_LINKS.map((link) => ({
      ...link,
      isDashboard: false,
    }));
    if (!session) return items;

    const teamIndex = items.findIndex((link) => link.label === "Team");
    const insertAt = teamIndex === -1 ? items.length : teamIndex + 1;
    items.splice(insertAt, 0, {
      label: "Dashboard",
      href: dashboardHref,
      isDashboard: true,
    });
    return items;
  }, [session, dashboardHref]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* Close menu on resize past mobile breakpoint */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback(
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith("#")) {
        event.preventDefault();
        scrollToAnchor(href);
        closeMenu();
        return;
      }

      if (href === "/" && pathname === "/") {
        event.preventDefault();
        scrollToTop();
        closeMenu();
      }
    },
    [closeMenu, pathname],
  );

  return (
    <>
      <nav className="top-0 left-0 z-50 flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-4 px-4 py-4 sm:px-8 sm:py-5 lg:flex-nowrap lg:px-12 xl:px-18 xl:py-6">
        <Image
          className="h-auto w-[105px] sm:w-[118px] xl:w-[125px]"
          src="/assets/logo.svg"
          alt="Hylith"
          width={125}
          height={40}
          priority
        />

        {/* ── Desktop nav pill (hidden on mobile) ── */}
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
              onClick={handleNavClick(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Hamburger button (visible on mobile only) ── */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative z-[60] flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full md:hidden"
          style={GLASS_STYLE}
        >
          {/* Top bar */}
          <span
            className="block h-[2px] w-[18px] rounded-full bg-[#0F0B0A] transition-all duration-300"
            style={{
              transform: menuOpen
                ? "translateY(3.5px) rotate(45deg)"
                : "none",
            }}
          />
          {/* Bottom bar */}
          <span
            className="block h-[2px] w-[18px] rounded-full bg-[#0F0B0A] transition-all duration-300"
            style={{
              transform: menuOpen
                ? "translateY(-3.5px) rotate(-45deg)"
                : "none",
            }}
          />
        </button>
      </nav>

      {/* ── Mobile fullscreen menu overlay ── */}
      <div
        className={`fixed inset-0 z-[55] flex flex-col items-center justify-center transition-all duration-500 md:pointer-events-none md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{
          background: "rgba(238, 238, 232, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <nav className="flex flex-col items-center gap-8">
          {navItems.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={link.isDashboard ? closeMenu : handleNavClick(link.href)}
              className={
                link.isDashboard
                  ? "text-3xl font-semibold tracking-[-0.02em] text-blue-600 transition-all duration-300 hover:opacity-60 sm:text-4xl"
                  : "text-3xl font-semibold tracking-[-0.02em] text-[#0F0B0A] transition-all duration-300 hover:opacity-60 sm:text-4xl"
              }
              style={{
                transform: menuOpen
                  ? "translateY(0)"
                  : `translateY(${20 + i * 8}px)`,
                opacity: menuOpen ? 1 : 0,
                transitionDelay: menuOpen ? `${100 + i * 60}ms` : "0ms",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
