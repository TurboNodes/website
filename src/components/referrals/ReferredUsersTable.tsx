import React from "react";
import { Users } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { cn } from "@/lib/utils";
import type { ReferredUser } from "@/types";

interface ReferredUsersTableProps {
  referredUsers: ReferredUser[];
}

export function ReferredUsersTable({ referredUsers }: ReferredUsersTableProps) {
  return (
    <SettingsPanel
      label="referred_users"
      title="People you referred"
      description="Earn 10% lifetime commission on each referral's node operator earnings."
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
              {referredUsers.map((user) => (
                <tr key={user.id} className="border-b border-neutral-800/60 last:border-0">
                  <td className="px-2 py-3 text-neutral-300 font-mono">{user.label}</td>
                  <td className="px-2 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider",
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700",
                      )}
                    >
                      {user.status === "active" ? "Earning" : "Pending"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right text-neutral-300">
                    ${user.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-right text-orange-400/90">
                    ${user.commissionEarned.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingsPanel>
  );
}
