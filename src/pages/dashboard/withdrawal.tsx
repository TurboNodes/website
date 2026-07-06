import React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WithdrawalSection } from "@/components/withdrawal/WithdrawalSection";

export default function WithdrawalPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();

  if (authLoading || !isAuthenticated) {
    return (
      <AuthShell title="Loading... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Loading Withdrawal</h1>
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
    <DashboardShell title="Withdrawal | Turbo">
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
              Withdraw USDC
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Choose a chain (Ethereum, Base, or Solana) to receive USDC — the
              token is always USDC; the chain is where it gets sent.
            </p>
          </div>

          <div className="space-y-5">
            <WithdrawalSection />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
