import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, ArrowUp, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { NetworkAccessForm } from "./NetworkAccessForm";
import { LatencyBenchmarks } from "./LatencyBenchmarks";
import styles from "./network-access.module.css";
import globeStyles from "./network-globe.module.css";

const SCROLL_TOP_THRESHOLD = 400;

function scrollToRequestAccess(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const el = document.getElementById("request-access");
  if (!el) return;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  history.pushState(null, "", "#request-access");
}

const NetworkGlobe = dynamic(
  () => import("./NetworkGlobe").then((m) => m.NetworkGlobe),
  {
    ssr: false,
    loading: () => (
      <div className={globeStyles.globeShell} aria-hidden>
        <div className={globeStyles.fallback} />
      </div>
    ),
  },
);

const PROOF_STATS = [
  { value: "100%", label: "Consent-based nodes" },
  { value: "0", label: "Requests we can read" },
  { value: "40+", label: "Countries" },
  { value: "12M+", label: "Residential IPs" },
] as const;

const COMPLIANCE_POINTS = [
  {
    icon: UserCheck,
    title: "Sovereign pool, exceptional quality",
    body: "Our IPs are sovereign and actively curated — no third-party or resold pools. This helps businesses unlock their toughest targets such as social platforms, retail, and everything in between.",
  },
  {
    icon: ShieldCheck,
    title: "Built for legal compliance",
    body: "Documented sourcing, opt-in consent records, and encrypted transit give your legal team a network they can sign off on.",
  },
  {
    icon: Lock,
    title: "Zero access to your web data",
    body: "Traffic stays TLS-encrypted end to end. Neither Turbo nor any client node can decrypt your payload — nodes blindly route packets they cannot inspect or store.",
  },
] as const;

export function NetworkAccessPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const scrollingUp = y < lastScrollY.current;
      lastScrollY.current = y;
      setShowScrollTop(scrollingUp && y > SCROLL_TOP_THRESHOLD);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${styles.page} ${styles.gridBg}`}>
      <header className={styles.header}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className={`text-sm font-medium ${styles.muted} transition-colors hover:text-[#0c0f14]`}
          >
            ← turbo.network
          </Link>
          <span className={`${styles.eyebrow} hidden sm:inline`}>
            Network Access
          </span>
          <a
            href="#request-access"
            className={styles.primaryBtnSm}
            onClick={scrollToRequestAccess}
          >
            Request access
          </a>
        </div>
      </header>

      <main>
        <section
          className={`relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 ${styles.heroGlow}`}
        >
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <p className={`${styles.eyebrow} ${styles.fadeUp} mb-5`}>
                Residential proxy network
              </p>
              <h1
                className={`${styles.headline} ${styles.fadeUp} ${styles.fadeUpDelay1} mb-6`}
              >
                <span className={styles.headlineAccent}>Sovereign</span>
                
                <br />
                Residential egress
              </h1>
              <p
                className={`${styles.lead} ${styles.fadeUp} ${styles.fadeUpDelay2} max-w-lg sm:text-lg`}
              >
                Consent-based nodes in 40+ countries, TLS-encrypted end to end,
                and latency that leaves the majors behind — so proxies stop
                being your bottleneck.
              </p>
              <div
                className={`mt-10 flex flex-wrap items-center gap-3 ${styles.fadeUp} ${styles.fadeUpDelay3}`}
              >
                <a
                  href="#request-access"
                  className={styles.primaryBtn}
                  onClick={scrollToRequestAccess}
                >
                  Talk to our team
                  <ArrowRight className="size-4" />
                </a>
                <Link href="/download" className={styles.ghostBtn}>
                  Run a node instead
                </Link>
              </div>
            </div>

            <div className={`${styles.fadeUp} ${styles.fadeUpDelay2}`}>
              <NetworkGlobe />
            </div>
          </div>
        </section>

        <section
          className={`${styles.sectionAlt} ${styles.lineTop} ${styles.lineBottom} px-6 py-14`}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
            {PROOF_STATS.map((stat) => (
              <div key={stat.label}>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-2xl">
              <p className={`${styles.eyebrow} mb-5`}>Performance</p>
              <h2 className={styles.h2}>
                Proxies are no longer the bottleneck.
              </h2>
              <p className={`${styles.lead} mt-5 max-w-xl`}>
                Your toughest targets — the ones that block everything else —
                resolve on the first try. Real residential IPs, sticky sessions,
                and a pool that stays clean because it was sourced with consent.
              </p>
            </div>
            <div className={styles.metricCallout}>
              <p className={styles.metricValue}>99.5%</p>
              <p className={styles.metricLabel}>
                Success rate on hard targets
              </p>
            </div>
          </div>
        </section>

        <section
          className={`${styles.sectionAlt} ${styles.lineTop} ${styles.lineBottom} px-6 py-20 sm:py-28`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className={`${styles.eyebrow} mb-5`}>Benchmarks</p>
              <h2 className={styles.h2}>Lowest latency across every region.</h2>
              <p className={`${styles.lead} mt-5`}>
                Median request latency against the majors and the
                stealth-focused specialists, measured from in-region vantage
                points.
              </p>
            </div>
            <LatencyBenchmarks />
          </div>
        </section>

        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 max-w-2xl">
              <p className={`${styles.eyebrow} mb-5`}>Compliance</p>
              <h2 className={styles.h2}>
                High-quality. Legally compliant.<br/> Zero data access.
              </h2>
              <p className={`${styles.lead} mt-5`}>
                Quality and success rates start with how a network is built —
                not how hard you retry.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
              {COMPLIANCE_POINTS.map(({ icon: Icon, title, body }, index) => (
                <article key={title} className={styles.complianceItem}>
                  <div className={styles.complianceMeta}>
                    <span className={styles.complianceIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">{title}</h3>
                  <p className={`${styles.muted} text-sm leading-relaxed`}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="request-access"
          className={`${styles.sectionAlt} ${styles.lineTop} px-6 py-20 sm:py-28`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-xl">
              <p className={`${styles.eyebrow} mb-5`}>Get started</p>
              <h2 className={`${styles.h2} mb-4`}>Request network access</h2>
              <p className={`${styles.lead} text-sm sm:text-base`}>
                Tell us about your volume and regions — we&apos;ll follow up
                with pricing, coverage, and API credentials.
              </p>
            </div>
            <NetworkAccessForm />
          </div>
        </section>
      </main>

      <footer className={`${styles.lineTop} px-6 py-8`}>
        <div
          className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs ${styles.muted} sm:flex-row`}
        >
          <p>© {new Date().getFullYear()} Turbo Network Access</p>
          <div className="flex items-center gap-5">
            <Link
              href="/download"
              className="transition-colors hover:text-[#0c0f14]"
            >
              Become a node
            </Link>
            <a
              href="https://github.com/TurboNodes"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#0c0f14]"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      <button
        type="button"
        className={`${styles.scrollTopBtn} ${showScrollTop ? styles.scrollTopBtnVisible : ""}`}
        aria-label="Scroll to top"
        tabIndex={showScrollTop ? 0 : -1}
        onClick={() => {
          const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          window.scrollTo({
            top: 0,
            behavior: prefersReduced ? "auto" : "smooth",
          });
          if (window.location.hash) {
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
          }
        }}
      >
        <ArrowUp className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}
