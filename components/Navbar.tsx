"use client";

import Image from "next/image";
import Link from "next/link";
import LiquidGLWrapper from "./LiquidGLWrapper";

const Navbar = () => {
  return (
    <nav className="flex px-18 py-6 justify-between items-center z-50 fixed top-0 left-0 w-full">
      <Image src="/assets/logo.svg" alt="Hylith" width={125} height={0} />

      <LiquidGLWrapper
        options={{
          refraction: 0.012,
          frost: 0,
          tilt: false,
          shadow: true,
          specular: true,
          bevelDepth: 0.006,
          bevelWidth: 0.02,
        }}
      >
        <div className="flex gap-8 font-dm-sans px-8">
          <Link className="cursor-pointer" href="#">Home</Link>
          <Link className="cursor-pointer" href="#">Services</Link>
          <Link className="cursor-pointer" href="#">Works</Link>
          <Link className="cursor-pointer" href="#">Team</Link>
          <Link className="cursor-pointer" href="#">Reviews</Link>
        </div>
      </LiquidGLWrapper>
    </nav>
  );
};

export default Navbar;