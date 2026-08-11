import React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useReferrals } from "@/hooks/useReferrals";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { pill } from "@/components/dashboard/ui";
import { ReferralEarningsHistory } from "@/components/referrals/ReferralEarningsHistory";
import { ReferralLinkCard } from "@/components/referrals/ReferralLinkCard";
import { ReferralStatsCards } from "@/components/referrals/ReferralStatsCards";
import { ReferralTierCard } from "@/components/referrals/ReferralTierCard";
import { ReferredUsersTable } from "@/components/referrals/ReferredUsersTable";
import { ShareReferralButtons } from "@/components/referrals/ShareReferralButtons";
import { BASE_REFERRAL_TIER, TOP_REFERRAL_TIER, formatRate } from "@/lib/referralTiers";
import { cn } from "@/lib/utils";

export default function ReferralsPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const { stats, loading, error, refetch } = useReferrals();

  if (authLoading || !isAuthenticated) {
    return (
      <AuthShell title="Loading... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Loading Referrals</h1>
          <p className="text-sm text-neutral-400">
            {authLoading
              ? "Please wait while we verify your authentication."
              : "Redirecting to sign in..."}
          </p>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <DashboardShell
      title="Referrals | Turbo"
      heading="Referrals"
      description={`Earn ${formatRate(BASE_REFERRAL_TIER.rate)} to ${formatRate(TOP_REFERRAL_TIER.rate)} lifetime commission on every friend you invite.`}
      actions={
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          aria-label="Refresh referral data"
          className={cn(pill({ variant: "secondary", size: "icon" }), "shrink-0")}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      }
    >
      {loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-5">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading referral data…
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <div className="space-y-4 sm:space-y-5">
          <ReferralStatsCards
            totalReferred={stats.totalReferred}
            verifiedReferred={stats.verifiedReferred}
            referralBalance={stats.referralBalance}
            commissionTotal={stats.commissionTotal}
          />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start">
            <div className="xl:col-span-7 space-y-4 sm:space-y-5">
              <ReferralLinkCard
                referralCode={stats.referralCode}
                referralLink={stats.referralLink}
                commissionRate={stats.commissionRate}
              />
              <ReferredUsersTable
                referredUsers={stats.referredUsers}
                commissionRate={stats.commissionRate}
              />
            </div>

            <div className="xl:col-span-5 space-y-4 sm:space-y-5">
              <ReferralTierCard verifiedReferred={stats.verifiedReferred} />
              <ShareReferralButtons referralLink={stats.referralLink} />
              <ReferralEarningsHistory recentEarnings={stats.recentEarnings} />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
