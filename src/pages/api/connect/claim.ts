import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserFromRequest } from "@/lib/apiAuth";
import crypto from "crypto";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { user, error: userError } = await getUserFromRequest(req);
  if (userError || !user) {
    return res.status(401).json({ ok: false, error: userError ?? "Unauthorized" });
  }

  const uuid = (req.body?.uuid as string | undefined)?.trim();
  if (!uuid || !isUuid(uuid)) {
    return res.status(400).json({ ok: false, error: "Invalid uuid" });
  }

  const admin = getSupabaseAdmin();

  const { data: requestRow, error: requestError } = await admin
    .from("node_connect_requests")
    .select("uuid, device_id, node_ip, expires_at, consumed_at")
    .eq("uuid", uuid)
    .maybeSingle();

  if (requestError || !requestRow) {
    return res.status(404).json({ ok: false, error: "Unknown uuid" });
  }

  const deviceId = String(requestRow.device_id || "").trim();
  const nodeIp = String(requestRow.node_ip || "").trim();
  if (!deviceId) {
    return res.status(500).json({ ok: false, error: "Missing node mapping" });
  }

  if (requestRow.consumed_at) {
    // Even if the uuid was consumed, we must enforce "pair once".
    const { data: existingNode, error: existingNodeError } = await admin
      .from("nodes")
      .select("id, userId, nodeIp")
      .eq("deviceId", deviceId)
      .maybeSingle();

    if (existingNodeError || !existingNode) {
      console.error("nodes lookup error:", existingNodeError);
      return res.status(500).json({ ok: false, error: "Failed to link node" });
    }

    if (existingNode.userId !== user.id) {
      return res
        .status(409)
        .json({ ok: false, error: "This node is already connected to another user." });
    }

    return res.status(200).json({ ok: true, nodeIp: existingNode.nodeIp ?? nodeIp });
  }

  const expiresAt = new Date(requestRow.expires_at as string).getTime();
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    return res.status(410).json({ ok: false, error: "Expired uuid" });
  }

  // Link user to node: the client's persistent device id is the node
  // identifier, generated once on install and unrelated to its network
  // address. nodeIp is stored alongside it purely for display in the
  // dashboard — it's whatever address the network handed this connection,
  // not a stable identity, so it plays no part in ownership.
  //
  // Unpairing clears userId to NULL rather than deleting the row (see
  // /api/nodes/unpair), so a deviceId that has been paired before already has
  // a row here — possibly still owned by someone else, possibly free. Claim
  // by conditional update ("take it iff nobody owns it") instead of an
  // insert-if-missing upsert, which would silently no-op against that
  // existing row and leave it unowned.
  //
  // IMPORTANT: a node must not be paired to two different users at once.
  const nowIso = new Date().toISOString();

  const { data: claimedNode, error: claimError } = await admin
    .from("nodes")
    .update({ userId: user.id, isActive: true, nodeIp, updatedAt: nowIso })
    .eq("deviceId", deviceId)
    .is("userId", null)
    .select("id, userId, nodeIp")
    .maybeSingle();

  if (claimError) {
    console.error("nodes claim error:", claimError);
    return res.status(500).json({ ok: false, error: "Failed to link node" });
  }

  let existingNode = claimedNode;

  if (!existingNode) {
    // The conditional update matched nothing: either this deviceId has never
    // been seen before (insert it fresh), or it is already owned (by us,
    // idempotently, or by someone else).
    const { data: currentNode, error: lookupError } = await admin
      .from("nodes")
      .select("id, userId, nodeIp")
      .eq("deviceId", deviceId)
      .maybeSingle();

    if (lookupError) {
      console.error("nodes lookup error:", lookupError);
      return res.status(500).json({ ok: false, error: "Failed to link node" });
    }

    if (!currentNode) {
      const { data: insertedNode, error: insertError } = await admin
        .from("nodes")
        .insert({
          id: crypto.randomUUID(),
          deviceId,
          nodeIp,
          userId: user.id,
          isActive: true,
          updatedAt: nowIso,
          createdAt: nowIso,
          dailyEarnings: {},
        })
        .select("id, userId, nodeIp")
        .maybeSingle();

      if (insertError || !insertedNode) {
        console.error("nodes insert error:", insertError);
        return res.status(500).json({ ok: false, error: "Failed to link node" });
      }
      existingNode = insertedNode;
    } else {
      existingNode = currentNode;
    }
  }

  if (existingNode.userId !== user.id) {
    return res
      .status(409)
      .json({ ok: false, error: "This node is already connected to another user." });
  }

  const { error: consumeError } = await admin
    .from("node_connect_requests")
    .update({ consumed_at: nowIso, consumed_by: user.id })
    .eq("uuid", uuid)
    .is("consumed_at", null);

  if (consumeError) {
    console.error("node_connect_requests consume error:", consumeError);
    // Node linked already; still return success.
  }

  return res.status(200).json({ ok: true, nodeIp: existingNode.nodeIp ?? nodeIp });
}
