import { Loader2 } from "lucide-react";
import Link from "next/link";
import { StepCard } from "../StepCard";
import { OSLogo } from "../ui/OSLogos";
import { TurboDownloadButton } from "@/components/shared/TurboDownloadButton";
import type { StepState } from "@/hooks/useOnboardingProgress";
import type { Platform } from "@/hooks/useTurboDownload";
import { cn } from "@/lib/utils";

import { buildDownloadPagePath } from "@/lib/turboClientDownload";

interface DownloadStepProps {
  state: StepState;
  platform: Platform;
  currentPlatform: Platform;
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
  currentPlatform,
  osName,
  isDownloading,
  isReady,
  downloadError,
  onDownload,
}: DownloadStepProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";
  const shouldUseDownloadPageForRedownload =
    isComplete && currentPlatform !== platform;

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
                href={buildDownloadPagePath("onboarding")}
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
            {shouldUseDownloadPageForRedownload ? (
              <Link
                href={buildDownloadPagePath("onboarding")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 w-full px-3 py-1.5 rounded-full",
                  "border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-600",
                  "text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                )}
              >
                Download again
              </Link>
            ) : (
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
            )}
            <p className="text-[11px] sm:text-xs text-neutral-500 text-center">
              <Link
                href={buildDownloadPagePath("onboarding")}
                className="text-orange-400/80 hover:text-orange-400 underline underline-offset-2"
              >
                Other platforms
              </Link>
            </p>
          </div>
        ) : (
          <>
            <TurboDownloadButton
              onClick={onDownload}
              disabled={!isReady || isLocked}
              isDownloading={isDownloading}
              platform={platform}
              label={isDownloading ? "Downloading…" : `Download for ${osName}`}
              size="sm"
            />
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
