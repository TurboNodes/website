import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ReferralStats } from "@/types";

export function useReferrals() {
  const { isAuthenticated, session } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/referrals/stats", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load referral stats");
      }

      const data = (await response.json()) as ReferralStats;
      setStats(data);
    } catch (err) {
      console.error("useReferrals error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session?.access_token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    referralBalance: stats?.referralBalance ?? 0,
  };
}
