import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserFromRequest } from "@/lib/apiAuth";

// Short enough that a token pasted into a chat log or left in shell history is
// almost certainly dead by the time anyone finds it, long enough to survive
// switching windows, SSHing into a box and pasting. Single-use regardless:
// claiming it pairs one node and consumes it (see ClaimInstallToken in the
// Turbo backend).
const TOKEN_TTL_MINUTES = 20;

// Mints a pairing token for the signed-in user, to be embedded in the terminal
// install command shown on the dashboard's Download page.
//
// This is the mirror image of /api/connect/claim: there, a node mints a uuid
// for itself and a human claims it in a browser; here, a human mints one for
// their account and a node claims it on connect. That inversion is the whole
// point — a headless server has no browser to complete the other flow with.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { user, error: authError } = await getUserFromRequest(req);
  if (authError || !user) {
    return res.status(401).json({ ok: false, error: authError ?? "Unauthorized" });
  }

  const admin = getSupabaseAdmin();

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

  // device_id and node_ip stay null until a node presents this token: at mint
  // time there is no node yet, which is the difference from the node-initiated
  // rows this table was originally built for. `source` keeps the two kinds
  // from being used interchangeably.
  const { error: insertError } = await admin.from("node_connect_requests").insert({
    uuid: token,
    user_id: user.id,
    source: "account",
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error("install token insert error:", insertError);
    return res.status(500).json({ ok: false, error: "Failed to create install token" });
  }

  return res.status(200).json({ ok: true, token, expiresAt });
}
