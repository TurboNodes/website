import React from "react";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NodesTable } from "@/components/dashboard/NodesTable";

export default function NodesPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const { nodeStats, loading } = useSupabaseRealtime();

  if (authLoading || !isAuthenticated) {
    return (
      <AuthShell title="Loading... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Loading Nodes</h1>
          <p className="text-sm text-neutral-400">
            {authLoading
              ? "Please wait while we verify your authentication."
              : "Redirecting to sign in..."}
          </p>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <DashboardShell
      title="Nodes | Turbo"
      heading="Nodes"
      description="All nodes registered to your account and their current status."
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading nodes…
        </div>
      ) : (
        <NodesTable nodes={nodeStats} />
      )}
    </DashboardShell>
  );
}
