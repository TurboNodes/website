import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAsUser, getUserFromRequest } from "@/lib/apiAuth";
import { anonymizeReferralUser, buildReferralLink } from "@/lib/referrals";
import { calculateTotalEarnings } from "@/lib/utils";
import type { NodeStats, ReferralEarningEntry, ReferralStats, ReferredUser } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user, accessToken, error: authError } = await getUserFromRequest(req);
  if (!user || !accessToken || authError) {
    return res.status(401).json({ error: authError ?? "Unauthorized" });
  }

  try {
    const supabase = getSupabaseAsUser(accessToken);
    const origin =
      typeof req.headers.origin === "string"
        ? req.headers.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "https://turbo.network";

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("referralCode, referralBalance")
      .eq("id", user.id)
      .single();

    if (userError || !userRow?.referralCode) {
      console.error("Referral stats user fetch error:", userError);
      return res.status(500).json({ error: "Failed to load referral profile" });
    }

    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("id, referredId, earningsCommissionedThrough, createdAt")
      .eq("referrerId", user.id)
      .order("createdAt", { ascending: false });

    if (referralsError) {
      console.error("Referral stats referrals fetch error:", referralsError);
      return res.status(500).json({ error: "Failed to load referrals" });
    }

    const referredIds = (referrals ?? []).map((r) => r.referredId);

    const referredUsersMap = new Map<
      string,
      { username?: string | null; email?: string | null; nodes: NodeStats[] }
    >();

    if (referredIds.length > 0) {
      const { data: referredUserRows } = await supabase
        .from("users")
        .select("id, username, email")
        .in("id", referredIds);

      const { data: referredNodes } = await supabase
        .from("nodes")
        .select("id, userId, dailyEarnings, isActive, createdAt, updatedAt")
        .in("userId", referredIds);

      for (const row of referredUserRows ?? []) {
        referredUsersMap.set(row.id, {
          username: row.username,
          email: row.email,
          nodes: [],
        });
      }

      for (const node of referredNodes ?? []) {
        const entry = referredUsersMap.get(node.userId);
        if (!entry) continue;
        entry.nodes.push({
          id: node.id,
          userId: node.userId,
          isActive: node.isActive ?? false,
          dailyEarnings: node.dailyEarnings ?? {},
          createdAt: new Date(node.createdAt),
          updatedAt: new Date(node.updatedAt),
        });
      }
    }

    const { data: earningsRows, error: earningsError } = await supabase
      .from("referral_earnings")
      .select("id, referredId, type, amount, sourceEarningsDelta, createdAt")
      .eq("referrerId", user.id)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (earningsError) {
      console.error("Referral stats earnings fetch error:", earningsError);
      return res.status(500).json({ error: "Failed to load referral earnings" });
    }

    const { data: allEarnings, error: totalsError } = await supabase
      .from("referral_earnings")
      .select("referredId, type, amount")
      .eq("referrerId", user.id);

    if (totalsError) {
      console.error("Referral stats totals fetch error:", totalsError);
      return res.status(500).json({ error: "Failed to load referral totals" });
    }

    const commissionByReferred = new Map<string, number>();
    let commissionTotal = 0;

    for (const row of allEarnings ?? []) {
      if (row.type !== "commission") continue;
      const amount = Number(row.amount) || 0;
      commissionTotal += amount;
      commissionByReferred.set(
        row.referredId,
        (commissionByReferred.get(row.referredId) ?? 0) + amount,
      );
    }

    const referredUsers: ReferredUser[] = (referrals ?? []).map((ref) => {
      const profile = referredUsersMap.get(ref.referredId);
      const totalEarnings = profile ? calculateTotalEarnings(profile.nodes) : 0;

      return {
        id: ref.referredId,
        label: anonymizeReferralUser(profile?.username, profile?.email),
        status: totalEarnings > 0 ? "active" : "pending",
        totalEarnings,
        commissionEarned: commissionByReferred.get(ref.referredId) ?? 0,
        joinedAt: ref.createdAt,
      };
    });

    const recentEarnings: ReferralEarningEntry[] = (earningsRows ?? []).map((row) => ({
      id: row.id,
      type: row.type as ReferralEarningEntry["type"],
      amount: Number(row.amount) || 0,
      sourceEarningsDelta: row.sourceEarningsDelta != null ? Number(row.sourceEarningsDelta) : null,
      referredId: row.referredId,
      createdAt: row.createdAt,
    }));

    const stats: ReferralStats = {
      referralCode: userRow.referralCode,
      referralLink: buildReferralLink(userRow.referralCode, origin),
      referralBalance: Number(userRow.referralBalance) || 0,
      commissionTotal,
      totalReferred: referredUsers.length,
      activeReferred: referredUsers.filter((u) => u.status === "active").length,
      referredUsers,
      recentEarnings,
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error("Referral stats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
