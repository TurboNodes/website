import { isAddress } from "viem";

export type PayoutChain = "sol" | "base" | "eth";

export interface ChainWallet {
  address: string;
  source: "connected" | "manual";
  linkedAt: string;
}

export interface PayoutPreferences {
  payoutWallets?: Partial<Record<PayoutChain, ChainWallet>>;
  payoutWallet?: string;
  walletSource?: "connected" | "manual";
  walletLinkedAt?: string;
}

export const PAYOUT_CHAINS: {
  id: PayoutChain;
  /** Ticker-style shorthand (network name, not the payout token). */
  shortLabel: string;
  /** Full chain name for display. */
  chainName: string;
  addressType: "evm" | "solana";
  placeholder: string;
}[] = [
  {
    id: "eth",
    shortLabel: "ETH",
    chainName: "Ethereum",
    addressType: "evm",
    placeholder: "0x…",
  },
  {
    id: "base",
    shortLabel: "BASE",
    chainName: "Base",
    addressType: "evm",
    placeholder: "0x…",
  },
  {
    id: "sol",
    shortLabel: "SOL",
    chainName: "Solana",
    addressType: "solana",
    placeholder: "Solana address…",
  },
];

export const REWARD_TOKEN = "USDC";

export function getChainConfig(chain: PayoutChain) {
  return PAYOUT_CHAINS.find((c) => c.id === chain)!;
}

/** e.g. "USDC on Ethereum" */
export function formatUsdcOnChain(chain: PayoutChain): string {
  return `${getChainConfig(chain).chainName}`;
}

export function isSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function validateWalletAddress(
  address: string,
  chain: PayoutChain,
): string | null {
  const trimmed = address.trim();
  const config = PAYOUT_CHAINS.find((c) => c.id === chain)!;

  if (config.addressType === "evm") {
    if (!isAddress(trimmed)) return "Enter a valid EVM address (0x…).";
    return null;
  }

  if (!isSolanaAddress(trimmed)) {
    return "Enter a valid Solana address.";
  }
  return null;
}

/** Merge legacy single-wallet prefs into per-chain map. */
export function getPayoutWallets(
  preferences: PayoutPreferences,
): Partial<Record<PayoutChain, ChainWallet>> {
  const wallets: Partial<Record<PayoutChain, ChainWallet>> = {
    ...(preferences.payoutWallets ?? {}),
  };

  if (!wallets.eth && preferences.payoutWallet) {
    wallets.eth = {
      address: preferences.payoutWallet,
      source: preferences.walletSource ?? "manual",
      linkedAt: preferences.walletLinkedAt ?? "",
    };
  }

  return wallets;
}

export function getPayoutWalletForChain(
  preferences: PayoutPreferences,
  chain: PayoutChain,
): ChainWallet | undefined {
  return getPayoutWallets(preferences)[chain];
}

export function getPrimaryPayoutWallet(
  preferences: PayoutPreferences,
): { chain: PayoutChain; wallet: ChainWallet } | null {
  const wallets = getPayoutWallets(preferences);
  for (const { id } of PAYOUT_CHAINS) {
    const wallet = wallets[id];
    if (wallet) return { chain: id, wallet };
  }
  return null;
}

export function truncateAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
