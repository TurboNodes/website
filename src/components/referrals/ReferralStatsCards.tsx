import { BadgeCheck, DollarSign, Gift, Users, type LucideIcon } from "lucide-react";
import { PANEL_CLASS } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

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
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        PANEL_CLASS,
        "h-full p-4 sm:p-5",
        accent && "border-orange-500/40 bg-orange-500/[0.06]",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
            accent
              ? "border-orange-500/30 bg-orange-500/10"
              : "border-neutral-800 bg-neutral-950/60",
          )}
        >
          <Icon
            className={cn("w-4 h-4", accent ? "text-orange-400" : "text-neutral-500")}
          />
        </span>
        <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-neutral-300">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl sm:text-3xl font-semibold text-white tabular-nums tracking-tight">
        {value}
      </p>
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard label="Referred" value={String(totalReferred)} icon={Users} />
      <StatCard
        label="Verified"
        value={String(verifiedReferred)}
        icon={BadgeCheck}
      />
      <StatCard
        label="Balance"
        value={`$${referralBalance.toFixed(2)}`}
        icon={DollarSign}
      />
      <StatCard
        label="Commission"
        value={`$${commissionTotal.toFixed(2)}`}
        icon={Gift}
        accent
      />
    </div>
  );
}
