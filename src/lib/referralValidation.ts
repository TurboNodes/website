import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidReferralCode, normalizeReferralCode } from "@/lib/referrals";

export type ReferralValidationReason = "ok" | "invalid_format" | "not_found";

export interface ReferralValidationResult {
  valid: boolean;
  reason: ReferralValidationReason;
  code: string | null;
}

export async function validateReferralCode(code: string): Promise<ReferralValidationResult> {
  const normalized = normalizeReferralCode(code);

  if (!isValidReferralCode(normalized)) {
    return { valid: false, reason: "invalid_format", code: null };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("referralCode", normalized)
      .maybeSingle();

    if (error || !data) {
      return { valid: false, reason: "not_found", code: normalized };
    }

    return { valid: true, reason: "ok", code: normalized };
  } catch (err) {
    console.error("Referral code validation error:", err);
    return { valid: false, reason: "not_found", code: normalized };
  }
}
