import React from "react";
import { DollarSign, Gift, Users } from "lucide-react";
import { REWARD_TOKEN } from "@/lib/payoutChains";

interface ReferralStatsCardsProps {
  totalReferred: number;
  activeReferred: number;
  referralBalance: number;
  commissionTotal: number;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{label}</p>
        <Icon className="w-4 h-4 text-neutral-600" />
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

export function ReferralStatsCards({
  totalReferred,
  activeReferred,
  referralBalance,
  commissionTotal,
}: ReferralStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatCard
        label="referred_users"
        value={String(totalReferred)}
        sub={`${activeReferred} earning`}
        icon={Users}
      />
      <StatCard
        label="referral_balance"
        value={`$${referralBalance.toFixed(2)}`}
        sub={REWARD_TOKEN}
        icon={DollarSign}
      />
      <StatCard
        label="commission_earned"
        value={`$${commissionTotal.toFixed(2)}`}
        sub="10% lifetime"
        icon={Gift}
      />
    </div>
  );
}
