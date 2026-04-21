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
          padding: "10px",
          boxShadow: `
    0 4px 16px rgba(0,0,0,0.12),
    0 1px 4px rgba(0,0,0,0.08),
    inset 0 2px 4px rgba(255,255,255,0.95),
    inset 0 -2px 4px rgba(0,0,0,0.08),
    inset 2px 0 4px rgba(255,255,255,0.7),
    inset -2px 0 4px rgba(0,0,0,0.04)
  `,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.9)",
        }}
      >
        {children}
      </div>
    </>
  );
}
