import { useCallback, useEffect, useState } from "react";
import { Loader2, Server, RefreshCw } from "lucide-react";
import { CopyCommand } from "./CopyCommand";
import { PANEL_CLASS, PanelTitle } from "@/components/dashboard/ui";
import { useAuth } from "@/hooks/useAuth";
import { buildHeadlessInstallCommand } from "@/lib/turboClientDownload";
import { cn } from "@/lib/utils";

interface MintedToken {
  command: string;
  expiresAt: number;
}

function formatRemaining(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

/**
 * Generates a one-off terminal command that installs a node and pairs it to
 * this account — for machines with no browser to complete the usual /connect
 * flow on.
 *
 * The token is minted on click rather than on render: it is single-use and
 * expires in minutes, so producing one per page view would leave a trail of
 * dead rows and a stale command on screen.
 */
export function InstallTokenCommand({ className }: { className?: string }) {
  const { session } = useAuth();
  const [baseUrl, setBaseUrl] = useState("https://turbo.network");
  const [minted, setMinted] = useState<MintedToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Drives the countdown, and only while there is one to show.
  useEffect(() => {
    if (!minted) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [minted]);

  const generate = useCallback(async () => {
    if (!session?.access_token) {
      setError("Your session expired. Sign in again to generate a command.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/connect/install-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await response.json().catch(() => ({}))) as {
        token?: string;
        expiresAt?: string;
        error?: string;
      };

      if (!response.ok || !data.token) {
        throw new Error(data.error ?? "Could not generate an install command");
      }

      setMinted({
        command: buildHeadlessInstallCommand(baseUrl, data.token),
        expiresAt: data.expiresAt ? Date.parse(data.expiresAt) : Date.now(),
      });
      setNow(Date.now());
    } catch (err) {
      console.error("install token error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, session?.access_token]);

  const remaining = minted ? minted.expiresAt - now : 0;
  const expired = Boolean(minted) && remaining <= 0;

  return (
    <section className={cn(PANEL_CLASS, "p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        <Server className="w-4 h-4 mt-1 shrink-0 text-orange-400" />
        <div className="min-w-0">
          <PanelTitle>Headless server</PanelTitle>
          <p className="text-xs text-neutral-500 mt-2">
            One command to install a node on a Linux or macOS machine and pair it
            to your account — no browser needed on that machine. It runs in the
            background and starts again on boot.
          </p>
        </div>
      </div>

      {minted && !expired && (
        <div className="mt-4">
          <CopyCommand command={minted.command} label="Run this on your server" />
          <p className="mt-2 text-xs text-neutral-500">
            Single use, expires in {formatRemaining(remaining)}.
          </p>
        </div>
      )}

      {expired && (
        <p className="mt-4 text-xs text-amber-400/90">
          That command has expired. Generate a new one to pair another machine.
        </p>
      )}

      {error && <p className="mt-4 text-xs text-red-400/90">{error}</p>}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
          "border border-neutral-700 bg-neutral-800/80 text-neutral-200",
          "hover:text-white hover:border-neutral-600 hover:bg-neutral-700/80",
          "disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
        )}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          minted && <RefreshCw className="w-3.5 h-3.5" />
        )}
        {minted ? "Generate a new command" : "Generate install command"}
      </button>
    </section>
  );
}
