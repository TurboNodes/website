import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserFromRequest } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, error: authError } = await getUserFromRequest(req);
  if (!user || authError) {
    return res.status(401).json({ error: authError ?? "Unauthorized" });
  }

  const nodeId = typeof req.body?.nodeId === "string" ? req.body.nodeId.trim() : "";
  if (!nodeId) {
    return res.status(400).json({ error: "Missing nodeId" });
  }

  const admin = getSupabaseAdmin();

  const { data: node, error: nodeError } = await admin
    .from("nodes")
    .select("id, userId")
    .eq("id", nodeId)
    .maybeSingle();

  if (nodeError) {
    console.error("nodes lookup error:", nodeError);
    return res.status(500).json({ error: "Failed to look up node" });
  }

  if (!node || node.userId !== user.id) {
    return res.status(404).json({ error: "Node not found" });
  }

  // Clear the owner rather than deleting the row: the node keeps its id,
  // nodeIp and dailyEarnings history, so re-pairing later (see /connect/claim)
  // picks up where it left off instead of starting from zero. Migration 009
  // narrowed the "userId can't be reassigned" trigger to allow this.
  const { error: updateError } = await admin
    .from("nodes")
    .update({ userId: null, isActive: false, updatedAt: new Date().toISOString() })
    .eq("id", nodeId)
    .eq("userId", user.id);

  if (updateError) {
    console.error("nodes update error:", updateError);
    return res.status(500).json({ error: "Failed to unpair node" });
  }

  return res.status(200).json({ ok: true });
}
