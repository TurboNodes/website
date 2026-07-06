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
import { ReferredUsersTable } from "@/components/referrals/ReferredUsersTable";
import { ShareReferralButtons } from "@/components/referrals/ShareReferralButtons";

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
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-orange-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Referrals</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Invite friends and earn 10% lifetime commission on their node earnings.
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
                activeReferred={stats.activeReferred}
                referralBalance={stats.referralBalance}
                commissionTotal={stats.commissionTotal}
              />
              <ReferralLinkCard
                referralCode={stats.referralCode}
                referralLink={stats.referralLink}
              />
              <ShareReferralButtons referralLink={stats.referralLink} />
              <ReferredUsersTable referredUsers={stats.referredUsers} />
              <ReferralEarningsHistory recentEarnings={stats.recentEarnings} />
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
