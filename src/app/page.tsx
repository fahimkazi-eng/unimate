import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Roadmap } from "@/components/landing/roadmap";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { Reveal } from "@/components/ui/reveal";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        {/* Features animates its own cards; the rest cascade on scroll. */}
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Features />
        <Reveal delay={60}>
          <Roadmap />
        </Reveal>
        <Reveal delay={60}>
          <Faq />
        </Reveal>
        <Reveal delay={60}>
          <Cta />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}