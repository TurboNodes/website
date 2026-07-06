import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
  error: string | null;
  isConnected: boolean;
  hasNodeData: boolean | null;
}

const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextValue | null>(null);

export function SupabaseRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [nodeStats, setNodeStats] = useState<NodeStats[] | null>(null);
  const [earningsHistory, setEarningsHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNodeData, setHasNodeData] = useState<boolean | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setUserStats(null);
      setNodeStats(null);
      setLoading(false);
      setError(null);
      setHasNodeData(null);
      setIsConnected(false);
      return;
    }

    const userId = user.id;
    let cancelled = false;

    async function fetchData(showLoading: boolean) {
      const fetchId = ++fetchIdRef.current;

      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (cancelled || fetchId !== fetchIdRef.current) return;

        if (userError && userError.code !== "PGRST116") {
          console.error("User fetch error:", userError);
          setError(`User data error: ${userError.message}`);
          setHasNodeData(null);
          return;
        }

        const { data: nodesData, error: nodesError } = await supabase
          .from("nodes")
          .select("*")
          .eq("userId", userId);

        if (cancelled || fetchId !== fetchIdRef.current) return;

        if (nodesError) {
          console.error("Nodes fetch error:", nodesError);
          setError(`Nodes data error: ${nodesError.message}`);
          setHasNodeData(null);
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
            dailyEarnings: (node.dailyEarnings as Record<string, number>) || {},
            bandwidthUsed: node.bandwidthUsed as number,
            uptimeMinutes: node.uptimeMinutes as number,
            createdAt: new Date(node.createdAt as string),
            updatedAt: new Date(node.updatedAt as string),
            userId: node.userId as string,
            isConnected:
              (node.isActive as boolean) &&
              Date.now() - new Date(node.updatedAt as string).getTime() < 5 * 1000 * 60,
            location: "Unknown",
            requestCount: 0,
          }));

          userStatsData.totalEarnings = calculateTotalEarnings(nodesStatsData);
          userStatsData.todayEarnings = calculateTodayEarnings(nodesStatsData);
          userStatsData.nodes = nodesStatsData;

          setUserStats(userStatsData);
          setNodeStats(nodesStatsData);
          setHasNodeData(nodesStatsData.length > 0);

          const history = extractEarningsHistory(nodesStatsData);
          setEarningsHistory(history);

          setIsConnected(true);
        } else {
          setUserStats(null);
          setNodeStats([]);
          setEarningsHistory([0, 0, 0, 0, 0, 0, 0]);
          setHasNodeData(false);
          setIsConnected(true);
        }
      } catch (err) {
        if (cancelled || fetchId !== fetchIdRef.current) return;
        console.error("Error in fetchData:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setHasNodeData(null);
      } finally {
        if (showLoading && fetchId === fetchIdRef.current && !cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchData(true);

    const channel = supabase
      .channel(`node-data-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "nodes",
          filter: `userId=eq.${userId}`,
        },
        () => {
          void fetchData(false);
        },
      )
      .subscribe((status) => {
        if (!cancelled) {
          setIsConnected(status === "SUBSCRIBED");
        }
      });

    return () => {
      cancelled = true;
      fetchIdRef.current += 1;
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated, authLoading]);

  const value: SupabaseRealtimeContextValue = {
    userStats,
    nodeStats,
    earningsHistory,
    loading: authLoading || loading,
    error,
    isConnected,
    hasNodeData,
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
