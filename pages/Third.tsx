import React from "react";
import { TextReveal } from "@/components/ui/text-reveal"
const Third = () => {
  return (
    <section className="w-full text-black" aria-labelledby="approach-heading">
      <h2 id="approach-heading" className="sr-only">
        Our approach to product design
      </h2>
        <TextReveal>We Design Structure, Systems, And Interfaces
That Work Together Seamlessly So Everything Feels
Simple, Reliable, And Precise.</TextReveal>
    </section>
  )
}

export default Third
