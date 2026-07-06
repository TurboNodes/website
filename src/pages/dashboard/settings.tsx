import React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AccountSection } from "@/components/settings/AccountSection";
import { PayoutWalletSection } from "@/components/settings/PayoutWalletSection";
import { SessionSection } from "@/components/settings/SessionSection";

export default function SettingsPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();

  if (authLoading || !isAuthenticated) {
    return (
      <AuthShell title="Loading... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Loading Settings</h1>
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
    <DashboardShell title="Account Settings | Turbo">
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Account settings
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage your profile, payout wallet, and session.
            </p>
          </div>

          <div className="space-y-5">
            <AccountSection />
            <PayoutWalletSection />
            <SessionSection />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
