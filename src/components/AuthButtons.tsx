import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletAuthButtons } from "@/components/auth/WalletAuthButtons";
import { getAuthDisplayName, getAuthDisplaySubtitle } from "@/lib/web3Auth";
import type { ReferralValidationReason } from "@/lib/referralValidation";
import { isValidReferralCode, normalizeReferralCode } from "@/lib/referrals";

type ReferralCheckStatus = "idle" | "checking" | ReferralValidationReason;

interface AuthButtonsProps {
  className?: string;
  /** Stack buttons vertically (login screens) */
  layout?: 'row' | 'column';
  /** Path to redirect to after OAuth completes */
  redirectTo?: string;
  /** Show a referral code input below providers (signup) */
  showReferralInput?: boolean;
  /** Pre-fill the referral input without persisting it */
  prefillReferralCode?: string | null;
}

async function fetchReferralValidation(code: string): Promise<ReferralValidationReason> {
  const normalized = normalizeReferralCode(code);
  if (!isValidReferralCode(normalized)) return "invalid_format";

  try {
    const response = await fetch(`/api/referrals/validate?code=${encodeURIComponent(normalized)}`);
    if (!response.ok) return "not_found";

    const result = (await response.json()) as { valid: boolean; reason: ReferralValidationReason };
    return result.valid ? "ok" : result.reason;
  } catch {
    return "not_found";
  }
}

export function AuthButtons({
  className = "",
  layout = "row",
  redirectTo,
  showReferralInput = false,
  prefillReferralCode = null,
}: AuthButtonsProps) {
  const { user, loading, signInWithDiscord, signInWithGoogle, signOut, isAuthenticated } = useAuth();
  const [referralDraft, setReferralDraft] = useState<string>("");
  const [referralCheckStatus, setReferralCheckStatus] = useState<ReferralCheckStatus>("idle");

  const normalizedDraft = normalizeReferralCode(referralDraft);

  useEffect(() => {
    if (!prefillReferralCode) return;
    setReferralDraft(prefillReferralCode);
    setReferralCheckStatus("ok");
  }, [prefillReferralCode]);

  const resolveReferralStatus = useCallback(async (): Promise<ReferralCheckStatus> => {
    const trimmed = referralDraft.trim();
    if (!trimmed) return "idle";

    setReferralCheckStatus("checking");
    const status = await fetchReferralValidation(trimmed);
    setReferralCheckStatus(status);
    return status;
  }, [referralDraft]);

  useEffect(() => {
    if (!showReferralInput) return;

    const trimmed = referralDraft.trim();
    if (!trimmed) {
      setReferralCheckStatus("idle");
      return;
    }

    const normalized = normalizeReferralCode(trimmed);
    if (!isValidReferralCode(normalized)) {
      setReferralCheckStatus("invalid_format");
      return;
    }

    setReferralCheckStatus("checking");
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/referrals/validate?code=${encodeURIComponent(normalized)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((result: { valid: boolean; reason: ReferralValidationReason } | null) => {
          if (!result) {
            setReferralCheckStatus("not_found");
            return;
          }
          setReferralCheckStatus(result.valid ? "ok" : result.reason);
        })
        .catch((err: Error) => {
          if (err.name !== "AbortError") setReferralCheckStatus("not_found");
        });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [referralDraft, showReferralInput]);

  const getReferralCodeForSignup = useCallback(async (): Promise<string | null> => {
    if (!referralDraft.trim()) return null;

    const status =
      referralCheckStatus === "ok" && normalizedDraft === normalizeReferralCode(referralDraft)
        ? "ok"
        : await resolveReferralStatus();

    return status === "ok" ? normalizedDraft : null;
  }, [referralDraft, referralCheckStatus, normalizedDraft, resolveReferralStatus]);

  const signInWithReferral = (signIn: (redirectTo?: string, refCode?: string) => void) => {
    void getReferralCodeForSignup().then((refCode) => signIn(redirectTo, refCode ?? undefined));
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
        <span className="text-sm text-neutral-400">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const displayName = getAuthDisplayName(user);
    const displaySubtitle = getAuthDisplaySubtitle(user);

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-neutral-700 overflow-hidden bg-neutral-800 flex items-center justify-center">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-8 h-8 object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-neutral-400" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{displayName}</p>
            {displaySubtitle && (
              <p className="text-xs text-neutral-500">{displaySubtitle}</p>
            )}
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  const referralHasError =
    referralDraft.trim().length > 0 &&
    (referralCheckStatus === "invalid_format" || referralCheckStatus === "not_found");

  const referralInput = showReferralInput ? (
    <div className={cn("w-full", layout !== "column" && "min-w-[16rem]")}>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 pt-4">
        referral_code (optional)
      </label>
      <div className="relative">
        <input
          value={referralDraft}
          onChange={(e) => setReferralDraft(e.target.value)}
          placeholder="ABC123"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "w-full rounded-xl border bg-neutral-950/60 px-4 py-3 text-sm font-mono tracking-widest text-neutral-100 outline-none transition-colors",
            referralHasError
              ? "border-red-500/60 focus:border-red-500/60"
              : referralCheckStatus === "ok"
                ? "border-emerald-500/40 focus:border-emerald-500/60"
                : "border-neutral-800 focus:border-neutral-700",
          )}
        />
        {referralCheckStatus === "checking" && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 animate-spin" />
        )}
      </div>
      {(referralCheckStatus === "checking" || referralCheckStatus === "ok" || referralHasError) && (
        <p
          className={cn(
            "mt-2 text-[11px]",
            referralHasError ? "text-red-400" : "text-neutral-600",
          )}
        >
          {referralCheckStatus === "checking"
            ? "Checking referral code…"
            : referralCheckStatus === "ok"
              ? "Referral code verified — we’ll apply it when you create your account."
              : "Invalid code."}
        </p>
      )}
    </div>
  ) : null;

  const providerButtons = (
    <>
      <button
        onClick={() => signInWithReferral(signInWithDiscord)}
        className={cn(
          'flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.97]',
          'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg shadow-[#5865F2]/20',
          layout === 'column' && 'w-full',
        )}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
        Continue with Discord
      </button>
      <button
        onClick={() => signInWithReferral(signInWithGoogle)}
        className={cn(
          'flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.97]',
          'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200',
          layout === 'column' && 'w-full',
        )}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
      <WalletAuthButtons
        layout={layout}
        redirectTo={redirectTo}
        onBeforeAuth={getReferralCodeForSignup}
      />
    </>
  );

  const providerLayoutClass = cn(
    'flex gap-3',
    layout === 'column' ? 'flex-col w-full' : 'flex-row flex-wrap items-center',
  );

  if (showReferralInput) {
    return (
      <div className={cn(providerLayoutClass, className)}>
        {providerButtons}
        {referralInput}
      </div>
    );
  }

  return (
    <div className={cn(providerLayoutClass, className)}>
      {providerButtons}
    </div>
  );
}
