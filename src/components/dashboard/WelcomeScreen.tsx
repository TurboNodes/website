import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, X } from "lucide-react";
import { useTurboDownload } from "@/hooks/useTurboDownload";
import { CLIENT_NODE_ACTIONS_URL } from "@/lib/turboClientDownload";
import { OSLogo } from "@/components/landing/ui/OSLogos";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  showPopup?: boolean;
  onClosePopup?: () => void;
}

export function WelcomeScreen({ showPopup = false, onClosePopup }: WelcomeScreenProps) {
  const { platform, osName, isDownloading, download, isReady, downloadError } =
    useTurboDownload();

  const content = (
    <div className="text-center">
      <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4">
        {showPopup ? "// no_node" : "// get_started"}
      </p>
      <h2
        className="text-white leading-tight mb-4"
        style={{
          fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
        }}
      >
        {showPopup ? "No node connected." : "Set up your node."}
      </h2>
      <p className="text-sm text-neutral-400 mb-8 max-w-sm mx-auto leading-relaxed">
        {showPopup
          ? "Download and install the Turbo client to start earning from your unused bandwidth."
          : "Install the Turbo client on your machine to start sharing idle bandwidth and earning rewards."}
      </p>

      <div className="space-y-4">
        <button
          onClick={download}
          disabled={!isReady}
          aria-busy={isDownloading}
          className={cn(
            "group inline-flex items-center justify-between pl-5 pr-1.5 py-2",
            "rounded-full font-medium text-base",
            isDownloading
              ? "pointer-events-none cursor-wait bg-gradient-to-r from-neutral-800 to-neutral-800 text-neutral-500 shadow-none"
              : cn(
                  "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500",
                  "disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500",
                  "disabled:cursor-not-allowed text-white",
                  "shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30",
                ),
            showPopup ? "w-full" : "mx-auto w-[320px]",
          )}
        >
          <span className="flex items-center gap-2.5">
            <span className="relative flex w-5 h-5 shrink-0 items-center justify-center">
              <Loader2
                className={cn(
                  "absolute w-5 h-5",
                  isDownloading ? "animate-spin opacity-100" : "opacity-0",
                )}
              />
              <span className={cn("absolute", isDownloading && "opacity-0")}>
                <OSLogo platform={platform} />
              </span>
            </span>
            <span className="min-w-[9.5rem] text-left">
              {isDownloading ? "Downloading…" : `Download for ${osName}`}
            </span>
          </span>
          <span
            className={cn(
              "flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/25",
              isDownloading && "opacity-0",
            )}
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </span>
        </button>

        {downloadError && (
          <p className="text-xs text-red-400/90">{downloadError}</p>
        )}

        {platform && (
          <p className="text-xs text-neutral-500">
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

        {showPopup && onClosePopup && (
          <button
            onClick={onClosePopup}
            className="w-full rounded-full border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-600 px-6 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            I&apos;ll set up later
          </button>
        )}
      </div>
    </div>
  );

  if (showPopup) {
    return (
      <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-8 max-w-md w-full shadow-2xl shadow-black/50">
          {onClosePopup && (
            <button
              onClick={onClosePopup}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">{content}</div>
      </div>
      <p className="text-center text-[11px] font-mono text-neutral-600 pb-8">
        // earn_from_idle_bandwidth
      </p>
    </div>
  );
}
