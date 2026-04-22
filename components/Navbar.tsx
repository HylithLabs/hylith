"use client";

import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex px-18 py-6 justify-between items-center z-50  top-0 left-0 w-full">
      <Image
        src="/assets/logo.svg"
        alt="Hylith"
        width={125}
        height={40}
        priority
      />

      {/* <LiquidGLWrapper
        options={{
          refraction: 0.036,
          frost: 0,
          tilt: false,
          shadow: false,
          specular: true,
          bevelDepth: 0,
          bevelWidth: 0.04,
        }}
      > */}
      <div
        style={{
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
        }}
        className="nav flex  font-semibold h-14 rounded-full relative gap-8 px-10 items-center text-sm"
      >
        <Link
          className="cursor-pointer font-medium hover:opacity-70 transition"
          href="#"
        >
          Home
        </Link>
        <Link
          className="cursor-pointer font-medium hover:opacity-70 transition"
          href="#"
        >
          Services
        </Link>
        <Link
          className="cursor-pointer font-medium hover:opacity-70 transition"
          href="#"
        >
          Works
        </Link>
        <Link
          className="cursor-pointer font-medium hover:opacity-70 transition"
          href="#"
        >
          Team
        </Link>
        <Link
          className="cursor-pointer font-medium hover:opacity-70 transition"
          href="#"
        >
          Reviews
        </Link>
      </div>
      {/* </LiquidGLWrapper> */}
    </nav>
  );
};

export default Navbar;
