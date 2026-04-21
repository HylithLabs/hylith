// components/LiquidGLWrapper.tsx
"use client";

import { useRef } from "react";
import Script from "next/script";

interface LiquidGLInstance {
  destroy?: () => void;
  [key: string]: unknown;
}

interface LiquidGLOptions {
  snapshot?: string;
  target?: string;
  resolution?: number;
  refraction?: number;
  bevelDepth?: number;
  bevelWidth?: number;
  frost?: number;
  shadow?: boolean;
  specular?: boolean;
  reveal?: "none" | "fade";
  tilt?: boolean;
  tiltFactor?: number;
  magnify?: number;
  on?: {
    init?: (instance: LiquidGLInstance) => void;
  };
}

declare global {
  interface Window {
    liquidGL: (options: LiquidGLOptions) => LiquidGLInstance;
  }
}

interface LiquidGLWrapperProps {
  children?: React.ReactNode;
  options?: LiquidGLOptions;
}

export default function LiquidGLWrapper({
  children,
  options = {},
}: LiquidGLWrapperProps) {
  const glassRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<LiquidGLInstance | null>(null);

  const initLiquidGL = () => {
    if (typeof window === "undefined" || !window.liquidGL) return;

    instanceRef.current = window.liquidGL({
      snapshot: "body",
      target: ".liquidGL",
      resolution: 2.0,
      refraction: 0.012,
      bevelDepth: 0.006,
      bevelWidth: 0.02,
      frost: 0,
      shadow: true,
      specular: true,
      tilt: false,
      tiltFactor: 5,
      magnify: 1,
      ...options,
      on: {
        init(instance: LiquidGLInstance) {
          console.log("liquidGL ready!", instance);
          options.on?.init?.(instance);
        },
      },
    });
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/scripts/liquidGL.js"
        strategy="afterInteractive"
        onLoad={initLiquidGL}
      />
      <div
        className="liquidGL relative inline-flex items-center rounded-full"
        ref={glassRef}
        style={{
          padding: "10px",
          boxShadow: `
          0 10px 60px 8px rgba(0,0,0,0.5),
          0 4px 30px 4px rgba(0,0,0,0.35),
          0 0 100px 30px rgba(0,0,0,0.18),
          inset 0 1px 1px rgba(255,255,255,0.08),
          inset 0 -1px 1px rgba(0,0,0,0.12)
        `,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "0.5px solid rgba(255,255,255,0.18)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </div>
    </>
  );
}
