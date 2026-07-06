import Link from "next/link";
import { useRef, type CSSProperties, type RefObject } from "react";
import { useFooterScrollProgress } from "@/hooks/useFooterScrollProgress";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/download", label: "Download" },
  { href: "/network-access", label: "Network Access" },
] as const;

const SOCIALS = [
  {
    href: "https://github.com/TurboNodes",
    label: "GitHub",
    path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  },
  {
    href: "https://discord.gg/ZqdvQkSEc7",
    label: "Discord",
    path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  },
  {
    href: "https://x.com/",
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
] as const;

const DOME_MIN_SCALE = 0.62;
const DOME_MAX_SCALE_Y = 1;
const DOME_MAX_SCALE_X = 1;
const DOME_BASE_HEIGHT_DVH = 75;
const DOME_EXPANDED_HEIGHT_DVH = (6 / 7) * 100;
const DOME_HEIGHT_GROW_DVH = DOME_EXPANDED_HEIGHT_DVH - DOME_BASE_HEIGHT_DVH;
const GLOW_BASE_HEIGHT_DVH = 42;
const GLOW_EXPANDED_HEIGHT_DVH =
  (GLOW_BASE_HEIGHT_DVH / DOME_BASE_HEIGHT_DVH) * DOME_EXPANDED_HEIGHT_DVH;
const GLOW_HEIGHT_GROW_DVH = GLOW_EXPANDED_HEIGHT_DVH - GLOW_BASE_HEIGHT_DVH;
const LOCKUP_LIFT_REM = 6.75;
const LOGO_EXPAND_ROTATE_DEG = 360;

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className = cn(
    "relative text-sm font-medium text-neutral-400",
    "transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 hover:text-white",
    "hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]",
    "active:translate-y-0 active:scale-[0.98]",
    "after:absolute after:-bottom-1 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2",
    "after:bg-orange-400/70 after:transition-all after:duration-200",
    "hover:after:w-full",
  );

  if (external) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

interface LandingFooterProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export function LandingFooter({ scrollContainerRef }: LandingFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const progress = useFooterScrollProgress(scrollContainerRef, footerRef);

  const domeScaleX =
    DOME_MIN_SCALE + (DOME_MAX_SCALE_X - DOME_MIN_SCALE) * progress;
  const domeScaleY =
    DOME_MIN_SCALE + (DOME_MAX_SCALE_Y - DOME_MIN_SCALE) * progress;
  const domeTransform = `translateX(-50%) scaleX(${domeScaleX}) scaleY(${domeScaleY})`;
  const domeHeight = `calc(${DOME_BASE_HEIGHT_DVH}dvh + ${progress * DOME_HEIGHT_GROW_DVH}dvh)`;
  const glowHeight = `calc(${GLOW_BASE_HEIGHT_DVH}dvh + ${progress * GLOW_HEIGHT_GROW_DVH}dvh)`;
  const contentOpacity = 0.25 + progress * 0.75;
  const contentShift = (1 - progress) * 28;
  const titleFontSize = `calc(clamp(1.5rem, 4vw, 2rem) + ${progress * 0.875}rem)`;
  const logoTransform =
    progress === 0
      ? undefined
      : `rotate(${progress * LOGO_EXPAND_ROTATE_DEG}deg)`;
  const contentStyle = {
    "--footer-p": progress,
    opacity: contentOpacity,
    transform: `translateY(${contentShift}px)`,
  } as CSSProperties;

  return (
    <footer
      ref={footerRef}
      className="relative flex min-h-dvh w-full flex-col items-center justify-end px-6 pb-[9dvh] pt-[20dvh] sm:pb-[11dvh] sm:pt-[22dvh]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 from-0% via-neutral-950/80 via-[18%] to-transparent to-[28%]" />

        <div
          className="absolute bottom-0 left-1/2 h-[42dvh] w-[78vw] max-w-[620px] will-change-transform"
          style={{
            height: glowHeight,
            transform: domeTransform,
            transformOrigin: "bottom center",
          }}
        >
          <div className="absolute inset-0 rounded-t-[50%] bg-[radial-gradient(ellipse_100%_100%_at_50%_100%,rgba(249,115,22,0.24)_0%,rgba(249,115,22,0.07)_42%,transparent_76%)] blur-2xl" />
        </div>

        <div
          className="absolute bottom-0 left-1/2 h-[75dvh] w-[128vw] max-w-[1040px] will-change-transform"
          style={{
            height: domeHeight,
            transform: domeTransform,
            transformOrigin: "bottom center",
          }}
        >
          <div className="absolute inset-0 rounded-t-[50%] bg-[radial-gradient(ellipse_95%_70%_at_50%_0%,#2d2d2d_0%,#181818_48%,#0a0a0a_100%)]" />
          <div className="absolute inset-0 rounded-t-[50%] shadow-[inset_0_1px_0_rgba(251,146,60,0.24)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[40dvh] bg-gradient-to-t from-neutral-900/55 via-transparent to-transparent" />
      </div>

      <div
        className="relative z-10 flex w-full max-w-[calc(36rem+var(--footer-p)*10rem)] flex-col items-center gap-[calc(1.75rem+var(--footer-p)*1.25rem)] text-center will-change-[transform,opacity] sm:gap-[calc(2.25rem+var(--footer-p)*1.5rem)]"
        style={contentStyle}
      >
        <Link
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById("hero")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="group flex flex-col items-center transition-opacity duration-200 hover:opacity-90"
        >
          <div
            className="flex flex-col items-center gap-[calc(0.75rem-var(--footer-p)*0.65rem)] will-change-transform"
            style={{
              transform: `translateY(calc(var(--footer-p) * -${LOCKUP_LIFT_REM}rem))`,
            }}
          >
            <div className="flex flex-row items-center gap-[calc(0.375rem+var(--footer-p)*0.125rem)]">
              <span
                className="inline-flex shrink-0 transition-transform will-change-transform"
                style={
                  logoTransform
                    ? {
                        transform: logoTransform,
                        transformOrigin: "center center",
                      }
                    : undefined
                }
              >
                <img
                  src="/logo.png"
                  alt="Turbo"
                  className="size-[calc(3rem+var(--footer-p)*1.25rem)] sm:size-[calc(3.5rem+var(--footer-p)*1.5rem)]"
                />
              </span>
              <span
                className="text-white leading-none transition-transform duration-200 ease-out"
                style={{
                  fontFamily:
                    "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
                  fontSize: titleFontSize,
                }}
              >
                Turbo
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 transition-colors duration-200 group-hover:text-neutral-400">
              // power_research_get_paid
            </span>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-[calc(1.25rem+var(--footer-p)*1rem)] gap-y-[calc(0.75rem+var(--footer-p)*0.5rem)] sm:gap-x-[calc(1.75rem+var(--footer-p)*1.25rem)]">
          {NAV_LINKS.map((link) => (
            <FooterLink key={link.label} {...link} />
          ))}
        </nav>

        <div className="rounded-full border border-neutral-800 bg-neutral-950/60 px-[calc(1.25rem+var(--footer-p)*1rem)] py-[calc(0.75rem+var(--footer-p)*0.375rem)] backdrop-blur-sm">
          <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
            <span className="font-medium text-orange-400/90">Network Access</span>
            {" — "}
            residential proxies for businesses, researchers, automators.
          </p>
        </div>

        <div className="flex items-center gap-[calc(0.5rem+var(--footer-p)*0.625rem)]">
          {SOCIALS.map(({ href, label, path }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={cn(
                "group/social flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950/50 text-neutral-500",
                "transition-all duration-200 ease-out",
                "hover:scale-110 hover:border-orange-500/40 hover:bg-neutral-900/90 hover:text-white",
                "hover:shadow-[0_0_24px_rgba(249,115,22,0.14)]",
                "active:scale-105",
              )}
            >
              <svg
                className="transition-transform duration-200 ease-out group-hover/social:scale-110"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d={path} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
