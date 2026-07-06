import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Loader2 } from "lucide-react";
import { AuthButtons } from "@/components/AuthButtons";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import {
  getReferralCookieHeaderValue,
  isValidReferralCode,
  normalizeReferralCode,
  persistReferralCode,
} from "@/lib/referrals";

interface JoinPageProps {
  referralCode: string | null;
}

export default function JoinPage({ referralCode }: JoinPageProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const refFromQuery = router.query.ref;
    const code =
      referralCode ||
      (typeof refFromQuery === "string" && isValidReferralCode(refFromQuery)
        ? normalizeReferralCode(refFromQuery)
        : null);

    if (code) {
      persistReferralCode(code);
    }

    setReady(true);
  }, [router.isReady, router.query.ref, referralCode]);

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
          <p className="text-sm text-neutral-400">Preparing your invite…</p>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Join Turbo">
      <AuthCard>
        <p className="text-xs font-mono tracking-widest uppercase text-neutral-500 mb-4">
          // invited
        </p>
        <h1
          className="text-white leading-tight mb-3"
          style={{
            fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
          }}
        >
          Join Turbo and start earning.
        </h1>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          {referralCode
            ? "You were invited to share bandwidth and earn USDC. Create your account below — your referral will be applied automatically."
            : "Create your account to run a Turbo node and earn USDC from shared bandwidth."}
        </p>

        {referralCode && (
          <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
              referral_code
            </p>
            <p className="font-mono text-sm text-neutral-300 tracking-widest">{referralCode}</p>
          </div>
        )}

        <AuthButtons layout="column" redirectTo="/dashboard" />
      </AuthCard>
    </AuthShell>
  );
}

export const getServerSideProps: GetServerSideProps<JoinPageProps> = async (context) => {
  const ref = context.query.ref;
  const referralCode =
    typeof ref === "string" && isValidReferralCode(ref) ? normalizeReferralCode(ref) : null;

  if (referralCode) {
    context.res.setHeader("Set-Cookie", getReferralCookieHeaderValue(referralCode));
  }

  return {
    props: {
      referralCode,
    },
  };
};
