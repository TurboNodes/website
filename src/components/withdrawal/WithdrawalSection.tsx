import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Coins,
  Loader2,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChainSelector } from "@/components/shared/ChainSelector";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useReferrals } from "@/hooks/useReferrals";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import {
  PAYOUT_CHAINS,
  REWARD_TOKEN,
  formatUsdcOnChain,
  getPayoutWalletForChain,
  truncateAddress,
  type PayoutChain,
} from "@/lib/payoutChains";
import { cn } from "@/lib/utils";

const MIN_WITHDRAWAL = 5;

function formatUsdc(amount: number) {
  return `${amount.toFixed(2)} ${REWARD_TOKEN}`;
}

export function WithdrawalSection() {
  const { preferences, loading: prefsLoading } = useUserPreferences();
  const { userStats, loading: statsLoading } = useSupabaseRealtime();
  const { referralBalance, loading: referralLoading } = useReferrals();

  const [selectedChain, setSelectedChain] = useState<PayoutChain>("eth");
  const chainWallet = getPayoutWalletForChain(preferences, selectedChain);
  const chainConfig = PAYOUT_CHAINS.find((c) => c.id === selectedChain)!;
  const nodeEarnings = userStats?.totalEarnings ?? 0;
  const availableBalance = nodeEarnings + referralBalance;

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const loading = prefsLoading || statsLoading || referralLoading;
  const parsedAmount = parseFloat(amount) || 0;
  const canWithdraw =
    !!chainWallet &&
    availableBalance >= MIN_WITHDRAWAL &&
    parsedAmount >= MIN_WITHDRAWAL;

  useEffect(() => {
    if (!showConfirm) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowConfirm(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm]);

  const validateAmount = (value: string) => {
    const num = parseFloat(value);
    if (!value || Number.isNaN(num) || num <= 0) {
      return "Enter a valid amount.";
    }
    if (num < MIN_WITHDRAWAL) {
      return `Minimum withdrawal is ${MIN_WITHDRAWAL} ${REWARD_TOKEN}.`;
    }
    if (num > availableBalance) {
      return "Amount exceeds your available balance.";
    }
    return null;
  };

  const handleWithdrawClick = () => {
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }
    setAmountError(null);
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    setWithdrawing(true);
    // Placeholder until a withdrawal API exists.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setWithdrawing(false);
    setShowConfirm(false);
    setWithdrawSuccess(true);
    setAmount("");
  };

  if (loading) {
    return (
      <SettingsPanel label="withdrawal" title="Withdraw earnings">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading balance…
        </div>
      </SettingsPanel>
    );
  }

  return (
    <>
      <SettingsPanel
        label="withdrawal"
        title="Withdraw USDC"
        description="Withdraw your earnings as USDC. Pick a chain (Ethereum, Base, or Solana) — that is the network your USDC will be sent on, not the token you receive."
      >
        {withdrawSuccess && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-300">
                Withdrawal request submitted
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Your {formatUsdcOnChain(selectedChain)} withdrawal is being
                processed. Funds typically arrive within 1–3 business days.
              </p>
            </div>
          </div>
        )}

        <div className="mb-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
            withdrawal_chain
          </p>
          <ChainSelector
            value={selectedChain}
            onChange={(chain) => {
              setSelectedChain(chain);
              setAmountError(null);
              if (withdrawSuccess) setWithdrawSuccess(false);
            }}
            disabled={withdrawing}
          />
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 mb-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
            available_balance ({REWARD_TOKEN})
          </p>
          <p className="text-2xl font-semibold text-white">
            {formatUsdc(availableBalance)}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Node earnings: {formatUsdc(nodeEarnings)} · Referral earnings:{" "}
            {formatUsdc(referralBalance)}
          </p>
        </div>

        <div className="mb-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
            destination_wallet
          </p>
          {chainWallet ? (
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-sm text-neutral-300 truncate block">
                  {truncateAddress(chainWallet.address)}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  {formatUsdcOnChain(selectedChain)}
                </span>
              </div>
              <Link
                href="/dashboard/settings"
                className="text-xs text-neutral-500 hover:text-orange-400 transition-colors shrink-0"
              >
                Change
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/50 px-4 py-4 text-center">
              <p className="text-sm text-neutral-400 mb-3">
                Link a wallet on the {chainConfig.chainName} chain in account
                settings before withdrawing {REWARD_TOKEN}.
              </p>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Set up {chainConfig.chainName} chain wallet
              </Link>
            </div>
          )}
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
              amount ({REWARD_TOKEN})
            </p>
            <button
              type="button"
              onClick={() => {
                setAmount(availableBalance.toFixed(2));
                setAmountError(null);
              }}
              disabled={availableBalance < MIN_WITHDRAWAL}
              className="text-[10px] font-mono uppercase tracking-widest text-orange-400/80 hover:text-orange-400 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
            >
              Max
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              min={MIN_WITHDRAWAL}
              max={availableBalance}
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (amountError) setAmountError(null);
                if (withdrawSuccess) setWithdrawSuccess(false);
              }}
              disabled={!chainWallet || availableBalance < MIN_WITHDRAWAL}
              placeholder="0.00"
              className={cn(
                "w-full px-3 py-2.5 bg-neutral-950 border rounded-lg text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
                amountError ? "border-red-500/50" : "border-neutral-800",
              )}
            />
          </div>
          {amountError ? (
            <p className="mt-2 text-sm text-red-400">{amountError}</p>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Minimum: {MIN_WITHDRAWAL} {REWARD_TOKEN}
            </p>
          )}
        </div>

        <Button
          onClick={handleWithdrawClick}
          disabled={!canWithdraw || withdrawing}
          className="w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {withdrawing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4" />
              Withdraw {REWARD_TOKEN}
            </>
          )}
        </Button>
      </SettingsPanel>

      <SettingsPanel
        label="history"
        title="Withdrawal history"
        description="Past withdrawal requests and their status."
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Coins className="w-8 h-8 text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">No withdrawals yet.</p>
          <p className="text-xs text-neutral-600 mt-1">
            Your withdrawal history will appear here.
          </p>
        </div>
      </SettingsPanel>

      {showConfirm && chainWallet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4"
          onClick={() => !withdrawing && setShowConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
            className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-6 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {!withdrawing && (
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400/90 mb-1">
                  // confirm_withdrawal
                </p>
                <h3 id="withdraw-title" className="text-lg font-semibold text-white">
                  Confirm withdrawal
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  You are withdrawing{" "}
                  <span className="text-white font-medium">
                    {formatUsdc(parsedAmount)}
                  </span>{" "}
                  via the{" "}
                  <span className="text-orange-400/90 font-medium">
                    {chainConfig.chainName}
                  </span>{" "}
                  chain to{" "}
                  <span className="font-mono text-neutral-300">
                    {truncateAddress(chainWallet.address)}
                  </span>
                  . This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={withdrawing}
                className="border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {withdrawing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Confirm ${REWARD_TOKEN} withdrawal`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
