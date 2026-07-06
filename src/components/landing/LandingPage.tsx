import { useEffect, useRef } from "react";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { useLandingScroll } from "@/hooks/useLandingScroll";
import {
  animateScrollTo,
  scrollToLandingSection,
} from "@/lib/landingScroll";
import { LandingFooter } from "./LandingFooter";
import { OnboardingNav } from "./OnboardingNav";
import { LandingHero } from "./LandingHero";
import { NodeExplainer } from "./NodeExplainer";
import { OnboardingInstallSection } from "./OnboardingInstallSection";

export function LandingPage() {
  const scrollRef = useRef<HTMLElement>(null);
  const footerSectionRef = useRef<HTMLElement>(null);
  const { hidden, animate } = useHideOnScroll(scrollRef);
  useLandingScroll(scrollRef, footerSectionRef);

  useEffect(() => {
    document.documentElement.classList.add("landing-scroll");
    return () => document.documentElement.classList.remove("landing-scroll");
  }, []);

  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.slice(1);
      if (!id) return;
      void scrollToLandingSection(id, scrollRef.current);
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
        className="landing-scroll-main h-dvh overflow-y-auto overflow-x-hidden overscroll-y-contain bg-neutral-950 snap-none"
      >
        <LandingHero />
        <NodeExplainer />
        <OnboardingInstallSection />
        <section
          ref={footerSectionRef}
          className="relative -mt-[42dvh] h-[200dvh] bg-neutral-950"
        >
          <div className="sticky top-0 h-dvh">
            <LandingFooter scrollContainerRef={scrollRef} />
          </div>
        </section>
      </main>
    </>
  );
}
