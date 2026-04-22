import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Second = () => {
  useGSAP(() => {
    // Set initial state BEFORE animation to prevent jump
    gsap.set(".second-section", {
      scale: 0.9,
      borderRadius: "38px",
      marginTop: "5rem",
    });

    gsap.to(".second-section", {
      scale: 1,
      marginTop: "0rem",
      borderRadius: 0,
      backgroundColor: "#EFEFED",
      ease: "easeOut",
      scrollTrigger: {
        trigger: ".second-wrapper",
        start: "top 75%",   // starts the moment wrapper enters viewport
        end: "top top",        // finishes when wrapper reaches top
        scrub: true,    
        // markers: true,        // smooth velocity-based scrub
      },
    });
  });

  return (
    <section className="second-wrapper">
      <div className="second-section h-screen bg-[#0F0B0A]"></div>
    </section>
  );
};

export default Second;