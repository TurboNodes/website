import { Coins, Cpu, Shield, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SPECS: { k: string; v: string; Icon: LucideIcon }[] = [
  { k: "Protocol", v: "QUIC / TLS 1.3", Icon: Shield },
  { k: "Overhead", v: "< 20 MB RAM", Icon: Cpu },
  { k: "Your control", v: "Unused bandwidth", Icon: SlidersHorizontal },
  { k: "Payout", v: "USDC rewards", Icon: Coins },
];

const METRICS = [
  { label: "node_status", value: "online", accent: "text-emerald-400" },
  { label: "p50_latency", value: "12ms", accent: "text-sky-300" },
  { label: "shared_today", value: "2.4 GB", accent: "text-white" },
  { label: "requests_hr", value: "1,847", accent: "text-white" },
  { label: "earnings_24h", value: "$0.42", accent: "text-amber-300" },
];

export function NodeExplainer() {
  return (
    <section
      id="how-it-works"
      className="relative h-dvh flex items-center overflow-hidden bg-neutral-950"
    >
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20 lg:py-0 h-full lg:h-auto grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-16 items-center content-center [@media(max-height:700px)]:py-12 [@media(max-height:700px)]:gap-4">
        {/* Copy */}
        <div className="order-2 lg:order-1 min-w-0">
          <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-2 sm:mb-4 [@media(max-height:700px)]:mb-2">
            // bandwidth_sharing_node
          </p>
          <h2
            className="text-white leading-tight mb-3 sm:mb-6 [@media(max-height:700px)]:mb-2"
            style={{
              fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
              fontSize: "clamp(1.35rem, 3.5vw + 0.5rem, 2.75rem)",
            }}
          >
            A node on your machine, routing traffic you don&apos;t use.
          </h2>
          <div className="space-y-2.5 sm:space-y-4 text-neutral-400 text-xs sm:text-sm lg:text-base leading-relaxed">
            <p>
              Turbo runs a lightweight client on your computer. When your
              connection is idle, it serves small, encrypted requests for
              research and monitoring workloads — the same kind of traffic that keeps
              the internet fast at the edge.
            </p>
            <p className="hidden sm:block [@media(max-height:700px)]:hidden">
              Turbo does not access your personal data, it only uses bandwidth you wouldn&apos;t have consumed. Earnings scale with uptime, latency, and
              how much you share.
            </p>
          </div>

          <dl className="mt-4 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-4 [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:gap-2">
            {SPECS.map(({ k, v, Icon }) => (
              <div
                key={k}
                className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2 sm:px-4 sm:py-3 [@media(max-height:700px)]:py-1.5"
              >
                <dt className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 sm:mb-1.5 flex items-center gap-1.5">
                  <Icon
                    className="w-3 h-3 shrink-0 text-neutral-600"
                    strokeWidth={1.5}
                  />
                  {k}
                </dt>
                <dd className="text-xs sm:text-sm font-medium text-neutral-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustration */}
        <div className="order-1 lg:order-2 relative w-full min-w-0">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50">
            <img
              src="/hero-powerlines.jpg"
              alt="Network infrastructure at sunset"
              className="w-full aspect-[16/9] sm:aspect-[4/3] max-h-[28dvh] sm:max-h-[36dvh] lg:max-h-none object-cover [@media(max-height:700px)]:max-h-[24dvh] [@media(max-height:700px)]:aspect-[2/1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/20" />

            {/* Developer-style metrics overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-auto sm:right-4 sm:w-64 rounded-lg border border-neutral-700/80 bg-neutral-950/85 backdrop-blur-md p-2.5 sm:p-4 font-mono text-[10px] sm:text-xs shadow-xl [@media(max-height:700px)]:p-2">
              <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-neutral-800 [@media(max-height:700px)]:mb-1.5 [@media(max-height:700px)]:pb-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-neutral-500 truncate">turbo-node — live</span>
              </div>
              <div className="space-y-1 sm:space-y-2">
                {METRICS.map(({ label, value, accent }, i) => (
                  <div
                    key={label}
                    className={`flex justify-between gap-4 ${i > 2 ? "hidden sm:flex" : ""} ${i > 1 ? "[@media(max-height:700px)]:hidden" : ""}`}
                  >
                    <span className="text-neutral-500">{label}</span>
                    <span className={accent}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-neutral-800 text-neutral-600 hidden sm:block [@media(max-height:700px)]:hidden">
                <span className="text-emerald-500/80">▸</span> routing idle
                bandwidth…
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
