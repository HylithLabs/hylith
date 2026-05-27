"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    if (!overlay || !logo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = previousOverflow;
        gsap.set(overlay, { display: "none" });
        onComplete();
      },
    });

    tl.to(logo, { opacity: 0, duration: 0.2, ease: "power1.inOut" })
      .to(logo, { opacity: 1, duration: 0.2, ease: "power1.inOut" })
      .to(logo, { opacity: 0, duration: 0.2, ease: "power1.inOut" })
      .to(logo, { opacity: 1, duration: 0.2, ease: "power1.inOut" })
      .to(overlay, { opacity: 0, duration: 0.5, ease: "power1.inOut" });

    return () => {
      tl.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#EFEFED]"
      aria-hidden="true"
    >
      <div ref={logoRef}>
        <Image
          src="/assets/logo.svg"
          alt=""
          width={125}
          height={40}
          priority
          className="h-auto w-[105px] sm:w-[118px] xl:w-[125px]"
        />
      </div>
    </div>
  );
}
