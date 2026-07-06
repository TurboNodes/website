import Link from "next/link";
import { ArrowRight, Globe2, LineChart, ShieldCheck } from "lucide-react";
import { NetworkAccessForm } from "./NetworkAccessForm";
import { NodeDiagram } from "./NodeDiagram";
import styles from "./network-access.module.css";

const STATS = [
  { value: "40+", label: "Countries" },
  { value: "<50ms", label: "Median latency" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "24/7", label: "Support" },
] as const;

const USE_CASES = [
  {
    icon: LineChart,
    title: "Market research",
    body: "Collect pricing, listings, and competitive intelligence from real residential IPs — not datacenter blocks.",
  },
  {
    icon: Globe2,
    title: "Web automation",
    body: "Run crawlers, monitors, and QA pipelines at scale with geographically distributed egress.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-first access",
    body: "Opt-in node operators, encrypted transit, and transparent usage policies built for enterprise teams.",
  },
] as const;

export function NetworkAccessPage() {
  return (
    <div className={`${styles.page} ${styles.gridBg}`}>
      <header className="sticky top-0 z-20 border-b border-black/6 bg-[#f6f5f1]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-[#5c6470] transition-colors hover:text-[#0c0f14]"
          >
            ← turbo.network
          </Link>
          <span className="hidden text-xs font-medium tracking-[0.18em] text-[#5c6470] uppercase sm:inline">
            Network Access
          </span>
          <a href="#request-access" className={styles.primaryBtn}>
            Request access
          </a>
        </div>
      </header>

      <main>
        <section className={`relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 ${styles.heroGlow}`}>
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <p className={`${styles.eyebrow} ${styles.fadeUp} mb-6`}>
                Residential proxy infrastructure
              </p>
              <h1
                className={`${styles.headline} ${styles.fadeUp} ${styles.fadeUpDelay1} mb-6`}
              >
                Internet-scale
                <br />
                egress from{" "}
                <span className={styles.headlineAccent}>real homes.</span>
              </h1>
              <p
                className={`max-w-lg text-base leading-relaxed text-[#5c6470] sm:text-lg ${styles.fadeUp} ${styles.fadeUpDelay2}`}
              >
                Turbo Network Access routes your workloads through a distributed
                mesh of residential nodes — built for businesses, researchers,
                and automators who need reliable, geo-diverse web data.
              </p>
              <div
                className={`mt-10 flex flex-wrap items-center gap-3 ${styles.fadeUp} ${styles.fadeUpDelay3}`}
              >
                <a href="#request-access" className={styles.primaryBtn}>
                  Talk to our team
                  <ArrowRight className="size-4" />
                </a>
                <Link href="/download" className={styles.ghostBtn}>
                  Run a node instead
                </Link>
              </div>
            </div>

            <div className={`${styles.fadeUp} ${styles.fadeUpDelay2}`}>
              <NodeDiagram />
            </div>
          </div>
        </section>

        <section className="border-y border-black/6 bg-[#eeede8]/60 px-6 py-14">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 max-w-2xl">
              <p className={`${styles.eyebrow} mb-4`}>Use cases</p>
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
                Built for teams that need the open web, without the friction.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {USE_CASES.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className={`${styles.card} rounded-2xl p-6 sm:p-7`}
                >
                  <div className="mb-5 inline-flex rounded-xl bg-[#1a4fd6]/8 p-2.5 text-[#1a4fd6]">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#5c6470]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="request-access" className="scroll-mt-24 px-6 pb-20 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-xl">
              <p className={`${styles.eyebrow} mb-4`}>Get started</p>
              <h2 className="mb-3 text-3xl font-medium tracking-tight sm:text-4xl">
                Request network access
              </h2>
              <p className="text-sm leading-relaxed text-[#5c6470] sm:text-base">
                Tell us about your use case and we&apos;ll follow up with pricing,
                regions, and API credentials.
              </p>
            </div>
            <NetworkAccessForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-black/6 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[#5c6470] sm:flex-row">
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
    </div>
  );
}
