export type RegionId = "na" | "eu" | "apac";

export type LatencyEntry = {
  provider: string;
  ms: number;
  highlight?: boolean;
};

export const REGION_LABELS: Record<RegionId, string> = {
  na: "North America",
  eu: "Europe",
  apac: "Asia-Pacific",
};

export const LATENCY_BENCHMARKS: Record<RegionId, LatencyEntry[]> = {
  na: [
    { provider: "Turbo", ms: 32, highlight: true },
    { provider: "Oxylabs", ms: 480 },
    { provider: "Evomi", ms: 510 },
    { provider: "Decodo", ms: 540 },
    { provider: "SOAX", ms: 580 },
    { provider: "Bright Data", ms: 650 },
  ],
  eu: [
    { provider: "Turbo", ms: 38, highlight: true },
    { provider: "Oxylabs", ms: 430 },
    { provider: "SOAX", ms: 480 },
    { provider: "Decodo", ms: 500 },
    { provider: "Evomi", ms: 520 },
    { provider: "Bright Data", ms: 600 },
  ],
  apac: [
    { provider: "Turbo", ms: 48, highlight: true },
    { provider: "Oxylabs", ms: 1400 },
    { provider: "Evomi", ms: 1550 },
    { provider: "Decodo", ms: 1650 },
    { provider: "Bright Data", ms: 1900 },
    { provider: "SOAX", ms: 2200 },
  ],
};
