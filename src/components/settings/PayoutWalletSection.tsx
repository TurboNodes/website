import React, { useEffect, useRef, useState } from "react";
import { base, mainnet } from "wagmi/chains";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { AlertTriangle, Check, Copy, Loader2, Trash2, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/shared/ChainSelector";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  PAYOUT_CHAINS,
  REWARD_TOKEN,
  formatUsdcOnChain,
  getPayoutWalletForChain,
  truncateAddress,
  validateWalletAddress,
  type PayoutChain,
} from "@/lib/payoutChains";
import { SettingsPanel } from "./SettingsPanel";

export function PayoutWalletSection() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    preferences,
    loading,
    saving,
    error: prefsError,
    updatePayoutWallet,
    clearPayoutWallet,
  } = useUserPreferences();

  const [selectedChain, setSelectedChain] = useState<PayoutChain>("eth");
  const savedWallet = getPayoutWalletForChain(preferences, selectedChain);
  const chainConfig = PAYOUT_CHAINS.find((c) => c.id === selectedChain)!;
  const isEvmChain = chainConfig.addressType === "evm";
  const evmChainId = selectedChain === "base" ? base.id : mainnet.id;

  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const lastAutoSaved = useRef<string | null>(null);

  // Reset manual input when switching chains.
  useEffect(() => {
    setManualInput("");
    setManualError(null);
    lastAutoSaved.current = null;
  }, [selectedChain]);

  // Persist a freshly connected EVM wallet for the active chain.
  useEffect(() => {
    if (!isEvmChain || !isConnected || !address || chainId !== evmChainId) return;
    if (address === savedWallet?.address) return;

    const key = `${selectedChain}:${address}`;
    if (lastAutoSaved.current === key) return;

    lastAutoSaved.current = key;
    updatePayoutWallet(selectedChain, address, "connected");
  }, [
    isEvmChain,
    isConnected,
    address,
    chainId,
    evmChainId,
    selectedChain,
    savedWallet?.address,
    updatePayoutWallet,
  ]);

  const handleManualSave = async () => {
    const error = validateWalletAddress(manualInput, selectedChain);
    if (error) {
      setManualError(error);
      return;
    }
    setManualError(null);
    const ok = await updatePayoutWallet(
      selectedChain,
      manualInput.trim(),
      "manual",
    );
    if (ok) setManualInput("");
  };

  const handleRemove = async () => {
    await clearPayoutWallet(selectedChain);
    lastAutoSaved.current = null;
    if (isConnected && isEvmChain) disconnect();
    setShowRemoveConfirm(false);
  };

  useEffect(() => {
    if (!showRemoveConfirm) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowRemoveConfirm(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showRemoveConfirm]);

  const handleCopy = async () => {
    if (!savedWallet) return;
    await navigator.clipboard.writeText(savedWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SettingsPanel
      label="payout_wallet"
      title="Payout wallets"
      description={`Link a wallet on each chain to receive ${REWARD_TOKEN}. Ethereum, Base, and Solana are networks — your rewards are always paid in ${REWARD_TOKEN} on the chain you select.`}
    >
      <div className="mb-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
          payout_chain
        </p>
        <ChainSelector
          value={selectedChain}
          onChange={setSelectedChain}
          disabled={loading || saving}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading wallet…
        </div>
      ) : savedWallet ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm text-white truncate">
                  {truncateAddress(savedWallet.address)}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  {formatUsdcOnChain(selectedChain)} ·{" "}
                  {savedWallet.source === "connected"
                    ? "connected"
                    : "manual"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-neutral-400 hover:text-white"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRemoveConfirm(true)}
                disabled={saving}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {isEvmChain && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                connect a wallet
              </p>
              <div className="flex flex-wrap gap-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    variant="outline"
                    onClick={() =>
                      connect({ connector, chainId: evmChainId })
                    }
                    disabled={isPending || saving}
                    className="border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900 hover:text-orange-400"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    {connector.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isEvmChain && (
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-800" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                or
              </span>
              <div className="h-px flex-1 bg-neutral-800" />
            </div>
          )}

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              {isEvmChain ? "paste an address" : "paste solana address"}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => {
                  setManualInput(e.target.value);
                  if (manualError) setManualError(null);
                }}
                placeholder={chainConfig.placeholder}
                className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50"
              />
              <Button
                onClick={handleManualSave}
                disabled={saving || !manualInput.trim()}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save address"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(manualError || connectError || prefsError) && (
        <p className="mt-3 text-sm text-red-400">
          {manualError || connectError?.message || prefsError}
        </p>
      )}

      {showRemoveConfirm && savedWallet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4"
          onClick={() => setShowRemoveConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-wallet-title"
            className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-6 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowRemoveConfirm(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-red-400/90 mb-1">
                  // confirm_removal
                </p>
                <h3
                  id="remove-wallet-title"
                  className="text-lg font-semibold text-white"
                >
                  Remove {chainConfig.chainName} chain wallet?
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  You won&apos;t receive {formatUsdcOnChain(selectedChain)}{" "}
                  until you link a new wallet on this chain. This removes{" "}
                  <span className="font-mono text-neutral-300">
                    {truncateAddress(savedWallet.address)}
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRemoveConfirm(false)}
                disabled={saving}
                className="border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemove}
                disabled={saving}
                className="bg-red-500/90 text-white hover:bg-red-500"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove wallet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SettingsPanel>
  );
}
