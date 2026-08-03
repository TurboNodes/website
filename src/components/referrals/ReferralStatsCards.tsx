import React from "react";
import { BadgeCheck, DollarSign, Gift, Users } from "lucide-react";

interface ReferralStatsCardsProps {
  totalReferred: number;
  verifiedReferred: number;
  referralBalance: number;
  commissionTotal: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-xl border border-orange-400/70 bg-neutral-950 p-4 h-full"
          : "rounded-xl border border-neutral-800 bg-neutral-950 p-4 h-full"
      }
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{label}</p>
        <Icon className={`shrink-0 ${accent ? "w-4 h-4 text-orange-400" : "w-4 h-4 text-neutral-600"}`} />
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function ReferralStatsCards({
  totalReferred,
  verifiedReferred,
  referralBalance,
  commissionTotal,
}: ReferralStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="referred_users"
        value={String(totalReferred)}
        icon={Users}
      />
      <StatCard
        label="verified"
        value={String(verifiedReferred)}
        icon={BadgeCheck}
      />
      <StatCard
        label="referral_balance"
        value={`$${referralBalance.toFixed(2)}`}
        icon={DollarSign}
      />
      <StatCard
        label="commission_earned"
        value={`$${commissionTotal.toFixed(2)}`}
        icon={Gift}
        accent
      />
    </div>
  );
}
