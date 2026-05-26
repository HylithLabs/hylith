"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#" },
  { label: "Works", href: "#" },
  { label: "Team", href: "#" },
  { label: "Reviews", href: "#" },
];

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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              className="cursor-pointer font-medium transition hover:opacity-70"
              href={link.href}
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
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="text-3xl font-semibold tracking-[-0.02em] text-[#0F0B0A] transition-all duration-300 hover:opacity-60 sm:text-4xl"
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
