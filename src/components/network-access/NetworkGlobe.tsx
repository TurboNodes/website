import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  NetworkGlobeScene,
  type GlobeHoverHandler,
} from "./NetworkGlobeScene";
import { PROXY_HUBS, type ProxyHub } from "./networkGlobeData";
import {
  measureHubLatencies,
  type HubLatencies,
} from "./hubLatency";
import styles from "./network-globe.module.css";

type HubHover = {
  hub: ProxyHub;
  x: number;
  y: number;
};

class GlobeErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <div className={styles.fallback} aria-hidden />
    ) : (
      this.props.children
    );
  }
}

const PRESSURE_CLASS = {
  Low: styles.pressureLow,
  Medium: styles.pressureMedium,
  High: styles.pressureHigh,
} as const;

const EMPTY_LATENCIES: HubLatencies = { us: null, eu: null, sg: null };

function formatLatency(ms: number | null) {
  return ms == null ? "N/A" : `${ms} ms`;
}

function latencyTone(ms: number | null) {
  if (ms == null) return undefined;
  if (ms < 50) return styles.latencyFast;
  if (ms < 120) return styles.latencyMid;
  return styles.latencySlow;
}

function HubCard({
  hover,
  latencyMs,
}: {
  hover: HubHover;
  latencyMs: number | null;
}) {
  return (
    <div
      className={styles.hubCard}
      style={{ transform: `translate(${hover.x}px, ${hover.y}px)` }}
      role="status"
    >
      <div className={styles.hubCardHeader}>
        <span className={styles.hubCode}>{hover.hub.code}</span>
        <span className={styles.hubStatus}>● ONLINE</span>
      </div>
      <p className={styles.hubCity}>{hover.hub.city}</p>
      <p className={styles.hubAws}>{hover.hub.awsRegion}</p>

      <dl className={styles.hubMetrics}>
        <div>
          <dt>Ping</dt>
          <dd className={latencyTone(latencyMs)}>{formatLatency(latencyMs)}</dd>
        </div>
        <div>
          <dt>Load</dt>
          <dd className={PRESSURE_CLASS[hover.hub.pressure]}>
            {hover.hub.pressure}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function LatencyStrip({ latencies }: { latencies: HubLatencies }) {
  const measured = PROXY_HUBS.map((hub) => latencies[hub.id]).filter(
    (ms): ms is number => ms != null,
  );
  const best = measured.length ? Math.min(...measured) : null;

  return (
    <div
      className={styles.latencyStrip}
      aria-label="Server latency from your location"
    >
      {PROXY_HUBS.map((hub) => {
        const ms = latencies[hub.id];
        return (
          <div
            key={hub.id}
            className={`${styles.latencyChip} ${ms != null && ms === best ? styles.latencyChipBest : ""}`}
          >
            <span className={styles.latencyChipRegion}>{hub.awsRegion}</span>
            <span className={`${styles.latencyChipValue} ${latencyTone(ms) ?? ""}`}>
              {ms == null ? (
                "N/A"
              ) : (
                <>
                  {ms}
                  <em>ms</em>
                </>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function NetworkGlobe() {
  const shell = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HubHover | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [latencies, setLatencies] = useState<HubLatencies>(EMPTY_LATENCIES);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    measureHubLatencies(controller.signal).then((next) => {
      if (!controller.signal.aborted) setLatencies(next);
    });
    return () => controller.abort();
  }, []);

  const updateHover: GlobeHoverHandler = (hub, event) => {
    if (!hub || !event || !shell.current) {
      setHover(null);
      return;
    }
    const bounds = shell.current.getBoundingClientRect();
    const cardWidth = 158;
    const x = Math.min(
      event.nativeEvent.clientX - bounds.left + 14,
      bounds.width - cardWidth - 10,
    );
    const y = Math.max(12, event.nativeEvent.clientY - bounds.top - 12);
    setHover({ hub, x: Math.max(10, x), y });
  };

  return (
    <div ref={shell} className={styles.globeShell}>
      <GlobeErrorBoundary>
        <div className={styles.canvas}>
          <Canvas camera={{ position: [0, 0, 5.15], fov: 39 }} dpr={[1, 1.75]}>
            <ambientLight intensity={1.8} />
            <directionalLight position={[4, 5, 6]} intensity={2.2} />
            <directionalLight
              position={[-4, -1, 2]}
              intensity={0.7}
              color="#aec5f4"
            />
            <NetworkGlobeScene
              reducedMotion={reducedMotion}
              hoveredHub={hover?.hub.id ?? null}
              onHover={updateHover}
            />
          </Canvas>
        </div>
      </GlobeErrorBoundary>

      {hover && (
        <HubCard hover={hover} latencyMs={latencies[hover.hub.id]} />
      )}

      <LatencyStrip latencies={latencies} />
    </div>
  );
}
