import { useId, useMemo, useState } from "react";
import {
  LATENCY_BENCHMARKS,
  REGION_LABELS,
  type RegionId,
} from "./benchmarkData";
import styles from "./network-access.module.css";

const REGIONS: RegionId[] = ["na", "eu", "apac"];

export function LatencyBenchmarks() {
  const [region, setRegion] = useState<RegionId>("na");
  const baseId = useId();
  const entries = LATENCY_BENCHMARKS[region];

  const { scale, speedup } = useMemo(() => {
    const slowest = Math.max(...entries.map((entry) => entry.ms));
    const turbo = entries.find((entry) => entry.highlight);
    const nextBest = Math.min(
      ...entries.filter((entry) => !entry.highlight).map((entry) => entry.ms),
    );
    return {
      scale: slowest * 1.08,
      speedup: turbo ? (nextBest / turbo.ms).toFixed(1) : null,
    };
  }, [entries]);

  return (
    <div className={styles.benchmarkPanel}>
      <div className={styles.benchmarkHeader}>
        <div
          className={styles.segmented}
          role="tablist"
          aria-label="Benchmark region"
        >
          {REGIONS.map((id) => {
            const selected = region === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                className={selected ? styles.segmentedActive : styles.segmentedBtn}
                onClick={() => setRegion(id)}
              >
                {REGION_LABELS[id]}
              </button>
            );
          })}
        </div>
        {speedup && (
          <p className={styles.benchmarkDelta}>
            {speedup}× faster than the next-best provider
          </p>
        )}
      </div>

      <ul
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${region}`}
        className={styles.barList}
      >
        {entries.map((entry) => (
          <li key={`${region}-${entry.provider}`} className={styles.barRow}>
            <span
              className={entry.highlight ? styles.barLabelAccent : styles.barLabel}
            >
              {entry.provider}
            </span>
            <div
              className={styles.barTrack}
              role="img"
              aria-label={`${entry.provider}: ${entry.ms} milliseconds median latency`}
            >
              <div
                className={entry.highlight ? styles.barFillAccent : styles.barFill}
                style={{ width: `${(entry.ms / scale) * 100}%` }}
              />
            </div>
            <span
              aria-hidden
              className={entry.highlight ? styles.barValueAccent : styles.barValue}
            >
              {entry.ms}
              <span className={styles.barUnit}>ms</span>
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.benchmarkNote}>
        Median (p50) latency in {REGION_LABELS[region]}, lower is better.
        Illustrative figures from internal monitoring tools.
      </p>
    </div>
  );
}
