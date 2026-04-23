import React from "react";

const HeroSection = () => {
  return (
    <section className="hero section" id="home">
      <div className="mt-24">
        <h1 className="text-9xl  font-medium text-center">
          <span className="block mr-72 tracking-[-0.03em]">WE COMPLETE</span>
          <span className="flex items-center justify-center gap-4 mx-auto">
            <span
              className="inline-flex items-center  px-10 py-3 cursor-pointer font-semibold rounded-full"
              style={{
                fontSize: "1.09rem",
                lineHeight: "1",
                height: "4rem",
                letterSpacing: "0",
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
            >
              Discuss Your System
            </span>
            <span className="tracking-[-0.05em]">YOUR BUSINESS</span>
          </span>
        </h1>
      </div>
      <div>
        <p className="capitalize font-medium text-3xl text-center ml-96 text-[#666666] tracking-[-0.05em]">
          We design and build full-stack systems
        </p>
        <p className="capitalize font-medium text-3xl text-center ml-96 text-[#666666] tracking-[-0.05em]">
          where logic and interface work as one.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;