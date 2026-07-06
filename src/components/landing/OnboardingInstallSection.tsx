import { SiteFooter } from "@/components/brand/SiteFooter";
import { OnboardingPipeline } from "./OnboardingPipeline";

export function OnboardingInstallSection() {
  return (
    <section
      id="get-started"
      className="relative min-h-dvh flex flex-col snap-start bg-neutral-950 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent" />
      </div>

      <OnboardingPipeline />
    </section>
  );
}
