// components/LiquidGLWrapper.tsx
"use client";

import { useRef, ElementType, useId } from "react";
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

interface LiquidGLWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  options?: LiquidGLOptions;
  as?: ElementType;
}

export default function LiquidGLWrapper({
  children,
  options = {},
  as: Component = "div",
  ...props
}: LiquidGLWrapperProps) {
  const glassRef = useRef<HTMLElement | null>(null);
  const instanceRef = useRef<LiquidGLInstance | null>(null);
  const uniqueId = useId().replace(/:/g, "");
  const targetClass = `liquidGL-${uniqueId}`;

  const initLiquidGL = () => {
    if (typeof window === "undefined" || !window.liquidGL) return;

    instanceRef.current = window.liquidGL({
      snapshot: "body",
      target: `.${targetClass}`,
      resolution: 2.0,
      refraction: 0.036,
      bevelDepth: 0,
      bevelWidth: 0.04,
      frost: 0,
      shadow: false,
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
        src="/scripts/html2canvas.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/scripts/liquidGL.js"
        strategy="afterInteractive"
        onLoad={initLiquidGL}
      />
      <Component
        className={`liquidGL ${targetClass} relative inline-flex items-center rounded-full ${props.className || ""}`}
        ref={glassRef}
        style={{
          padding: "10px",
          boxShadow: `
          0 10px 60px 8px rgba(0, 0, 0, 0.03),
          0 4px 30px 4px rgba(0, 0, 0, 0.03),
          0 0 100px 30px rgba(0, 0, 0, 0.04),
          inset 0 1px 1px rgba(255,255,255,0.08),
          inset 0 -1px 1px rgba(0,0,0,0.12)
        `,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "0.5px solid rgba(255,255,255,0.18)",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        ...props.style,
        }}
        {...props}
      >
        {children}
      </Component>
    </>
  );
}
