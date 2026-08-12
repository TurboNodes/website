import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { NodeStats, UserStats } from "@/types";
import {
  extractEarningsHistory,
  calculateTodayEarnings,
  calculateTotalEarnings,
} from "@/lib/utils";

interface SupabaseRealtimeContextValue {
  userStats: UserStats | null;
  nodeStats: NodeStats[] | null;
  earningsHistory: number[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasNodeData: boolean | null;
  refetch: () => Promise<void>;
}

const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextValue | null>(null);

export function SupabaseRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [nodeStats, setNodeStats] = useState<NodeStats[] | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNodeData, setHasNodeData] = useState<boolean | null>(null);
  const fetchIdRef = useRef(0);
  const userIdRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  const fetchData = useCallback(async (showLoading: boolean) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const fetchId = ++fetchIdRef.current;

    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (cancelledRef.current || fetchId !== fetchIdRef.current) return;

      if (userError && userError.code !== "PGRST116") {
        console.error("User fetch error:", userError);
        setError(`User data error: ${userError.message}`);
        return;
      }

      const { data: nodesData, error: nodesError } = await supabase
        .from("nodes")
        .select("*")
        .eq("userId", userId);

      if (cancelledRef.current || fetchId !== fetchIdRef.current) return;

      if (nodesError) {
        console.error("Nodes fetch error:", nodesError);
        setError(`Nodes data error: ${nodesError.message}`);
        return;
      }

      if (userData && nodesData) {
        const userStatsData: UserStats = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          totalEarnings: Number(userData.totalEarnings) || 0,
          todayEarnings: Number(userData.todayEarnings) || 0,
          createdAt: new Date(userData.createdAt),
          nodes: [],
        };

        const nodesStatsData: NodeStats[] = nodesData.map((node: Record<string, unknown>) => ({
          id: node.id as string,
          isActive: (node.isActive as boolean) ?? false,
          nodeIp: (node.nodeIp as string | null) ?? null,
          dailyEarnings: (node.dailyEarnings as Record<string, number>) || {},
          bandwidthUsed: node.bandwidthUsed as number,
          uptimeMinutes: node.uptimeMinutes as number,
          createdAt: new Date(node.createdAt as string),
          updatedAt: new Date(node.updatedAt as string),
          userId: node.userId as string,
          isConnected:
            (node.isActive as boolean) &&
            Date.now() - new Date(node.updatedAt as string).getTime() < 5 * 1000 * 60,
          // Both are written by the Turbo server, the only side that sees a
          // node's traffic or resolves its country. A node that has not
          // reported yet simply has nothing stored for them.
          location: (node.location as string | null) || "Unknown",
          requestCount: Number(node.requestCount ?? 0),
        }));

        userStatsData.totalEarnings = calculateTotalEarnings(nodesStatsData);
        userStatsData.todayEarnings = calculateTodayEarnings(nodesStatsData);
        userStatsData.nodes = nodesStatsData;

        setUserStats(userStatsData);
        setNodeStats(nodesStatsData);
        setHasNodeData(nodesStatsData.length > 0);

        const history = extractEarningsHistory(nodesStatsData);
        setEarningsHistory(history);
      } else if (!userData) {
        setUserStats(null);
        setNodeStats([]);
        setEarningsHistory([0, 0, 0, 0, 0, 0, 0]);
        setHasNodeData(false);
      }
    } catch (err) {
      if (cancelledRef.current || fetchId !== fetchIdRef.current) return;
      console.error("Error in fetchData:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (fetchId === fetchIdRef.current && !cancelledRef.current) {
        if (showLoading) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      userIdRef.current = null;
      setUserStats(null);
      setNodeStats(null);
      setLoading(false);
      setError(null);
      setHasNodeData(null);
      return;
    }

    userIdRef.current = user.id;
    cancelledRef.current = false;

    void fetchData(true);

    return () => {
      cancelledRef.current = true;
      fetchIdRef.current += 1;
    };
  }, [user?.id, isAuthenticated, authLoading, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const value: SupabaseRealtimeContextValue = {
    userStats,
    nodeStats,
    earningsHistory,
    loading: authLoading || loading,
    refreshing,
    error,
    hasNodeData,
    refetch,
  };

  return (
    <SupabaseRealtimeContext.Provider value={value}>{children}</SupabaseRealtimeContext.Provider>
  );
}

export function useSupabaseRealtimeContext(): SupabaseRealtimeContextValue {
  const context = useContext(SupabaseRealtimeContext);
  if (!context) {
    throw new Error("useSupabaseRealtime must be used within a SupabaseRealtimeProvider");
  }
  return context;
}
