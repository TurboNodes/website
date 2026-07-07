import type { User } from "@supabase/supabase-js";
import type { EthereumWallet } from "@supabase/auth-js";
import type { Connector } from "wagmi";
import { getAddress, UserRejectedRequestError, type Hex } from "viem";
import { mainnet } from "wagmi/chains";
import { truncateAddress } from "@/lib/payoutChains";

export const WEB3_AUTH_STATEMENT =
  "I accept the Turbo Terms of Service at https://turbo.network";

type ConnectAsync = (variables: {
  connector: Connector;
  chainId?: number;
}) => Promise<{ accounts: readonly string[]; chainId: number }>;

interface SiweMessageInput {
  address: `0x${string}`;
  chainId: number;
  domain: string;
  uri: string;
  statement?: string;
  version: "1";
  issuedAt?: Date;
}

function normalizeEthAddress(address: string): `0x${string}` {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  // Use checksum format. Phantom validates the SIWE address line against the
  // active account string very strictly.
  return getAddress(address) as `0x${string}`;
}

function encodeMessageForPersonalSign(message: string): Hex {
  const bytes = new TextEncoder().encode(message);
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}

function generateNonce(length = 10): string {
  // SIWE requires at least 8 chars; wallets like Phantom can be strict.
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/** EIP-4361 message compatible with Supabase Auth. */
function createSiweMessage(parameters: SiweMessageInput): string {
  const {
    chainId,
    domain,
    issuedAt = new Date(),
    statement,
    uri,
    version,
  } = parameters;

  const address = normalizeEthAddress(parameters.address);
  const statementLine = statement ? `${statement}\n` : "";
  const prefix = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\n${statementLine}`;
  const suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${generateNonce()}\nIssued At: ${issuedAt.toISOString()}`;

  // Critical: SIWE format expects a newline between statement and URI block.
  return `${prefix}\n${suffix}`;
}

function resolveEthereumWallet(provider: unknown): EthereumWallet | null {
  if (!provider || typeof provider !== "object") return null;

  const candidate = provider as { request?: unknown; provider?: unknown };
  if (typeof candidate.request === "function") {
    return provider as EthereumWallet;
  }

  if (
    candidate.provider &&
    typeof candidate.provider === "object" &&
    typeof (candidate.provider as { request?: unknown }).request === "function"
  ) {
    return candidate.provider as EthereumWallet;
  }

  return null;
}

export class WalletAuthAbortedError extends Error {
  constructor() {
    super("Connection cancelled.");
    this.name = "WalletAuthAbortedError";
  }
}

export function formatWeb3AuthError(error: unknown, fallback: string): string {
  if (error instanceof WalletAuthAbortedError || error instanceof UserRejectedRequestError) {
    return "Connection cancelled.";
  }

  // Wallet adapters often reject with plain objects (not `Error` instances).
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; code?: unknown; error?: unknown };
    const code =
      typeof maybe.code === "number" || typeof maybe.code === "string" ? String(maybe.code) : "";
    const msg =
      typeof maybe.message === "string"
        ? maybe.message.toLowerCase()
        : typeof maybe.error === "string"
          ? maybe.error.toLowerCase()
          : "";

    // EIP-1193 user rejected = 4001. Phantom (Solana/EVM) frequently uses this.
    if (code === "4001") return "Connection cancelled.";

    if (
      msg &&
      (msg.includes("user rejected") ||
        msg.includes("user rejected the request") ||
        msg.includes("rejected the request") ||
        msg.includes("request rejected") ||
        msg.includes("user cancelled") ||
        msg.includes("canceled") ||
        msg.includes("cancelled"))
    ) {
      return "Connection cancelled.";
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("user rejected") ||
      msg.includes("user rejected the request") ||
      msg.includes("rejected the request") ||
      msg.includes("request rejected") ||
      msg.includes("user cancelled") ||
      msg.includes("canceled") ||
      msg.includes("cancelled")
    ) {
      return "Connection cancelled.";
    }
    return error.message;
  }

  return fallback;
}

export function isWeb3AuthCancellationError(error: unknown): boolean {
  if (error instanceof WalletAuthAbortedError) return true;
  return formatWeb3AuthError(error, "") === "Connection cancelled.";
}

let web3CancellationGuardInstalled = false;

/** Prevent Phantom/wallet rejections from triggering Next.js runtime overlays. */
export function ensureWeb3CancellationGuard(): void {
  if (web3CancellationGuardInstalled || typeof window === "undefined") return;
  web3CancellationGuardInstalled = true;

  window.addEventListener("unhandledrejection", (event) => {
    if (isWeb3AuthCancellationError(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener("error", (event) => {
    if (isWeb3AuthCancellationError(event.error)) {
      event.preventDefault();
    }
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new WalletAuthAbortedError();
  }
}

type SolanaWalletLike = {
  signIn?: (input: Record<string, unknown>) => Promise<unknown>;
  connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<unknown>;
  signMessage?: (
    message: Uint8Array,
    encoding?: string,
  ) => Promise<Uint8Array | { signature: Uint8Array } | undefined>;
  publicKey?: { toBase58: () => string } | null;
};

function parseSolanaSignInOutput(
  output: unknown,
): { message: string; signature: Uint8Array } {
  let item: unknown = output;
  if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
    item = output[0];
  }

  if (!item || typeof item !== "object") {
    throw new Error("Wallet sign-in returned an unrecognized value.");
  }

  const { signedMessage, signature } = item as {
    signedMessage?: string | Uint8Array;
    signature?: Uint8Array;
  };

  if (
    !signedMessage ||
    !(signature instanceof Uint8Array) ||
    (typeof signedMessage !== "string" && !(signedMessage instanceof Uint8Array))
  ) {
    throw new Error("Wallet sign-in did not return a message and signature.");
  }

  const message =
    typeof signedMessage === "string"
      ? signedMessage
      : new TextDecoder().decode(signedMessage);

  return { message, signature };
}

function buildSolanaSignInMessage(host: string, address: string, statement: string, uri: string): string {
  return [
    `${host} wants you to sign in with your Solana account:`,
    address,
    "",
    statement,
    "",
    "Version: 1",
    `URI: ${uri}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");
}

/** Connect + sign SIWS, returning credentials for Supabase Web3 auth. */
export async function authenticateWithSolanaWallet(
  wallet: unknown,
  options?: { statement?: string; signal?: AbortSignal },
): Promise<{ message: string; signature: Uint8Array }> {
  throwIfAborted(options?.signal);

  const resolved = wallet as SolanaWalletLike;
  if (!resolved || typeof resolved !== "object") {
    throw new Error("Could not connect to Solana wallet.");
  }

  const statement = options?.statement ?? WEB3_AUTH_STATEMENT;
  const url = new URL(window.location.href);

  if (typeof resolved.signIn === "function") {
    try {
      const output = await resolved.signIn({
        issuedAt: new Date().toISOString(),
        version: "1",
        domain: url.host,
        uri: url.href,
        statement,
      });
      throwIfAborted(options?.signal);
      return parseSolanaSignInOutput(output);
    } catch (err) {
      throwIfAborted(options?.signal);
      throw new Error(formatWeb3AuthError(err, "Failed to sign in with Solana wallet."));
    }
  }

  if (typeof resolved.connect === "function" && !resolved.publicKey) {
    try {
      await resolved.connect();
    } catch (err) {
      throw new Error(formatWeb3AuthError(err, "Failed to connect Solana wallet."));
    }
  }

  throwIfAborted(options?.signal);

  if (
    !resolved.publicKey ||
    typeof resolved.publicKey.toBase58 !== "function" ||
    typeof resolved.signMessage !== "function"
  ) {
    throw new Error("Wallet does not support Solana sign-in.");
  }

  const message = buildSolanaSignInMessage(
    url.host,
    resolved.publicKey.toBase58(),
    statement,
    url.href,
  );

  try {
    const result = await resolved.signMessage(new TextEncoder().encode(message), "utf8");
    throwIfAborted(options?.signal);

    const signature =
      result instanceof Uint8Array ? result : result && "signature" in result ? result.signature : null;

    if (!signature || !(signature instanceof Uint8Array)) {
      throw new Error("Wallet returned an invalid signature.");
    }

    return { message, signature };
  } catch (err) {
    throwIfAborted(options?.signal);
    throw new Error(formatWeb3AuthError(err, "Failed to sign in with Solana wallet."));
  }
}

/** Connect via wagmi, sign SIWE, and return credentials for Supabase Web3 auth. */
export async function authenticateWithEthereumConnector(
  connector: Connector,
  connectAsync: ConnectAsync,
): Promise<{ message: string; signature: Hex }> {
  const provider = resolveEthereumWallet(await connector.getProvider());
  if (!provider) {
    throw new Error(`Could not connect to ${connector.name}.`);
  }

  let address: string | undefined;
  let chainId: number | undefined;

  try {
    // Prefer wagmi's connect flow (it handles user prompts & WalletConnect QR).
    const connection = await connectAsync({ connector, chainId: mainnet.id });
    address = connection.accounts[0];
    chainId = connection.chainId;
  } catch (err) {
    // Some wallets (notably Phantom via EIP-6963) can already be connected.
    // In that case, calling connect again throws. Reuse the current provider session.
    const message = err instanceof Error ? err.message : String(err);
    if (!message.toLowerCase().includes("connector already connected")) {
      throw err;
    }

    const accounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];

    address = accounts?.[0];

    const chainIdHex = (await provider.request({
      method: "eth_chainId",
    })) as string;

    chainId = Number.parseInt(chainIdHex, 16);
  }

  if (!address || !chainId) {
    throw new Error("No accounts available. Please connect a wallet.");
  }

  const url = new URL(window.location.href);
  const message = createSiweMessage({
    domain: url.host,
    address: normalizeEthAddress(address),
    statement: WEB3_AUTH_STATEMENT,
    uri: url.href,
    version: "1",
    chainId,
  });

  let signature: Hex;
  try {
    // Some wallets (Phantom) are picky about the message encoding.
    signature = (await provider.request({
      method: "personal_sign",
      params: [message, address],
    })) as Hex;
  } catch {
    signature = (await provider.request({
      method: "personal_sign",
      params: [encodeMessageForPersonalSign(message), address],
    })) as Hex;
  }

  return { message, signature };
}


export function getWeb3WalletAddress(user: User | null | undefined): string | null {
  if (!user) return null;

  const web3Identity = user.identities?.find(
    (identity) =>
      identity.provider === "web3" ||
      identity.provider === "ethereum" ||
      identity.provider === "solana",
  );

  const identityAddress =
    typeof web3Identity?.identity_data?.sub === "string"
      ? web3Identity.identity_data.sub
      : typeof web3Identity?.identity_data?.address === "string"
        ? web3Identity.identity_data.address
        : null;

  if (identityAddress) return identityAddress;

  const email = user.email;
  if (email && !email.includes("@")) return email;

  return null;
}

export function isWeb3User(user: User | null | undefined): boolean {
  if (!user) return false;
  if (getWeb3WalletAddress(user)) return true;
  return !!user.identities?.some(
    (identity) =>
      identity.provider === "web3" ||
      identity.provider === "ethereum" ||
      identity.provider === "solana",
  );
}

export function getAuthDisplayName(user: User | null | undefined): string {
  if (!user) return "User";

  const metadataName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.preferred_username;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  const walletAddress = getWeb3WalletAddress(user);
  if (walletAddress) return truncateAddress(walletAddress);

  if (user.email?.includes("@")) {
    return user.email.split("@")[0] || "User";
  }

  return "User";
}

export function getAuthDisplaySubtitle(user: User | null | undefined): string | null {
  if (!user) return null;

  if (user.email?.includes("@") && !user.email.endsWith("@wallet.local")) {
    return user.email;
  }

  const walletAddress = getWeb3WalletAddress(user);
  if (walletAddress) return truncateAddress(walletAddress);

  return null;
}
