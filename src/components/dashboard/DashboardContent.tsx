import React from "react";
import { Coins, TrendingUp, Activity, Zap } from "lucide-react";
import { EarningsChart } from "./EarningsChart";
import { StatsCard } from "./StatsCard";
import { NodeStatus } from "./NodeStatus";
import { NodeStats, UserStats } from "@/types";

interface DashboardContentProps {
  userStats: UserStats | null;
  nodeStats: NodeStats[] | null;
  earningsHistory: number[];
  loading: boolean;
  error: string | null;
  supabaseConnected: boolean;
}

export function DashboardContent({
  userStats,
  nodeStats,
  earningsHistory,
  error,
  supabaseConnected,
}: DashboardContentProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatBytes = (bytes: number) => {
    if (bytes >= 1) {
      return `${bytes.toFixed(2)} GB`;
    }
    const mb = bytes * 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const totalBandwidth =
    nodeStats?.reduce((sum, node) => sum + (node.bandwidthUsed || 0), 0) || 0;
  const totalRequests =
    nodeStats?.reduce((sum, node) => sum + (node.requestCount || 0), 0) || 0;
  const weekTotal = earningsHistory.reduce((sum, v) => sum + v, 0);
  const avgDaily = earningsHistory.length
    ? weekTotal / earningsHistory.length
    : 0;

  return (
    <div className="h-full flex flex-col gap-5 p-5 sm:p-6 lg:p-8 overflow-hidden">
      {/* KPI strip */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={Coins}
          title="Total Earnings"
          value={formatCurrency(userStats?.totalEarnings || 0)}
          subtitle="Lifetime"
        />
        <StatsCard
          icon={TrendingUp}
          title="Today's Earnings"
          value={formatCurrency(userStats?.todayEarnings || 0)}
          subtitle="Since midnight UTC"
          accent="emerald"
        />
        <StatsCard
          icon={Activity}
          title="Bandwidth Used"
          value={formatBytes(totalBandwidth)}
          subtitle="Across all nodes"
        />
        <StatsCard
          icon={Zap}
          title="Requests Served"
          value={totalRequests.toLocaleString()}
          subtitle="Total handled"
        />
      </div>

      {/* Main panels */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-8 min-h-[280px] lg:min-h-0 flex flex-col">
          <EarningsChart
            data={earningsHistory}
            weekTotal={weekTotal}
            avgDaily={avgDaily}
          />
        </div>

        <div className="lg:col-span-4 min-h-[320px] lg:min-h-0 flex flex-col">
          <NodeStatus
            nodeStats={nodeStats}
            isConnected={supabaseConnected && !!userStats}
          />
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-950/90 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
