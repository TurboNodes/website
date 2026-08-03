import React from "react";
import { Check, Lock, TrendingUp, Zap } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import {
  REFERRAL_TIERS,
  TOP_REFERRAL_TIER,
  VERIFIED_EARNINGS_THRESHOLD,
  formatRate,
  formatTierRange,
  getNextTier,
  getTier,
  tierProgress,
  verifiedUntilNextTier,
} from "@/lib/referralTiers";
import { cn } from "@/lib/utils";

interface ReferralTierCardProps {
  verifiedReferred: number;
}

export function ReferralTierCard({ verifiedReferred }: ReferralTierCardProps) {
  const currentTier = getTier(verifiedReferred);
  const nextTier = getNextTier(verifiedReferred);
  const remaining = verifiedUntilNextTier(verifiedReferred);
  const progress = tierProgress(verifiedReferred);

  return (
    <SettingsPanel
      label="commission_tier"
      title="Your commission tier"
      description={`Verified referrals unlock higher rates. A referral verifies once they earn more than $${VERIFIED_EARNINGS_THRESHOLD.toFixed(2)} in node earnings.`}
    >
      <div className="rounded-xl border border-orange-400/70 bg-neutral-950 p-5 shadow-[0_0_24px_-8px_rgba(249,115,22,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400/90">
                {currentTier.name}
              </p>
            </div>
            <p className="text-4xl font-semibold text-white tracking-tight">
              {formatRate(currentTier.rate)}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              lifetime commission on referred node earnings
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-semibold text-white">{verifiedReferred}</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-0.5">
              verified
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            {nextTier ? (
              <>
                <p className="text-xs text-neutral-400">
                  <span className="text-amber-300/90 font-medium">{remaining} more</span> verified
                  {remaining === 1 ? " referral" : " referrals"} to unlock{" "}
                  <span className="text-amber-300/90 font-medium">{formatRate(nextTier.rate)}</span>
                </p>
                <p className="text-[10px] font-mono text-neutral-600 shrink-0">
                  {verifiedReferred}/{nextTier.minVerified}
                </p>
              </>
            ) : (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Top tier reached — you earn the maximum {formatRate(TOP_REFERRAL_TIER.rate)}.
              </p>
            )}
          </div>

          <div
            className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={
              nextTier ? `Progress to ${nextTier.name} tier` : "Top commission tier reached"
            }
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                nextTier
                  ? "bg-gradient-to-r from-orange-600 to-amber-500"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-400",
              )}
              style={{ width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {REFERRAL_TIERS.map((tier) => {
          const unlocked = verifiedReferred >= tier.minVerified;
          const isCurrent = tier.id === currentTier.id;

          return (
            <li
              key={tier.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
                isCurrent
                  ? "border-orange-400/70 bg-orange-500/5"
                  : unlocked
                    ? "border-neutral-800 bg-neutral-950"
                    : "border-neutral-800/60 bg-neutral-950/40",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  unlocked
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-700 bg-neutral-800/60 text-neutral-600",
                )}
              >
                {unlocked ? <Check className="w-3 h-3" /> : <Lock className="w-2.5 h-2.5" />}
              </span>

              <span
                className={cn(
                  "text-sm font-medium flex-1 min-w-0 truncate",
                  unlocked ? "text-neutral-200" : "text-neutral-500",
                )}
              >
                {tier.name}
                {isCurrent && (
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-orange-400/90">
                    current
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "text-[11px] font-mono shrink-0",
                  unlocked ? "text-neutral-500" : "text-neutral-600",
                )}
              >
                {formatTierRange(tier)} verified
              </span>

              <span
                className={cn(
                  "text-sm font-semibold shrink-0 w-14 text-right tabular-nums",
                  isCurrent
                    ? "text-orange-400"
                    : unlocked
                      ? "text-neutral-300"
                      : "text-neutral-600",
                )}
              >
                {formatRate(tier.rate)}
              </span>
            </li>
          );
        })}
      </ul>
    </SettingsPanel>
  );
}
