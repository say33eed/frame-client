
import Hero from "@/components/Hero";
import FeaturedStudios from "@/components/FeaturedStudios";
import StudioCategories from "@/components/StudioCategories";
import HowItWorks from "@/components/HowItWorks";
import HostGuarantee from "@/components/HostGuarantee";
import AboutUs from "@/components/AboutUs";

export default function Home() {
  return (
    <>
      <Hero />
      <StudioCategories />
      <FeaturedStudios />
      <HowItWorks />
      <HostGuarantee />
      <AboutUs />
    </>
  );
}
