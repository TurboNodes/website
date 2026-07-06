import { useEffect, useRef } from "react";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { LandingFooter } from "./LandingFooter";
import { OnboardingNav } from "./OnboardingNav";
import { LandingHero } from "./LandingHero";
import { NodeExplainer } from "./NodeExplainer";
import { OnboardingInstallSection } from "./OnboardingInstallSection";

export function LandingPage() {
  const scrollRef = useRef<HTMLElement>(null);
  const { hidden, animate } = useHideOnScroll(scrollRef);

  useEffect(() => {
    document.documentElement.classList.add("landing-scroll");
    return () => document.documentElement.classList.remove("landing-scroll");
  }, []);

  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.slice(1);
      if (!id) return;
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <>
      <OnboardingNav hidden={hidden} animate={animate} theme="dark" />
      <main
        ref={scrollRef}
        className="snap-y snap-mandatory h-dvh overflow-y-auto overflow-x-hidden overscroll-y-contain bg-neutral-950"
      >
        <LandingHero />
        <NodeExplainer />
        <OnboardingInstallSection />
        <section className="relative h-[200dvh] snap-end bg-neutral-950">
          <div className="sticky top-0 h-dvh snap-start">
            <LandingFooter scrollContainerRef={scrollRef} />
          </div>
        </section>
      </main>
    </>
  );
}
