"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { scrollToAnchor, scrollToTop } from "@/lib/smooth-scroll-anchor";
import type { NavItem } from "@/components/Navbar";

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

type NavbarMenuProps = {
  navItems: readonly NavItem[];
};

export default function NavbarMenu({ navItems }: NavbarMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith("#")) {
        event.preventDefault();
        scrollToAnchor(href);
        closeMenu();
        return;
      }

      if (href === "/" && window.location.pathname === "/") {
        event.preventDefault();
        scrollToTop();
        closeMenu();
      }
    };

  return (
    <>
      <button
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        className="relative z-[60] flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full md:hidden"
        style={GLASS_STYLE}
      >
        <span
          className="block h-[2px] w-[18px] rounded-full bg-[#0F0B0A] transition-all duration-300"
          style={{
            transform: menuOpen
              ? "translateY(3.5px) rotate(45deg)"
              : "none",
          }}
        />
        <span
          className="block h-[2px] w-[18px] rounded-full bg-[#0F0B0A] transition-all duration-300"
          style={{
            transform: menuOpen
              ? "translateY(-3.5px) rotate(-45deg)"
              : "none",
          }}
        />
      </button>

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
}
