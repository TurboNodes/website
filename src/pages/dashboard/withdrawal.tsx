import React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthButtons } from "@/components/AuthButtons";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WithdrawalSection } from "@/components/withdrawal/WithdrawalSection";

export default function WithdrawalPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <AuthShell title="Loading... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">
            Loading Withdrawal
          </h1>
          <p className="text-sm text-neutral-400">
            Please wait while we verify your authentication.
          </p>
        </AuthCard>
      </AuthShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthShell title="Sign In | Turbo">
        <AuthCard>
          <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
            // sign_in
          </p>
          <h1
            className="text-white leading-tight mb-3"
            style={{
              fontFamily:
                "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            }}
          >
            Withdraw USDC
          </h1>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Sign in to withdraw USDC to your wallet on Ethereum, Base, or Solana.
          </p>
          <AuthButtons layout="column" />
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
