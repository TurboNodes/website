import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DownloadOptions } from "@/components/download/DownloadOptions";
import { InstallTokenCommand } from "@/components/download/InstallTokenCommand";
import {
  getOSName,
  needsExecutableBit,
  type Platform,
} from "@/lib/turboClientDownload";

type SupportedPlatform = Exclude<Platform, "" | "unknown">;

export default function DashboardDownloadPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const [justDownloaded, setJustDownloaded] = useState<SupportedPlatform | null>(null);

  if (authLoading || !isAuthenticated) {
    return (
      <AuthShell title="Loading... | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Loading Download</h1>
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
      title="Download | Turbo"
      heading="Download"
      description="Install the Turbo client to register a new node — desktop, terminal, or Docker."
    >
      {justDownloaded && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Download started for {getOSName(justDownloaded)}.{" "}
          {needsExecutableBit(justDownloaded)
            ? "Make it executable with chmod +x and run it, then check the"
            : "Run the installer, then check the"}{" "}
          <Link href="/dashboard/nodes" className="underline underline-offset-2">
            Nodes page
          </Link>{" "}
          once it comes online.
        </div>
      )}

      {/* Above the download picker: a headless box has no browser to finish
          pairing in, so it cannot use any of the options below without help. */}
      <InstallTokenCommand className="mb-5" />

      <DownloadOptions layout="wide" onDownloaded={setJustDownloaded} />
    </DashboardShell>
  );
}
