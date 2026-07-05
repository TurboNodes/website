import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { StepCard } from "../StepCard";
import { OSLogo } from "../ui/OSLogos";
import type { StepState } from "@/hooks/useOnboardingProgress";
import type { Platform } from "@/hooks/useTurboDownload";
import { cn } from "@/lib/utils";

import { CLIENT_NODE_ACTIONS_URL } from "@/lib/turboClientDownload";

interface DownloadStepProps {
  state: StepState;
  platform: Platform;
  osName: string;
  isDownloading: boolean;
  isReady: boolean;
  downloadError?: string | null;
  onDownload: () => void;
}

function DownloadVisual({ platform }: { platform: Platform }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 p-2 w-full h-full">
      <div className="w-14 h-14 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
        <OSLogo platform={platform} />
      </div>
      <div className="w-24 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <div className="h-full w-2/3 bg-gradient-to-r from-orange-600 to-amber-400 rounded-full" />
      </div>
      <span className="text-[10px] text-neutral-500 font-mono">turbo-release</span>
    </div>
  );
}

export function DownloadStep({
  state,
  platform,
  osName,
  isDownloading,
  isReady,
  downloadError,
  onDownload,
}: DownloadStepProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";

  return (
    <StepCard
      step={1}
      title="Download"
      state={state}
      visual={<DownloadVisual platform={platform} />}
      description={
        <>
          <p>Get the Turbo client for {osName || "your device"}.</p>
          {platform && !isLocked && !isComplete && (
            <p className="text-neutral-500 mt-2.5 text-[11px] sm:text-xs">
              Not on {osName}?{" "}
              <Link
                href={CLIENT_NODE_ACTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400/80 hover:text-orange-400 underline underline-offset-2"
              >
                Other platforms
              </Link>
            </p>
          )}
        </>
      }
      actions={
        isComplete ? (
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onDownload}
              disabled={isDownloading || !isReady}
              className={cn(
                "inline-flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-full",
                "border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              )}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Downloading…
                </>
              ) : (
                "Download again"
              )}
            </button>
            <p className="text-[11px] sm:text-xs text-neutral-500 text-center">
              <Link
                href={CLIENT_NODE_ACTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400/80 hover:text-orange-400 underline underline-offset-2"
              >
                Download on GitHub
              </Link>
              {" "}for other platforms
            </p>
          </div>
        ) : (
          <>
          <button
            onClick={onDownload}
            disabled={isDownloading || !isReady || isLocked}
            className={cn(
              "group w-full inline-flex items-center justify-between pl-3.5 pr-1 py-1",
              "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500",
              "disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500",
              "disabled:cursor-not-allowed rounded-full text-white font-medium text-sm",
              "transition-all duration-200 active:scale-[0.97]",
              "shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            )}
          >
            <span className="flex items-center gap-2">
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading…
                </>
              ) : (
                <>
                  <OSLogo platform={platform} />
                  Download for {osName}
                </>
              )}
            </span>
            <span className="flex items-center justify-center w-7 h-7 bg-white/15 rounded-full group-hover:bg-white/25 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </button>
          {downloadError && (
            <p className="text-[11px] sm:text-xs text-red-400/90 text-center mt-2">
              {downloadError}
            </p>
          )}
          </>
        )
      }
    />
  );
}
