import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Loader2 } from "lucide-react";
import { AuthButtons } from "@/components/AuthButtons";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import type { JoinReferralProps } from "@/lib/joinReferral";
import { getJoinReferralProps } from "@/lib/joinReferral";

export default function JoinPage({ prefillReferralCode, referralCodeError }: JoinReferralProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.prefill) {
      router.replace("/join", undefined, { shallow: true });
    }

    setReady(true);
  }, [router.isReady, router.query.prefill, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (!ready || authLoading) {
    return (
      <AuthShell title="Join Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-400">Preparing signup…</p>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Join Turbo">
      <AuthCard>
        <p className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-4">
          // sign up
        </p>
        <h1
          className="text-white leading-tight mb-3"
          style={{
            fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
          }}
        >
          Create your Turbo account.
        </h1>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          Sign up to run a Turbo node and earn USDC from shared bandwidth.
        </p>

        {referralCodeError === "invalid" && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">
              That referral link isn&apos;t valid. You can still sign up below, or enter a different
              code.
            </p>
          </div>
        )}

        <AuthButtons
          layout="column"
          redirectTo="/dashboard"
          showReferralInput
          prefillReferralCode={prefillReferralCode}
        />
        <p className="text-sm text-neutral-500 text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-400/80 hover:text-orange-400 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export const getServerSideProps: GetServerSideProps<JoinReferralProps> = async (context) => {
  return getJoinReferralProps(context);
};
