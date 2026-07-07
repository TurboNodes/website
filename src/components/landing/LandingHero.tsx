import { ChevronDown } from "lucide-react";
import { scrollToLandingSection } from "@/lib/landingScroll";

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative min-h-dvh flex flex-col overflow-hidden bg-neutral-950"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai-sunset.png"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover hero-bg"
        style={{ objectPosition: "center 42%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_35%,transparent_20%,rgba(0,0,0,0.45)_100%)]" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="absolute inset-x-0 bottom-[13%] sm:bottom-[15%] px-6 text-center">
          <h1
            className="hero-text-reveal hero-text-reveal-delay-1 text-white leading-[1.05] mb-4 max-w-3xl mx-auto drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
            style={{
              fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
              fontSize: "clamp(2.75rem, 8vw, 5rem)",
            }}
          >
            Power Research.
            <br />
            Get Paid.
          </h1>
          <p className="hero-text-reveal hero-text-reveal-delay-2 text-white/85 text-lg sm:text-xl font-medium max-w-lg mx-auto drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
            Earn rewards by sharing your unused bandwidth.
          </p>
        </div>

        <a
          href="#how-it-works"
          onClick={(e) => {
            e.preventDefault();
            void scrollToLandingSection("how-it-works");
          }}
          className="hero-text-reveal hero-text-reveal-delay-3 mt-auto flex flex-col items-center gap-1 pb-10 text-white/70 hover:text-white transition-colors"
          aria-label="Scroll to learn more"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Learn more</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
