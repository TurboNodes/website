import React from "react";
import { Coins } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import type { ReferralEarningEntry } from "@/types";

interface ReferralEarningsHistoryProps {
  recentEarnings: ReferralEarningEntry[];
}

function formatType(type: ReferralEarningEntry["type"]) {
  return type === "milestone_bonus" ? "Milestone bonus" : "Commission";
}

export function ReferralEarningsHistory({ recentEarnings }: ReferralEarningsHistoryProps) {
  return (
    <SettingsPanel
      label="earnings_history"
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
          {recentEarnings.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-neutral-200">{formatType(entry.type)}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {entry.sourceEarningsDelta != null && entry.type === "commission" && (
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
          ))}
        </div>
      )}
    </SettingsPanel>
  );
}
