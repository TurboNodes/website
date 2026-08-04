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
    { provider: "NetNut", ms: 95 },
    { provider: "SOAX", ms: 140 },
    { provider: "Oxylabs", ms: 165 },
    { provider: "Decodo", ms: 185 },
    { provider: "Evomi", ms: 210 },
    { provider: "Bright Data", ms: 240 },
  ],
  eu: [
    { provider: "Turbo", ms: 38, highlight: true },
    { provider: "NetNut", ms: 110 },
    { provider: "Oxylabs", ms: 175 },
    { provider: "SOAX", ms: 190 },
    { provider: "Decodo", ms: 205 },
    { provider: "Evomi", ms: 230 },
    { provider: "Bright Data", ms: 260 },
  ],
  apac: [
    { provider: "Turbo", ms: 48, highlight: true },
    { provider: "NetNut", ms: 145 },
    { provider: "Oxylabs", ms: 220 },
    { provider: "SOAX", ms: 250 },
    { provider: "Decodo", ms: 270 },
    { provider: "Evomi", ms: 295 },
    { provider: "Bright Data", ms: 320 },
  ],
};
