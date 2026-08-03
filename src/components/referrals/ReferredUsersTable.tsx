import React from "react";
import { Users } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { VERIFIED_EARNINGS_THRESHOLD, formatRate } from "@/lib/referralTiers";
import { cn } from "@/lib/utils";
import type { ReferredUser, ReferredUserStatus } from "@/types";

interface ReferredUsersTableProps {
  referredUsers: ReferredUser[];
  commissionRate: number;
}

const STATUS_STYLES: Record<ReferredUserStatus, { label: string; className: string }> = {
  verified: {
    label: "Verified",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  },
  active: {
    label: "Earning",
    className: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
  },
  pending: {
    label: "Pending",
    className: "bg-neutral-800 text-neutral-400 border border-neutral-700",
  },
};

export function ReferredUsersTable({ referredUsers, commissionRate }: ReferredUsersTableProps) {
  return (
    <SettingsPanel
      label="referred_users"
      title="People you referred"
      description={`You earn ${formatRate(commissionRate)} lifetime commission on each referral's node operator earnings. Referrals count toward your tier once they pass $${VERIFIED_EARNINGS_THRESHOLD.toFixed(2)}.`}
    >
      {referredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="w-8 h-8 text-neutral-700 mb-3" />
          <p className="text-sm text-neutral-500">No referrals yet.</p>
          <p className="text-xs text-neutral-600 mt-1">
            Share your link to start earning referral rewards.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                <th className="px-2 py-2 font-normal">User</th>
                <th className="px-2 py-2 font-normal">Status</th>
                <th className="px-2 py-2 font-normal text-right">Node earnings</th>
                <th className="px-2 py-2 font-normal text-right">Your commission</th>
              </tr>
            </thead>
            <tbody>
              {referredUsers.map((user) => {
                const status = STATUS_STYLES[user.status];
                const verifyProgress = Math.min(
                  1,
                  user.totalEarnings / VERIFIED_EARNINGS_THRESHOLD,
                );

                return (
                  <tr key={user.id} className="border-b border-neutral-800/60 last:border-0">
                    <td className="px-2 py-3 text-neutral-300 font-mono">{user.label}</td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right text-neutral-300">
                      ${user.totalEarnings.toFixed(2)}
                      {user.status !== "verified" && (
                        <span className="block text-[10px] font-mono text-neutral-600 mt-0.5">
                          ${user.totalEarnings.toFixed(2)} / $
                          {VERIFIED_EARNINGS_THRESHOLD.toFixed(2)} to verify
                          <span className="mt-1 block h-0.5 w-16 ml-auto rounded-full bg-neutral-800 overflow-hidden">
                            <span
                              className="block h-full rounded-full bg-amber-500/70"
                              style={{ width: `${verifyProgress * 100}%` }}
                            />
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right text-orange-400/90 align-top">
                      ${user.commissionEarned.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SettingsPanel>
  );
}
