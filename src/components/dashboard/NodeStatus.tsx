import React from "react";
import Link from "next/link";
import { Activity, MapPin, Wifi, Clock, HardDrive, Plus, ArrowRight } from "lucide-react";
import { PANEL_CLASS, PanelTitle, pill } from "./ui";
import { NodeStats } from "@/types";
import { cn, formatUptime } from "@/lib/utils";

interface NodeStatusProps {
  nodeStats: NodeStats[] | null;
  hasData: boolean;
}

export function NodeStatus({ nodeStats, hasData }: NodeStatusProps) {
  const nodes = nodeStats || [];

  const onlineCount = nodes.filter((n) => n.isActive && n.isConnected).length;

  if (nodes.length === 0) {
    return (
      <div className={cn(PANEL_CLASS, "h-full p-5 flex flex-col")}>
        <div className="shrink-0 flex items-center justify-between gap-2 mb-4">
          <PanelTitle as="h3">Your nodes</PanelTitle>
          <span className="text-lg font-semibold text-white tabular-nums">0</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-14 h-14 bg-neutral-800/80 rounded-full flex items-center justify-center mb-4 border border-neutral-700/80">
            <Wifi className="w-6 h-6 text-neutral-600" />
          </div>
          <p className="text-sm font-medium text-neutral-300 mb-1">
            No nodes connected
          </p>
          <p className="text-xs text-neutral-500 max-w-[220px]">
            Install the Turbo client to register your first node
          </p>
          <Link
            href="/dashboard/download"
            className={cn(pill({ size: "lg" }), "mt-5 w-full max-w-xs")}
          >
            Download client
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(PANEL_CLASS, "h-full p-4 sm:p-5 flex flex-col")}>
      <div className="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
        <PanelTitle as="h3">Your nodes</PanelTitle>

        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-white tabular-nums">
            {onlineCount}
          </span>
          <span className="text-sm text-neutral-600 tabular-nums">
            / {nodes.length}
          </span>
          <span
            className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              hasData && onlineCount > 0
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-neutral-500 bg-neutral-800/50",
            )}
          >
            online
          </span>
        </div>

        <Link
          href="/dashboard/nodes"
          className={cn(pill({ variant: "soft", size: "xs" }), "ml-auto")}
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto pr-0.5">
        {nodes.map((node) => {
          const online = node.isActive && node.isConnected;
          return (
            <div
              key={node.id}
              className={cn(
                "rounded-2xl border p-3.5 transition-colors",
                online
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-neutral-800 bg-neutral-950/30",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
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
                  <span className="text-sm font-medium text-white font-mono truncate">
                    {node.nodeIp || "Unknown IP"}
                  </span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
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
        href="/dashboard/download"
        className={cn(pill({ variant: "secondary", size: "sm", full: true }), "shrink-0 mt-3")}
      >
        <Plus className="w-3.5 h-3.5" />
        Deploy more nodes
      </Link>
    </div>
  );
}
