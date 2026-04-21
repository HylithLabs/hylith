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
          refraction: 0.015,
          frost: 0,
          tilt: false, // tilt looks odd on navbars
          shadow: false,
          specular: true,
          bevelDepth: 0.011,
          bevelWidth: 0.354,
        }}
      >
        <div className="flex gap-8 font-dm-sans px-8">
          <Link href="#">Home</Link>
          <Link href="#">Services</Link>
          <Link href="#">Works</Link>
          <Link href="#">Team</Link>
          <Link href="#">Reviews</Link>
        </div>
      </LiquidGLWrapper>
    </nav>
  );
};

export default Navbar;