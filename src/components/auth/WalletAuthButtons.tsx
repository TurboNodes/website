import { useCallback, useEffect, useRef, useState } from "react";
import type { Connector } from "wagmi";
import { useConnect } from "wagmi";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Loader2, Wallet, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSolanaWalletOptions } from "@/hooks/useSolanaWalletOptions";
import { useWalletConnectors } from "@/hooks/useWalletConnectors";
import { Web3Provider } from "@/components/providers/Web3Provider";
import {
  authenticateWithEthereumConnector,
  authenticateWithSolanaWallet,
  ensureWeb3CancellationGuard,
  formatWeb3AuthError,
  isWeb3AuthCancellationError,
  WEB3_AUTH_STATEMENT,
} from "@/lib/web3Auth";
import type { SolanaWalletOption } from "@/lib/solanaWallets";
import { cn } from "@/lib/utils";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out.`)), ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (err) => {
        clearTimeout(id);
        reject(err);
      },
    );
  });
}

interface WalletAuthButtonsProps {
  className?: string;
  layout?: "row" | "column";
  redirectTo?: string;
  /** Resolve an optional referral code immediately before wallet auth completes */
  onBeforeAuth?: () => Promise<string | null>;
}

function WalletAuthButtonsInner({
  className = "",
  layout = "column",
  redirectTo,
  onBeforeAuth,
}: WalletAuthButtonsProps) {
  const { signInWithWeb3Wallet, loading: authLoading, clearAuthError } = useAuth();
  const { connectAsync } = useConnect();
  const walletConnectors = useWalletConnectors();
  const solanaWallets = useSolanaWalletOptions();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const attemptRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    ensureWeb3CancellationGuard();
  }, []);

  const abortCurrentAttempt = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    attemptRef.current += 1;
    clearAuthError();
    setPendingId(null);
    setLocalError(null);
    setOpen(false);
  }, [clearAuthError]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (pendingId) {
        abortCurrentAttempt();
      } else {
        setOpen(false);
        setLocalError(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, pendingId, abortCurrentAttempt]);

  const hasWallets = walletConnectors.length > 0 || solanaWallets.length > 0;
  const isBusy = authLoading || !!pendingId;

  const runSafely = (fn: () => Promise<void>, fallback: string) => {
    const attemptAtStart = attemptRef.current;
    void fn().catch((err) => {
      if (attemptAtStart !== attemptRef.current) return;
      setPendingId(null);
      if (isWeb3AuthCancellationError(err)) return;
      setLocalError(formatWeb3AuthError(err, fallback));
    });
  };

  const handleEthereumSignIn = async (connector: Connector) => {
    if (isBusy) return;

    const attempt = ++attemptRef.current;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLocalError(null);
    setPendingId(`ethereum:${connector.id}`);

    try {
      const { message, signature } = await authenticateWithEthereumConnector(
        connector,
        connectAsync,
      );

      if (attempt !== attemptRef.current) return;
      const refCode = (await onBeforeAuth?.()) ?? undefined;
      if (attempt !== attemptRef.current) return;
      await signInWithWeb3Wallet("ethereum", {
        message,
        signature,
        redirectTo,
        refCode,
      });
      if (attempt !== attemptRef.current) return;
      setOpen(false);
    } catch (err) {
      if (attempt !== attemptRef.current) return;
      if (!isWeb3AuthCancellationError(err)) {
        setLocalError(formatWeb3AuthError(err, "Failed to sign in with Ethereum wallet."));
      }
    } finally {
      if (attempt === attemptRef.current) {
        setPendingId(null);
        abortRef.current = null;
      }
    }
  };

  const handleSolanaSignIn = async (walletOption: SolanaWalletOption) => {
    if (isBusy) return;

    const attempt = ++attemptRef.current;
    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    setLocalError(null);
    setPendingId(`solana:${walletOption.id}`);

    try {
      const { message, signature } = await withTimeout(
        authenticateWithSolanaWallet(walletOption.adapter, {
          statement: WEB3_AUTH_STATEMENT,
          signal: abortController.signal,
        }),
        30000,
        "Wallet sign-in",
      );

      if (attempt !== attemptRef.current) return;

      const refCode = (await onBeforeAuth?.()) ?? undefined;
      if (attempt !== attemptRef.current) return;

      await signInWithWeb3Wallet("solana", {
        message,
        signature,
        redirectTo,
        refCode,
      });

      if (attempt !== attemptRef.current) return;
      setOpen(false);
    } catch (err) {
      if (attempt !== attemptRef.current) return;
      if (!isWeb3AuthCancellationError(err)) {
        setLocalError(formatWeb3AuthError(err, "Failed to sign in with Solana wallet."));
      }
    } finally {
      if (attempt === attemptRef.current) {
        setPendingId(null);
        abortRef.current = null;
      }
    }
  };

  const openModal = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    attemptRef.current += 1;
    clearAuthError();
    setPendingId(null);
    setLocalError(null);
    setOpen(true);
  };

  const closeModal = () => {
    if (pendingId) {
      abortCurrentAttempt();
      return;
    }
    setOpen(false);
    setLocalError(null);
    clearAuthError();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={cn(
          "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.97]",
          "border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-200",
          layout === "column" && "w-full",
          className,
        )}
      >
        <Wallet className="w-4 h-4" />
        Continue with Web3 Wallet
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-auth-title"
            className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-5 py-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400/90 mb-1">
                  // web3_wallet
                </p>
                <h2 id="wallet-auth-title" className="text-lg font-semibold text-white">
                  Choose a wallet
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Sign in with Ethereum or Solana.
                </p>
              </div>
              <button
                type="button"
                onClick={() => (pendingId ? abortCurrentAttempt() : closeModal())}
                className="cursor-default text-neutral-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[min(24rem,60vh)] overflow-y-auto px-3 py-3">
              {!hasWallets ? (
                <p className="px-2 py-6 text-sm text-neutral-400 text-center leading-relaxed">
                  Wallet options are still loading. Refresh the page or try again
                  in a moment.
                </p>
              ) : (
                <div className="space-y-4">
                  {walletConnectors.length > 0 && (
                    <div>
                      <p className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        ethereum
                      </p>
                      <div className="space-y-1">
                        {walletConnectors.map((connector) => {
                          const pending = pendingId === `ethereum:${connector.id}`;
                          return (
                            <button
                              key={connector.id}
                              type="button"
                              onClick={() =>
                                runSafely(
                                  () => handleEthereumSignIn(connector),
                                  "Failed to sign in with Ethereum wallet.",
                                )
                              }
                              disabled={isBusy}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-200 transition-colors",
                                "hover:bg-neutral-800/80 disabled:opacity-60 disabled:cursor-not-allowed",
                              )}
                            >
                              {pending ? (
                                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-orange-400" />
                              ) : (
                                <Wallet className="w-4 h-4 shrink-0 text-orange-400/80" />
                              )}
                              <span className="font-medium">{connector.name}</span>
                              {connector.id === "walletConnect" && (
                                <span className="ml-auto text-[10px] text-neutral-500">
                                  mobile &amp; desktop
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {walletConnectors.length > 0 && solanaWallets.length > 0 && (
                    <div className="border-t border-neutral-800" />
                  )}

                  {solanaWallets.length > 0 && (
                    <div>
                      <p className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        solana
                      </p>
                      <div className="space-y-1">
                        {solanaWallets.map((walletOption) => {
                          const pending = pendingId === `solana:${walletOption.id}`;
                          return (
                            <button
                              key={walletOption.id}
                              type="button"
                              onClick={() =>
                                runSafely(
                                  () => handleSolanaSignIn(walletOption),
                                  "Failed to sign in with Solana wallet.",
                                )
                              }
                              disabled={isBusy}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-neutral-200 transition-colors",
                                "hover:bg-neutral-800/80 disabled:opacity-60 disabled:cursor-not-allowed",
                              )}
                            >
                              {pending ? (
                                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-orange-400" />
                              ) : (
                                <Wallet className="w-4 h-4 shrink-0 text-orange-400/80" />
                              )}
                              <span className="font-medium">{walletOption.name}</span>
                              {walletOption.readyState === WalletReadyState.NotDetected && (
                                <span className="ml-auto text-[10px] text-neutral-500">
                                  install
                                </span>
                              )}
                              {walletOption.readyState === WalletReadyState.Loadable && (
                                <span className="ml-auto text-[10px] text-neutral-500">
                                  scan QR
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {localError && (
              <div className="border-t border-neutral-800 px-5 py-3">
                <p className="text-xs text-red-400 leading-relaxed">{localError}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function WalletAuthButtonFallback({
  className = "",
  layout = "column",
}: Pick<WalletAuthButtonsProps, "className" | "layout">) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium",
        "border border-neutral-800 bg-neutral-900/40 text-neutral-500 cursor-not-allowed",
        layout === "column" && "w-full",
        className,
      )}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading wallets…
    </button>
  );
}

export function WalletAuthButtons(props: WalletAuthButtonsProps) {
  return (
    <Web3Provider fallback={<WalletAuthButtonFallback {...props} />}>
      <WalletAuthButtonsInner {...props} />
    </Web3Provider>
  );
}
