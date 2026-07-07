import React from "react";
import Link from "next/link";
import { Activity, MapPin, Wifi, Clock, HardDrive, Server, Plus, ArrowRight } from "lucide-react";
import { NodeStats } from "@/types";
import { cn } from "@/lib/utils";
import { buildDownloadPagePath } from "@/lib/turboClientDownload";

interface NodeStatusProps {
  nodeStats: NodeStats[] | null;
  isConnected: boolean;
}

export function NodeStatus({ nodeStats, isConnected }: NodeStatusProps) {
  const nodes = nodeStats || [];

  const formatUptime = (uptimeMinutes: number) => {
    const hours = Math.floor(uptimeMinutes / 60);
    const minutes = uptimeMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const onlineCount = nodes.filter((n) => n.isActive && n.isConnected).length;

  if (nodes.length === 0) {
    return (
      <div className="h-full rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm p-5 flex flex-col">
        <div className="shrink-0 flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-neutral-500" />
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Nodes
          </h3>
          <span className="ml-auto text-lg font-semibold text-white tabular-nums">
            0
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-14 h-14 bg-neutral-800/80 rounded-2xl flex items-center justify-center mb-4 border border-neutral-700/80">
            <Wifi className="w-6 h-6 text-neutral-600" />
          </div>
          <p className="text-sm font-medium text-neutral-300 mb-1">
            No nodes connected
          </p>
          <p className="text-xs text-neutral-500 max-w-[200px]">
            Install the Turbo client to register your first node
          </p>
          <Link
            href={buildDownloadPagePath()}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/60 px-5 py-2.5 text-sm font-medium text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Download client
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm p-4 sm:p-5 flex flex-col">
      <div className="shrink-0 flex items-center gap-2 mb-4">
        <Server className="w-4 h-4 text-orange-400" />
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
          Nodes
        </h3>
        <div className="ml-auto flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-white tabular-nums">
            {onlineCount}
          </span>
          <span className="text-sm text-neutral-600 tabular-nums">
            / {nodes.length}
          </span>
          <span
            className={cn(
              "ml-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md",
              isConnected && onlineCount > 0
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-neutral-500 bg-neutral-800/50",
            )}
          >
            online
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto pr-0.5">
        {nodes.map((node, index) => {
          const online = node.isActive && node.isConnected;
          return (
            <div
              key={node.id}
              className={cn(
                "rounded-lg border p-3.5 transition-colors",
                online
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-neutral-800 bg-neutral-950/30",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        online ? "bg-emerald-400" : "bg-neutral-600",
                      )}
                    />
                    {online && (
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-40" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">
                    Node {index + 1}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md",
                    online
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-neutral-500 bg-neutral-800/50",
                  )}
                >
                  {online ? "online" : "offline"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <MapPin className="w-3 h-3 shrink-0 text-neutral-600" />
                  <span className="truncate">{node.location || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Clock className="w-3 h-3 shrink-0 text-neutral-600" />
                  <span>{formatUptime(node.uptimeMinutes || 0)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <HardDrive className="w-3 h-3 shrink-0 text-neutral-600" />
                  <span>
                    <span className="text-neutral-300 tabular-nums">
                      {node.bandwidthUsed?.toFixed(2) || "0.00"}
                    </span>{" "}
                    GB
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Activity className="w-3 h-3 shrink-0 text-neutral-600" />
                  <span>
                    <span className="text-neutral-300 tabular-nums">
                      {(node.requestCount || 0).toLocaleString()}
                    </span>{" "}
                    req
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href={buildDownloadPagePath()}
        className="shrink-0 mt-3 pt-3 border-t border-neutral-800/60 flex w-full items-center justify-center gap-1.5 text-[11px] text-neutral-600 hover:text-orange-400/80 transition-colors"
      >
        <Plus className="w-3 h-3" />
        Deploy more nodes
      </Link>
    </div>
  );
}
