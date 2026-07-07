import type { Connector } from "wagmi";

const UNIVERSAL_CONNECTOR_IDS = new Set(["metaMask", "coinbaseWallet", "walletConnect"]);

function connectorKey(connector: Connector): string {
  if (typeof connector.rdns === "string") return connector.rdns;
  if (Array.isArray(connector.rdns) && connector.rdns[0]) {
    return connector.rdns[0];
  }
  return connector.id;
}

function connectorLabel(connector: Connector): string {
  return `${connector.id}:${connector.name}:${connectorKey(connector)}`.toLowerCase();
}

function isMetaMaskConnector(connector: Connector): boolean {
  const label = connectorLabel(connector);
  return (
    connector.id === "metaMask" ||
    label.includes("metamask") ||
    label.includes("io.metamask")
  );
}

function isCoinbaseConnector(connector: Connector): boolean {
  const label = connectorLabel(connector);
  return (
    connector.id === "coinbaseWallet" ||
    label.includes("coinbase") ||
    label.includes("com.coinbase")
  );
}

function isInjectedConnector(connector: Connector): boolean {
  return connector.type === "injected" || connector.id === "injected";
}

/** Prefer EIP-6963 wallet entries over generic SDK duplicates. */
export function dedupeConnectors(connectors: readonly Connector[]): Connector[] {
  const byKey = new Map<string, Connector>();
  let hasInstalledMetaMask = false;
  let hasInstalledCoinbase = false;

  for (const connector of connectors) {
    if (isMetaMaskConnector(connector) && !UNIVERSAL_CONNECTOR_IDS.has(connector.id)) {
      hasInstalledMetaMask = true;
    }
    if (isCoinbaseConnector(connector) && !UNIVERSAL_CONNECTOR_IDS.has(connector.id)) {
      hasInstalledCoinbase = true;
    }

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

  const result = Array.from(byKey.values()).filter((connector) => {
    if (hasInstalledMetaMask && connector.id === "metaMask") return false;
    if (hasInstalledCoinbase && connector.id === "coinbaseWallet") return false;
    return true;
  });

  const hasNamedWallets = result.some((connector) => connector.id !== "injected");
  const filtered = hasNamedWallets
    ? result.filter((connector) => connector.id !== "injected")
    : result;

  return sortConnectors(filtered);
}

/** Installed extensions first, then universal SDK / WalletConnect options. */
export function sortConnectors(connectors: readonly Connector[]): Connector[] {
  return [...connectors].sort((left, right) => {
    const leftUniversal = UNIVERSAL_CONNECTOR_IDS.has(left.id);
    const rightUniversal = UNIVERSAL_CONNECTOR_IDS.has(right.id);
    if (leftUniversal !== rightUniversal) {
      return leftUniversal ? 1 : -1;
    }

    const leftInjected = isInjectedConnector(left);
    const rightInjected = isInjectedConnector(right);
    if (leftInjected !== rightInjected) {
      return leftInjected ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}
