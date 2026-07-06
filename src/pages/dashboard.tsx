import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";

function LoadingState({ message }: { message: string }) {
  return (
    <AuthShell title="Loading... | Turbo">
      <AuthCard className="text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-white mb-2">Loading Dashboard</h1>
        <p className="text-sm text-neutral-400">{message}</p>
      </AuthCard>
    </AuthShell>
  );
}

export default function TurboNodeDashboard() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const {
    userStats,
    nodeStats,
    earningsHistory,
    loading,
    error,
    isConnected: supabaseConnected,
    hasNodeData,
  } = useSupabaseRealtime();

  const [showNoNodePopup, setShowNoNodePopup] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading && hasNodeData === false) {
      setShowNoNodePopup(true);
    } else {
      setShowNoNodePopup(false);
    }
  }, [isAuthenticated, loading, hasNodeData]);

  if (authLoading || !isAuthenticated) {
    return (
      <LoadingState
        message={
          authLoading
            ? "Please wait while we verify your authentication."
            : "Redirecting to sign in..."
        }
      />
    );
  }

  return (
    <DashboardShell title="Turbo Node Dashboard">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-semibold mb-2">Loading Dashboard</h1>
            <p className="text-sm text-neutral-400">Fetching your node data...</p>
          </div>
        </div>
      ) : !userStats ? (
        <WelcomeScreen />
      ) : (
        <DashboardContent
          userStats={userStats}
          nodeStats={nodeStats}
          earningsHistory={earningsHistory}
          loading={loading}
          error={error}
          supabaseConnected={supabaseConnected}
        />
      )}

      {showNoNodePopup && (
        <WelcomeScreen
          showPopup={true}
          onClosePopup={() => setShowNoNodePopup(false)}
        />
      )}
    </DashboardShell>
  );
}
