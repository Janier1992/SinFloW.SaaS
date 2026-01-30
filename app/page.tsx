import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Differentials } from "@/components/sections/Differentials";
import { Technologies } from "@/components/sections/Technologies";
import { PortfolioExperience } from "@/components/sections/PortfolioExperience";
import { CTA } from "@/components/sections/CTA";
import { Ecosystem } from "@/components/sections/Ecosystem";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Ecosystem />
      <Services />
      <Differentials />
      <Technologies />
      <PortfolioExperience />
      <CTA />
    </>
  );
}
