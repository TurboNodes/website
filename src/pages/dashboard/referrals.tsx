import React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useReferrals } from "@/hooks/useReferrals";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ReferralEarningsHistory } from "@/components/referrals/ReferralEarningsHistory";
import { ReferralLinkCard } from "@/components/referrals/ReferralLinkCard";
import { ReferralStatsCards } from "@/components/referrals/ReferralStatsCards";
import { ReferralTierCard } from "@/components/referrals/ReferralTierCard";
import { ReferredUsersTable } from "@/components/referrals/ReferredUsersTable";
import { ShareReferralButtons } from "@/components/referrals/ShareReferralButtons";
import { BASE_REFERRAL_TIER, TOP_REFERRAL_TIER, formatRate } from "@/lib/referralTiers";

export default function ReferralsPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const { stats, loading, error } = useReferrals();

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
    <DashboardShell title="Referrals | Turbo">
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-orange-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <div className="mb-8">
            <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400/90 mb-2">
              // earn_with_friends
            </p>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Referrals</h1>
            <p className="text-sm text-neutral-400 mt-1.5 max-w-md leading-relaxed">
              Invite friends and earn lifetime commission on their node earnings — starting at{" "}
              <span className="text-amber-300/90 font-medium">
                {formatRate(BASE_REFERRAL_TIER.rate)}
              </span>{" "}
              and scaling up to{" "}
              <span className="text-amber-300/90 font-medium">
                {formatRate(TOP_REFERRAL_TIER.rate)}
              </span>{" "}
              as more referrals verify.
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading referral data…
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {stats && (
            <div className="space-y-5">
              <ReferralStatsCards
                totalReferred={stats.totalReferred}
                verifiedReferred={stats.verifiedReferred}
                referralBalance={stats.referralBalance}
                commissionTotal={stats.commissionTotal}
              />
              <ReferralTierCard verifiedReferred={stats.verifiedReferred} />
              <ReferralLinkCard
                referralCode={stats.referralCode}
                referralLink={stats.referralLink}
                commissionRate={stats.commissionRate}
              />
              <ShareReferralButtons referralLink={stats.referralLink} />
              <ReferredUsersTable
                referredUsers={stats.referredUsers}
                commissionRate={stats.commissionRate}
              />
              <ReferralEarningsHistory recentEarnings={stats.recentEarnings} />
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
