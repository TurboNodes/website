import React from "react";
import Link from "next/link";
import { RefreshCw, Users } from "lucide-react";
import { UserProfile } from "../UserProfile";
import { PanelTitle, pill } from "./ui";
import { TOP_REFERRAL_TIER, formatRate } from "@/lib/referralTiers";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  heading: string;
  description?: string;
  actions?: React.ReactNode;
  balance: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function DashboardHeader({
  heading,
  description,
  actions,
  balance = 0,
  refreshing = false,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="relative z-10 shrink-0 flex items-center gap-3 sm:gap-5 px-4 sm:px-6 lg:px-8 py-3.5 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="min-w-0 flex-1">
        <PanelTitle as="h1" size="lg">
          {heading}
        </PanelTitle>
        {description && (
          <p className="mt-1.5 hidden sm:block text-sm text-neutral-400 truncate">
            {description}
          </p>
        )}
      </div>

      {actions}

      <Link
        href="/dashboard/referrals"
        className={cn(pill({ variant: "soft", size: "sm" }), "hidden lg:inline-flex")}
      >
        <Users className="w-3.5 h-3.5" />
        Invite friends — earn {formatRate(TOP_REFERRAL_TIER.rate)}
      </Link>

      <div className="hidden sm:flex flex-col items-end leading-tight shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
          Balance
        </span>
        <span className="text-sm font-semibold text-white tabular-nums">
          ${balance.toFixed(2)}
        </span>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Refresh dashboard data"
        className={cn(pill({ variant: "secondary", size: "icon" }), "shrink-0")}
      >
        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
      </button>

      <UserProfile />
    </header>
  );
}
