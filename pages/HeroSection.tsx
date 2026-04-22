import React from 'react'

const HeroSection = () => {
  return (
    <section className="hero section" id='home'>
        <div className="mt-24">
          <h1 className="text-9xl tracking-[-0.05em] font-medium text-center mr-72">
            WE COMPLETE
          </h1>
          <div className="flex items-center justify-center gap-2 mx-auto">
            <button
              className="px-10 text-sm cursor-pointer font-semibold h-18   rounded-full relative"
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
            >
              Discuss Your System
            </button>
            <h1 className="text-9xl tracking-[-0.05em] font-medium   w-fit">
              YOUR BUSINESS
            </h1>
          </div>
        </div>
        <div className=''>
          <p className="capitalize font-medium text-3xl text-center ml-96 text-[#666666] tracking-[-0.05em]">
            We design and build full-stack systems
          </p>
          <p className="capitalize font-medium text-3xl text-center ml-96 text-[#666666] tracking-[-0.05em]">
            where logic and interface work as one.
          </p>
        </div>
      </section>
  )
}

export default HeroSection