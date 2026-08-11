import React from "react";
import { Coins } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { formatRate } from "@/lib/referralTiers";
import type { ReferralEarningEntry } from "@/types";

/** Commission rate paid before tiered rates shipped, for rows with no recorded rate. */
const LEGACY_COMMISSION_RATE = 0.1;

interface ReferralEarningsHistoryProps {
  recentEarnings: ReferralEarningEntry[];
}

function formatType(type: ReferralEarningEntry["type"]) {
  return type === "milestone_bonus" ? "Milestone bonus" : "Commission";
}

export function ReferralEarningsHistory({ recentEarnings }: ReferralEarningsHistoryProps) {
  return (
    <SettingsPanel
      title="Referral earnings history"
      description="Recent commission payouts from your referrals."
    >
      {recentEarnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Coins className="w-8 h-8 text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">No referral earnings yet.</p>
          <p className="text-xs text-neutral-600 mt-1">
            Earnings appear here when your referrals start earning.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentEarnings.map((entry) => {
            const isCommission = entry.type === "commission";
            const rate = isCommission ? (entry.rate ?? LEGACY_COMMISSION_RATE) : null;

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-200">{formatType(entry.type)}</p>
                    {rate != null && (
                      <span className="inline-flex items-center rounded-full border border-orange-400/40 bg-orange-500/5 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-orange-400/90">
                        {formatRate(rate)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {entry.sourceEarningsDelta != null && isCommission && (
                      <span className="text-neutral-600">
                        {" "}
                        · on ${entry.sourceEarningsDelta.toFixed(2)} earnings
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-sm font-semibold text-emerald-400 shrink-0">
                  +${entry.amount.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </SettingsPanel>
  );
}
