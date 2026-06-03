"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

export type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

type BubbleMenuProps = {
  logo: ReactNode;
  items: BubbleMenuItem[];
  menuAriaLabel: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
  onItemClick?: (item: BubbleMenuItem, event: MouseEvent<HTMLAnchorElement>) => void;
};

const BUBBLE_POSITIONS = [
  { x: -74, y: -72 },
  { x: -116, y: -16 },
  { x: -78, y: 56 },
  { x: 8, y: 66 },
  { x: 84, y: 16 },
] as const;

export default function BubbleMenu({
  logo,
  items,
  menuAriaLabel,
  menuBg = "#ffffff",
  menuContentColor = "#111111",
  useFixedPosition = false,
  animationEase = "back.out(1.5)",
  animationDuration = 0.5,
  staggerDelay = 0.12,
  onItemClick,
}: BubbleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const bubbleItems = useMemo(
    () =>
      items.map((item, index) => {
        const position = BUBBLE_POSITIONS[index % BUBBLE_POSITIONS.length];
        const rotation = item.rotation ?? 0;

        return {
          ...item,
          position,
          rotation,
        };
      }),
    [items],
  );

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const handleItemClick = useCallback(
    (item: BubbleMenuItem, event: MouseEvent<HTMLAnchorElement>) => {
      onItemClick?.(item, event);
      closeMenu();
    },
    [closeMenu, onItemClick],
  );

  return (
    <div
      className={`relative z-50 ${useFixedPosition ? "fixed bottom-4 right-4" : "inline-flex"}`}
    >
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          className="fixed inset-0 z-40 cursor-default bg-black/10 backdrop-blur-[1px] md:hidden"
          onClick={closeMenu}
        />
      ) : null}

      <div
        className={`relative z-50 ${useFixedPosition ? "" : "ml-auto"}`}
        style={{
          width: useFixedPosition ? "min(86vw, 19rem)" : "min(92vw, 19rem)",
        }}
      >
        <button
          type="button"
          aria-label={menuAriaLabel}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="relative z-50 flex h-12 w-full items-center justify-between gap-3 rounded-full border border-white/60 px-4 text-left shadow-[0_10px_40px_-10px_rgba(0,0,0,0.16),0_4px_15px_0_rgba(0,0,0,0.08)] transition-transform duration-300 active:scale-[0.98]"
          style={{
            background: menuBg,
            color: menuContentColor,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-sm font-semibold">
              {logo}
            </span>
            <span className="text-[0.85rem] font-medium tracking-[-0.01em]">
              Menu
            </span>
          </span>
          <span className="flex items-center gap-1.5" aria-hidden="true">
            <span
              className="block h-[2px] w-3 rounded-full"
              style={{ backgroundColor: menuContentColor, transform: "rotate(45deg)" }}
            />
            <span
              className="block h-[2px] w-3 rounded-full"
              style={{
                backgroundColor: menuContentColor,
                transform: "translateX(-4px) rotate(-45deg)",
              }}
            />
          </span>
        </button>

        <div
          aria-hidden={!isOpen}
          className={`pointer-events-none absolute right-0 top-[4.25rem] z-50 h-[18rem] w-[18rem] origin-top-right transition-[opacity,transform] ${isOpen ? "opacity-100" : "opacity-0"}`}
          style={{
            transform: isOpen
              ? "scale(1) translateY(0)"
              : "scale(0.92) translateY(-12px)",
            transitionDuration: `${animationDuration}s`,
            transitionTimingFunction: animationEase,
          }}
        >
          <div
            className="absolute inset-0 rounded-[2rem] border border-white/60 shadow-[0_18px_60px_-18px_rgba(0,0,0,0.26)]"
            style={{
              background: menuBg,
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          />

          <div className="absolute inset-0">
            {bubbleItems.slice(0, 5).map((item, index) => {
              const position = item.position;
              const isDashboard = item.label.toLowerCase() === "dashboard";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.ariaLabel ?? item.label}
                  onClick={() => handleItemClick(item)}
                  className="pointer-events-auto absolute left-1/2 top-1/2 inline-flex h-14 min-w-28 items-center justify-center rounded-full px-4 text-sm font-semibold shadow-[0_8px_24px_-10px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-black/20"
                  style={{
                    backgroundColor: item.hoverStyles?.bgColor ?? (isDashboard ? "#2563eb" : "#0f0b0a"),
                    color: item.hoverStyles?.textColor ?? "#ffffff",
                    transform: isMounted && isOpen
                      ? `translate(${position.x}px, ${position.y}px) rotate(${item.rotation ?? 0}deg)`
                      : "translate(0px, 0px) rotate(0deg)",
                    opacity: isOpen ? 1 : 0,
                    transitionProperty: "transform, opacity, background-color, color, box-shadow",
                    transitionDuration: `${animationDuration}s`,
                    transitionTimingFunction: animationEase,
                    transitionDelay: isOpen ? `${index * staggerDelay}s` : "0s",
                  }}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
