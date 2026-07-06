import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useAuth } from "@/hooks/useAuth";
import { AuthButtons } from "@/components/AuthButtons";
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
  const { isAuthenticated, loading: authLoading } = useAuth();
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

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <LoadingState
        message={
          authLoading
            ? "Please wait while we verify your authentication."
            : "Fetching your node data..."
        }
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthShell title="Sign In | Turbo">
        <AuthCard>
          <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
            // sign_in
          </p>
          <h1
            className="text-white leading-tight mb-3"
            style={{
              fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            }}
          >
            Access your dashboard.
          </h1>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Sign in to view your node stats, earnings, and withdraw funds.
          </p>
          <AuthButtons layout="column" />
        </AuthCard>
      </AuthShell>
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
