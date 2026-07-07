import {
  type WalletAdapter,
  WalletAdapterNetwork,
  WalletReadyState,
  isWalletAdapterCompatibleStandardWallet,
} from "@solana/wallet-adapter-base";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import { StandardWalletAdapter } from "@solana/wallet-standard-wallet-adapter-base";
import { getWallets } from "@wallet-standard/app";
import type { Wallet } from "@wallet-standard/base";

export interface SolanaWalletOption {
  id: string;
  name: string;
  adapter: WalletAdapter;
  readyState: WalletReadyState;
}

const READY_STATE_ORDER: Record<WalletReadyState, number> = {
  [WalletReadyState.Installed]: 0,
  [WalletReadyState.Loadable]: 1,
  [WalletReadyState.NotDetected]: 2,
  [WalletReadyState.Unsupported]: 3,
};

export function wrapStandardWallets(wallets: readonly Wallet[]): StandardWalletAdapter[] {
  return wallets
    .filter(isWalletAdapterCompatibleStandardWallet)
    .map((wallet) => new StandardWalletAdapter({ wallet }));
}

/** Wallets announced via the Wallet Standard (Phantom, Backpack, etc.). */
export function discoverStandardWalletAdapters(): StandardWalletAdapter[] {
  if (typeof window === "undefined") return [];
  return wrapStandardWallets(getWallets().get());
}

/** Universal Solana connector for mobile / no-extension users (not a brand list). */
export function createUniversalSolanaAdapters(): WalletAdapter[] {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!projectId) return [];

  return [
    new WalletConnectWalletAdapter({
      network: WalletAdapterNetwork.Mainnet,
      options: { projectId },
    }),
  ];
}

export function adaptersToSolanaOptions(adapters: readonly WalletAdapter[]): SolanaWalletOption[] {
  const seen = new Set<string>();
  const options: SolanaWalletOption[] = [];

  for (const adapter of adapters) {
    if (adapter.readyState === WalletReadyState.Unsupported) continue;

    const id = String(adapter.name);
    if (seen.has(id)) continue;
    seen.add(id);

    options.push({
      id,
      name: String(adapter.name),
      adapter,
      readyState: adapter.readyState,
    });
  }

  return options.sort((left, right) => {
    const readyDiff = READY_STATE_ORDER[left.readyState] - READY_STATE_ORDER[right.readyState];
    return readyDiff !== 0 ? readyDiff : left.name.localeCompare(right.name);
  });
}
