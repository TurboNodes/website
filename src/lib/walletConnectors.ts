import type { Connector } from "wagmi";

function connectorKey(connector: Connector): string {
  if (typeof connector.rdns === "string") return connector.rdns;
  if (Array.isArray(connector.rdns) && connector.rdns[0]) {
    return connector.rdns[0];
  }
  return connector.id;
}

/** Prefer EIP-6963 wallet entries over the generic injected connector. */
export function dedupeConnectors(connectors: readonly Connector[]): Connector[] {
  const byKey = new Map<string, Connector>();

  for (const connector of connectors) {
    const key = connectorKey(connector);
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, connector);
      continue;
    }

    if (existing.id === "injected" && connector.id !== "injected") {
      byKey.set(key, connector);
    }
  }

  const result = Array.from(byKey.values());
  const hasNamedWallets = result.some((connector) => connector.id !== "injected");
  return hasNamedWallets
    ? result.filter((connector) => connector.id !== "injected")
    : result;
}
