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
      className="relative min-h-dvh flex items-center bg-neutral-950"
    >
      <div className="w-full max-w-6xl mx-auto px-6 py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
            // bandwidth_sharing_node
          </p>
          <h2
            className="text-white leading-tight mb-6"
            style={{
              fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            }}
          >
            A node on your machine, routing traffic you don&apos;t use.
          </h2>
          <div className="space-y-4 text-neutral-400 text-sm sm:text-base leading-relaxed">
            <p>
              Turbo runs a lightweight client on your computer. When your
              connection is idle, it serves small, encrypted requests for
              research and monitoring workloads — the same kind of traffic that keeps
              the internet fast at the edge.
            </p>
            <p>
              Turbo does not access your personal data, it only uses bandwidth you wouldn't have consumed. Earnings scale with uptime, latency, and
              how much you share.
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4">
            {SPECS.map(({ k, v, Icon }) => (
              <div
                key={k}
                className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3"
              >
                <dt className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1.5">
                  <Icon
                    className="w-3 h-3 shrink-0 text-neutral-600"
                    strokeWidth={1.5}
                  />
                  {k}
                </dt>
                <dd className="text-sm font-medium text-neutral-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustration */}
        <div className="order-1 lg:order-2 relative">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50">
            <img
              src="/hero-sunset.jpg"
              alt="Network infrastructure at sunset"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/20" />

            {/* Developer-style metrics overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-64 rounded-lg border border-neutral-700/80 bg-neutral-950/85 backdrop-blur-md p-4 font-mono text-xs shadow-xl">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-neutral-500">turbo-node — live</span>
              </div>
              <div className="space-y-2">
                {METRICS.map(({ label, value, accent }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-neutral-500">{label}</span>
                    <span className={accent}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-800 text-neutral-600">
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
