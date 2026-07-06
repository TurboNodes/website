import type { NextApiRequest, NextApiResponse } from "next";
import { getCookieValue, getSupabaseAsUser, getUserFromRequest } from "@/lib/apiAuth";
import { REFERRAL_COOKIE_NAME } from "@/lib/referrals";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, accessToken, error: authError } = await getUserFromRequest(req);
  if (!user || !accessToken || authError) {
    return res.status(401).json({ error: authError ?? "Unauthorized" });
  }

  const refCode =
    getCookieValue(req, REFERRAL_COOKIE_NAME) ||
    (typeof req.body?.refCode === "string" ? req.body.refCode.trim() : null);

  if (!refCode) {
    return res.status(200).json({ ok: true, attributed: false, reason: "no_ref_code" });
  }

  try {
    const supabase = getSupabaseAsUser(accessToken);
    const { data, error } = await supabase.rpc("claim_referral", {
      p_ref_code: refCode,
    });

    if (error) {
      console.error("Claim referral RPC error:", error);
      return res.status(500).json({ error: "Failed to attribute referral" });
    }

    return res.status(200).json(data ?? { ok: false, reason: "unknown_error" });
  } catch (err) {
    console.error("Claim referral error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
