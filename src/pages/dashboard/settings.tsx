import React from "react";
import { Loader2 } from "lucide-react";
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
    <DashboardShell
      title="Account Settings | Turbo"
      heading="Settings"
      description="Manage your profile, payout wallets, and session."
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 items-start">
        <div className="space-y-4 sm:space-y-5">
          <AccountSection />
          <SessionSection />
        </div>
        <PayoutWalletSection />
      </div>
    </DashboardShell>
  );
}
