"use client";

import React, { useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HiArrowLongRight } from "react-icons/hi2";
import Image from "next/image";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Second = () => {
  const [isWhite, setisWhite] = useState(false);
  useGSAP(() => {
    // Set initial state BEFORE animation to prevent jump
    gsap.set(".second-section", {
      scale: 0.9,
      borderRadius: "40px", 
    });

    gsap.to(".second-section", {
      scale: 1, 
      borderRadius: 0,
      backgroundColor: "#EFEFED",
      ease: "none",
      
      scrollTrigger: {
        trigger: ".second-wrapper",
        start: "top 75%", // starts the moment wrapper enters viewport
        end: "top top", // finishes when wrapper reaches top
        scrub: 1,        // smooth velocity-based scrub
      },
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".second-wrapper",
        start: "top top",
        end: "+=200%", // total scroll distance while pinned (adjust as needed)
        scrub: true, 
        pin: true,
      },
    });

    // Hold at full scale
    tl.to(".second-section", {
      scale: 1,
      duration: 2, // Holds for proportionally "2s" of scroll
      ease: "none",
    });

    // Then reverse animation to starting state
    tl.to(".second-section", {
      scale: 0.9, 
      borderRadius: "40px",
      backgroundColor: "#0F0B0A",
      duration: 1,
      ease: "none",
    });
  }); 

  return (
    <section className="second-wrapper">
      <div className="second-section  h-screen flex p-10 bg-[#0F0B0A]">
        <div className="h-full w-[55vw] ">
          <div className="w-full h-2/3 flex items-center ">
            <Image
              src={"/assets/temp.png"}
              alt="team"
              height={800}
              width={800}
            />
          </div>
          <div className="w-full h-1/3 flex flex-col justify-end text-7xl font-regular  leading-16 ">
            <h2>Beautiful form that</h2>
            <h2 className="tracking-tight">connects with people and</h2>
            <h2>lives beyond trends</h2>
          </div>
        </div>
        <div className="h-full w-[45vw]  ">

          <div className="w-full h-3/4 ">
            <div className="w-full flex flex-col uppercase py-8 font-bold text-8xl">
              <h2>together,</h2>
              <h2>we create</h2>
              <h2>solutions</h2>
            </div>
          </div>
          <div className="w-full flex justify-between items-end h-1/4">
            <span className=" cursor-pointer w-30 h-6 border-b-2 border-[#0F0B0A] font-medium flex items-center justify-between ">Our Work  <HiArrowLongRight size={28}/></span>
            <span className=" cursor-pointer w-30 h-6 border-b-2 border-[#0F0B0A] font-medium flex items-center justify-between ">Discuss <HiArrowLongRight size={28}/> </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Second;
