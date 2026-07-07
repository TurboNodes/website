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
    .select("uuid, node_ip, expires_at, consumed_at")
    .eq("uuid", uuid)
    .maybeSingle();

  if (requestError || !requestRow) {
    return res.status(404).json({ ok: false, error: "Unknown uuid" });
  }

  if (requestRow.consumed_at) {
    const nodeIp = String(requestRow.node_ip || "").trim();
    if (!nodeIp) {
      return res.status(500).json({ ok: false, error: "Missing node mapping" });
    }

    // Even if the uuid was consumed, we must enforce "pair once".
    const { data: existingNode, error: existingNodeError } = await admin
      .from("nodes")
      .select("id, userId, nodeIp")
      .eq("nodeIp", nodeIp)
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

    return res.status(200).json({ ok: true, nodeIp });
  }

  const expiresAt = new Date(requestRow.expires_at as string).getTime();
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    return res.status(410).json({ ok: false, error: "Expired uuid" });
  }

  const nodeIp = String(requestRow.node_ip || "").trim();
  if (!nodeIp) {
    return res.status(500).json({ ok: false, error: "Missing node mapping" });
  }

  // Link user to node: node IP is treated as the node identifier ("name"),
  // stored in nodes.nodeIp. nodes.id remains a UUID.
  //
  // IMPORTANT: a node must not be paired to two different users.
  // So we never "upsert userId" on conflict; we only insert if missing,
  // then we verify ownership.
  const nowIso = new Date().toISOString();
  const nodeId = crypto.randomUUID();

  const { error: upsertIgnoreError } = await admin.from("nodes").upsert(
    {
      id: nodeId,
      nodeIp,
      userId: user.id,
      isActive: true,
      updatedAt: nowIso,
      createdAt: nowIso,
      dailyEarnings: {},
    },
    { onConflict: "nodeIp", ignoreDuplicates: true },
  );

  if (upsertIgnoreError) {
    console.error("nodes upsert error:", upsertIgnoreError);
    return res.status(500).json({ ok: false, error: "Failed to link node" });
  }

  const { data: existingNode, error: existingNodeError } = await admin
    .from("nodes")
    .select("id, userId, nodeIp")
    .eq("nodeIp", nodeIp)
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

  const { error: consumeError } = await admin
    .from("node_connect_requests")
    .update({ consumed_at: nowIso, consumed_by: user.id })
    .eq("uuid", uuid)
    .is("consumed_at", null);

  if (consumeError) {
    console.error("node_connect_requests consume error:", consumeError);
    // Node linked already; still return success.
  }

  return res.status(200).json({ ok: true, nodeIp });
}

