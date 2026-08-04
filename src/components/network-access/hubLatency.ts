import type { ProxyHub } from "./networkGlobeData";

export type HubId = ProxyHub["id"];

export type HubLatencies = Record<HubId, number | null>;

/** Single domain: AWS DynamoDB /ping (cloudping.info). */
const HUB_ENDPOINTS: Record<HubId, string> = {
  us: "https://dynamodb.us-east-1.amazonaws.com/ping",
  eu: "https://dynamodb.eu-central-1.amazonaws.com/ping",
  sg: "https://dynamodb.ap-southeast-1.amazonaws.com/ping",
};

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function fetchOnce(url: string, signal: AbortSignal) {
  try {
    await fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "manual",
      signal,
    });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    // CORS TypeError still means the round-trip completed.
    return error instanceof TypeError;
  }
}

async function pingEndpoint(url: string, parentSignal?: AbortSignal) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4000);
  const onAbort = () => controller.abort();
  parentSignal?.addEventListener("abort", onAbort);

  try {
    const warmed = await fetchOnce(url, controller.signal);
    if (!warmed) return null;

    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const ok = await fetchOnce(`${url}?t=${Date.now()}-${i}`, controller.signal);
      if (!ok) continue;
      samples.push(performance.now() - start);
    }
    if (!samples.length) return null;
    return Math.max(1, Math.round(median(samples)));
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
    parentSignal?.removeEventListener("abort", onAbort);
  }
}

export async function measureHubLatencies(
  signal?: AbortSignal,
): Promise<HubLatencies> {
  const empty: HubLatencies = { us: null, eu: null, sg: null };
  if (typeof fetch === "undefined" || typeof performance === "undefined") {
    return empty;
  }

  const hubs = Object.keys(HUB_ENDPOINTS) as HubId[];
  const measured = await Promise.all(
    hubs.map(async (id) => {
      if (signal?.aborted) return [id, null] as const;
      return [id, await pingEndpoint(HUB_ENDPOINTS[id], signal)] as const;
    }),
  );

  return Object.fromEntries(measured) as HubLatencies;
}
