import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Loader2, MapPin, Unlink, Wifi, X } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { PillButton, pill } from "@/components/dashboard/ui";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { NodeStats } from "@/types";
import { cn, formatUptime } from "@/lib/utils";

interface NodesTableProps {
  nodes: NodeStats[] | null;
}

export function NodesTable({ nodes: nodeStats }: NodesTableProps) {
  const nodes = nodeStats || [];
  const onlineCount = nodes.filter((n) => n.isActive && n.isConnected).length;

  const { session } = useAuth();
  const { refetch } = useSupabaseRealtime();
  const [unpairTarget, setUnpairTarget] = useState<NodeStats | null>(null);
  const [unpairing, setUnpairing] = useState(false);
  const [unpairError, setUnpairError] = useState<string | null>(null);

  useEffect(() => {
    if (!unpairTarget) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setUnpairTarget(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [unpairTarget]);

  const handleUnpair = async () => {
    if (!unpairTarget || !session?.access_token) return;
    setUnpairing(true);
    setUnpairError(null);
    try {
      const response = await fetch("/api/nodes/unpair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ nodeId: unpairTarget.id }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to unpair node");
      }

      setUnpairTarget(null);
      await refetch();
    } catch (err) {
      setUnpairError(err instanceof Error ? err.message : "Failed to unpair node");
    } finally {
      setUnpairing(false);
    }
  };

  return (
    <SettingsPanel
      title="Your nodes"
      description={`${onlineCount} / ${nodes.length} nodes online.`}
    >
      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-neutral-800/80 rounded-full flex items-center justify-center mb-4 border border-neutral-700/80">
            <Wifi className="w-6 h-6 text-neutral-600" />
          </div>
          <p className="text-sm font-medium text-neutral-300 mb-1">
            No nodes connected
          </p>
          <p className="text-xs text-neutral-500 max-w-[240px] mb-4">
            Install the Turbo client to register your first node
          </p>
          <Link href="/dashboard/download" className={pill({ size: "lg" })}>
            Download client
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-neutral-500 border-b border-neutral-800">
                <th className="px-2 py-2 font-normal">Node</th>
                <th className="px-2 py-2 font-normal">Location</th>
                <th className="px-2 py-2 font-normal text-right">Uptime</th>
                <th className="px-2 py-2 font-normal text-right">Bandwidth</th>
                <th className="px-2 py-2 font-normal text-right">Requests</th>
                <th className="px-2 py-2 font-normal text-right">Status</th>
                <th className="px-2 py-2 font-normal text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                const online = node.isActive && node.isConnected;
                return (
                  <tr key={node.id} className="border-b border-neutral-800/60 last:border-0">
                    <td className="px-2 py-3 text-neutral-300 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            online ? "bg-emerald-400" : "bg-neutral-600",
                          )}
                        />
                        {node.nodeIp || "Unknown IP"}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0 text-neutral-600" />
                        {node.location || "Unknown"}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right text-neutral-300 tabular-nums">
                      {formatUptime(node.uptimeMinutes || 0)}
                    </td>
                    <td className="px-2 py-3 text-right text-neutral-300 tabular-nums">
                      {node.bandwidthUsed?.toFixed(2) || "0.00"} GB
                    </td>
                    <td className="px-2 py-3 text-right text-neutral-300 tabular-nums">
                      {(node.requestCount || 0).toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider",
                          online
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                            : "text-neutral-500 bg-neutral-800/50 border border-neutral-700",
                        )}
                      >
                        {online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setUnpairError(null);
                          setUnpairTarget(node);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-500 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Unlink className="w-3 h-3" />
                        Unpair
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {unpairTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4"
          onClick={() => !unpairing && setUnpairTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unpair-node-title"
            className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-6 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setUnpairTarget(null)}
              disabled={unpairing}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-red-400/90 mb-1">
                  // confirm_unpair
                </p>
                <h3 id="unpair-node-title" className="text-lg font-semibold text-white">
                  Unpair {unpairTarget.nodeIp || "this node"}?
                </h3>
                <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                  This node will stop earning rewards on your account and will
                  need to be paired again from scratch to reconnect.
                </p>
              </div>
            </div>

            {unpairError && (
              <p className="mb-4 text-sm text-red-400">{unpairError}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <PillButton
                variant="secondary"
                onClick={() => setUnpairTarget(null)}
                disabled={unpairing}
              >
                Cancel
              </PillButton>
              <PillButton
                variant="danger"
                onClick={handleUnpair}
                disabled={unpairing}
              >
                {unpairing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Unlink className="w-4 h-4" />
                    Unpair node
                  </>
                )}
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </SettingsPanel>
  );
}
