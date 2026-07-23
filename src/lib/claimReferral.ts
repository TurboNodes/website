import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isValidReferralCode, normalizeReferralCode } from "@/lib/referrals";
import { getPayoutWallets, type PayoutPreferences } from "@/lib/payoutChains";
import {
  getWeb3AuthPayoutChain,
  getWeb3WalletAddress,
  isWeb3User,
} from "@/lib/web3Auth";

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

  await pairWeb3AuthPayoutWallet(session);
  await claimReferralForSession(session, refCode);
}

async function pairWeb3AuthPayoutWallet(session: Session | null): Promise<void> {
  if (!session?.user || !isWeb3User(session.user)) return;

  const chain = getWeb3AuthPayoutChain(session.user);
  const address = getWeb3WalletAddress(session.user);
  if (!chain || !address) return;

  try {
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("preferences")
      .eq("id", session.user.id)
      .single();

    if (fetchError) {
      console.error("Error loading preferences for Web3 payout pairing:", fetchError);
      return;
    }

    const preferences = (data?.preferences as PayoutPreferences | null) ?? {};
    const wallets = getPayoutWallets(preferences);
    if (wallets[chain]) return;

    const next: PayoutPreferences = {
      ...preferences,
      payoutWallets: {
        ...wallets,
        [chain]: {
          address,
          source: "connected",
          linkedAt: new Date().toISOString(),
        },
      },
      payoutWallet: undefined,
      walletSource: undefined,
      walletLinkedAt: undefined,
    };

    const { error: updateError } = await supabase
      .from("users")
      .update({ preferences: next })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Error pairing Web3 auth wallet as payout wallet:", updateError);
    }
  } catch (err) {
    console.error("Unexpected error pairing Web3 auth payout wallet:", err);
  }
}
