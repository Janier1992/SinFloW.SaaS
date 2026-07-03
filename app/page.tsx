import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Differentials } from "@/components/sections/Differentials";
import { Technologies } from "@/components/sections/Technologies";
import { PortfolioExperience } from "@/components/sections/PortfolioExperience";
import { CTA } from "@/components/sections/CTA";
import { Testimonials } from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Differentials />
      <Technologies />
      <Testimonials />
      <PortfolioExperience />
      <CTA />
    </>
  );
}
