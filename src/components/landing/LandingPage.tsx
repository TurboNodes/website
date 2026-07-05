import { useEffect, useRef } from "react";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
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
        <div className="snap-start">
          <SiteFooter theme="dark" />
        </div>
      </main>
    </>
  );
}
