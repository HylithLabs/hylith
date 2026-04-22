"use client";

import Image from "next/image";
import Link from "next/link";
import LiquidGLWrapper from "./LiquidGLWrapper";

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

      <LiquidGLWrapper
        options={{
          refraction: 0.036,
          frost: 0,
          tilt: false,
          shadow: false,
          specular: true,
          bevelDepth: 0,
          bevelWidth: 0.04,
        }}
      >
        <div className="nav flex gap-8 px-8 py-1 text-sm">
          <Link className="cursor-pointer font-medium hover:opacity-70 transition" href="#">Home</Link>
          <Link className="cursor-pointer font-medium hover:opacity-70 transition" href="#">Services</Link>
          <Link className="cursor-pointer font-medium hover:opacity-70 transition" href="#">Works</Link>
          <Link className="cursor-pointer font-medium hover:opacity-70 transition" href="#">Team</Link>
          <Link className="cursor-pointer font-medium hover:opacity-70 transition" href="#">Reviews</Link>
        </div>
      </LiquidGLWrapper>
    </nav>
  );
};

export default Navbar;