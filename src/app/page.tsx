import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AiDemo } from "@/components/landing/ai-demo";
import { Features } from "@/components/landing/features";
import { Roadmap } from "@/components/landing/roadmap";
import { CreatorSection } from "@/components/landing/creator-section";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { Reveal } from "@/components/ui/reveal";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 scroll-mt-4">
        <Hero />
        {/* Features animates its own cards; the rest cascade on scroll. */}
        <Reveal>
          <HowItWorks />
        </Reveal>
        <AiDemo />
        <Features />
        <CreatorSection />
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