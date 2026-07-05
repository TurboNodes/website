import React from "react";
import {
  PAYOUT_CHAINS,
  REWARD_TOKEN,
  type PayoutChain,
} from "@/lib/payoutChains";
import { cn } from "@/lib/utils";

interface ChainSelectorProps {
  value: PayoutChain;
  onChange: (chain: PayoutChain) => void;
  disabled?: boolean;
  className?: string;
}

export function ChainSelector({
  value,
  onChange,
  disabled,
  className,
}: ChainSelectorProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {PAYOUT_CHAINS.map((chain) => (
          <button
            key={chain.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(chain.id)}
            className={cn(
              "flex flex-col items-start px-4 py-2.5 rounded-lg text-left transition-colors border min-w-[7.5rem]",
              value === chain.id
                ? "bg-orange-500/15 border-orange-500/40"
                : "bg-neutral-950 border-neutral-800 hover:border-neutral-700",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "text-sm font-medium",
                value === chain.id ? "text-orange-400" : "text-neutral-200",
              )}
            >
              {chain.chainName}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-0.5">
              chain · {REWARD_TOKEN}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Rewards are paid in {REWARD_TOKEN}. Choose the chain where you want to
        receive it — Ethereum, Base, or Solana.
      </p>
    </div>
  );
}
