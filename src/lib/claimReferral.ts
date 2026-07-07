import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isValidReferralCode, normalizeReferralCode } from "@/lib/referrals";

export interface ClaimReferralResult {
  ok: boolean;
  attributed?: boolean;
  reason?: string;
}

export async function claimReferralForSession(
  session: Session | null,
  refCode?: string | null,
): Promise<ClaimReferralResult | null> {
  if (!session?.access_token) return null;

  const normalized =
    refCode && isValidReferralCode(refCode) ? normalizeReferralCode(refCode) : null;

  if (!normalized) {
    return { ok: true, attributed: false, reason: "no_ref_code" };
  }

  try {
    const response = await fetch("/api/referrals/claim", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refCode: normalized }),
    });

    if (!response.ok) {
      console.error("Claim referral request failed:", response.status);
      return null;
    }

    return (await response.json()) as ClaimReferralResult;
  } catch (err) {
    console.error("Error claiming referral:", err);
    return null;
  }
}

export async function bootstrapUserAfterAuth(
  session: Session | null,
  refCode?: string | null,
): Promise<void> {
  if (!session?.user) return;

  try {
    const authUser = session.user;
    const username =
      (authUser.user_metadata as { preferred_username?: string; username?: string })
        ?.preferred_username ||
      (authUser.user_metadata as { username?: string })?.username ||
      null;

    const { error } = await supabase.from("users").upsert({
      id: authUser.id,
      email: authUser.email,
      username,
    });

    if (error) {
      console.error("Error upserting user row:", error);
    }
  } catch (err) {
    console.error("Unexpected error upserting user row:", err);
  }

  await claimReferralForSession(session, refCode);
}
