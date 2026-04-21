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
      refraction: 0.01,
      bevelDepth: 0.19,
      bevelWidth: 0.126,
      frost: 0,
      shadow: true,
      specular: true,
      //   reveal: "fade",
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
            padding:"10px",
          boxShadow: `
      0 0 8px rgba(0,0,0,0.03),
      0 2px 6px rgba(0,0,0,0.08),
      inset 3px 3px 0.5px -3.5px rgba(0,0,0,0.09),
      inset -3px -3px 0.5px -3.5px rgba(0,0,0,0.85),
      inset 1px 1px 1px -0.5px rgba(0,0,0,0.6),
      inset -1px -1px 1px -0.5px rgba(0,0,0,0.6),
      inset 0 0 6px 6px rgba(0,0,0,0.12),
      inset 0 0 2px 2px rgba(0,0,0,0.06),
      0 0 12px rgba(255,255,255,0.15)
    `,
          background: "rgba(0,0,0,0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {children}
      </div>
    </>
  );
}
