import { ArrowRight, Loader2 } from "lucide-react";
import { OSLogo } from "@/components/landing/ui/OSLogos";
import type { Platform } from "@/lib/turboClientDownload";
import { cn } from "@/lib/utils";

interface TurboDownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isDownloading: boolean;
  platform: Platform;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TurboDownloadButton({
  onClick,
  disabled = false,
  isDownloading,
  platform,
  label,
  className,
  size = "md",
}: TurboDownloadButtonProps) {
  const iconSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  const arrowSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const arrowCircleSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isDownloading}
      className={cn(
        "group inline-flex items-center justify-between rounded-full font-medium transition-colors duration-200",
        isDownloading
          ? "pointer-events-none cursor-wait bg-gradient-to-r from-neutral-800 to-neutral-800 text-neutral-500 shadow-none"
          : cn(
              "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500",
              "disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-500",
              "disabled:cursor-not-allowed text-white",
              "shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:shadow-none",
            ),
        size === "sm" && "w-full pl-3.5 pr-1 py-1 text-sm",
        size === "md" && "w-full pl-4 pr-1.5 py-2 text-sm",
        size === "lg" && "pl-5 pr-1.5 py-2 text-base",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center",
            iconSize,
          )}
        >
          <Loader2
            className={cn(
              "absolute animate-spin",
              iconSize,
              !isDownloading && "opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute flex items-center justify-center",
              isDownloading && "opacity-0",
            )}
          >
            <OSLogo platform={platform} />
          </span>
        </span>
        <span className={cn(size === "lg" && "min-w-[9.5rem] text-left")}>
          {label}
        </span>
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-white/15 group-hover:bg-white/25 transition-colors",
          arrowCircleSize,
          isDownloading && "opacity-0",
        )}
      >
        <ArrowRight className={cn("text-white", arrowSize)} />
      </span>
    </button>
  );
}
