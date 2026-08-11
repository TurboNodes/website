import { useCallback, useEffect, useState } from "react";
import { Loader2, Monitor } from "lucide-react";
import { OSLogo } from "@/components/landing/ui/OSLogos";
import { TurboDownloadButton } from "@/components/shared/TurboDownloadButton";
import { CopyCommand } from "./CopyCommand";
import { PANEL_CLASS, PanelTitle } from "@/components/dashboard/ui";
import {
  downloadTurboClient,
  getCurlInstallCommand,
  getDockerPullCommand,
  getDockerRunCommand,
  type Architecture,
  type Platform,
} from "@/lib/turboClientDownload";
import { useTurboDownload } from "@/hooks/useTurboDownload";
import { cn } from "@/lib/utils";

type SupportedPlatform = Exclude<Platform, "" | "unknown">;

const PLATFORMS: SupportedPlatform[] = ["windows", "macos", "linux"];
const ARCHITECTURES: Architecture[] = ["amd64", "arm64"];
const PLATFORM_LABELS: Record<SupportedPlatform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

function getArchLabel(platform: SupportedPlatform, arch: Architecture): string {
  if (arch === "arm64") {
    return platform === "macos" ? "Apple Silicon" : "ARM64";
  }
  return platform === "macos" ? "Intel" : "x64";
}

interface DownloadOptionsProps {
  /** Called after a download successfully starts, from either the hero button or a device card. */
  onDownloaded?: (platform: SupportedPlatform) => void;
  /** "wide" splits the picker and the CLI recipes into two columns on large screens. */
  layout?: "stack" | "wide";
  className?: string;
}

/** One-click download for the detected platform, plus a friendly device picker for everyone else. */
export function DownloadOptions({
  onDownloaded,
  layout = "stack",
  className,
}: DownloadOptionsProps) {
  const wide = layout === "wide";
  const hero = useTurboDownload();
  const [baseUrl, setBaseUrl] = useState("https://turbo.network");
  const [cardArch, setCardArch] = useState<Record<SupportedPlatform, Architecture>>({
    windows: "amd64",
    macos: "amd64",
    linux: "amd64",
  });
  const [downloadingCard, setDownloadingCard] = useState<SupportedPlatform | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleHeroDownload = useCallback(async () => {
    const ok = await hero.download();
    if (ok && hero.platform && hero.platform !== "unknown") {
      onDownloaded?.(hero.platform as SupportedPlatform);
    }
  }, [hero, onDownloaded]);

  const handleCardDownload = useCallback(
    async (platform: SupportedPlatform) => {
      if (downloadingCard) return;
      setDownloadingCard(platform);
      setCardError(null);

      const result = await downloadTurboClient(platform, cardArch[platform]);
      setDownloadingCard(null);

      if (!result.ok) {
        setCardError(result.error);
        return;
      }

      onDownloaded?.(platform);
    },
    [cardArch, downloadingCard, onDownloaded],
  );

  return (
    <div
      className={cn(
        wide
          ? "grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-start"
          : "space-y-6",
        className,
      )}
    >
      <div className={cn(wide ? "xl:col-span-7 space-y-4 sm:space-y-5" : "space-y-6")}>
      <section className={cn(PANEL_CLASS, "bg-gradient-to-br from-neutral-900/60 to-neutral-900/20 p-5 sm:p-6")}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 shrink-0 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Monitor className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-0.5">
              {hero.isReady ? `We detected ${hero.osName}` : "Detecting your platform…"}
            </p>
            <p className="text-xs text-neutral-500">
              One-click install — pick a different device below if this isn't right.
            </p>
          </div>
          <TurboDownloadButton
            onClick={handleHeroDownload}
            disabled={!hero.isReady}
            isDownloading={hero.isDownloading}
            platform={hero.platform}
            label={hero.isDownloading ? "Downloading…" : `Download for ${hero.osName}`}
            className="w-full sm:w-auto"
            size="lg"
          />
        </div>
        {hero.downloadError && (
          <p className="mt-3 text-xs text-red-400/90 text-center sm:text-right">
            {hero.downloadError}
          </p>
        )}
      </section>

      <section className={cn(PANEL_CLASS, "p-5 sm:p-6")}>
        <PanelTitle className="mb-4">Have a different device?</PanelTitle>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((platform) => {
            const isDownloading = downloadingCard === platform;
            const disabled = downloadingCard !== null;
            return (
              <div
                key={platform}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                onClick={() => !disabled && handleCardDownload(platform)}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleCardDownload(platform);
                  }
                }}
                className={cn(
                  "group relative flex flex-col items-center gap-2.5 rounded-3xl border border-neutral-800 bg-neutral-950/40 px-3 py-5 text-center transition-colors cursor-pointer",
                  "hover:border-orange-500/40 hover:bg-neutral-900/60",
                  disabled && "pointer-events-none opacity-60",
                )}
              >
                {isDownloading && (
                  <Loader2 className="absolute top-2.5 right-2.5 w-3.5 h-3.5 animate-spin text-orange-400" />
                )}
                <span className="w-11 h-11 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/15 transition-colors">
                  <OSLogo platform={platform} />
                </span>
                <span className="text-sm font-medium text-white">
                  {PLATFORM_LABELS[platform]}
                </span>
                <span
                  role="group"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[11px] text-neutral-500"
                >
                  {ARCHITECTURES.map((archOption, i) => (
                    <span key={archOption} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-neutral-700">|</span>}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setCardArch((prev) => ({ ...prev, [platform]: archOption }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setCardArch((prev) => ({ ...prev, [platform]: archOption }));
                          }
                        }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          cardArch[platform] === archOption
                            ? "text-orange-400 font-medium"
                            : "hover:text-neutral-300",
                        )}
                      >
                        {getArchLabel(platform, archOption)}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
        {cardError && (
          <p className="mt-3 text-xs text-red-400/90 text-center">{cardError}</p>
        )}
      </section>
      </div>

      <div className={cn(wide ? "xl:col-span-5 space-y-4 sm:space-y-5" : "space-y-6")}>
      <section className={cn(PANEL_CLASS, "p-5 sm:p-6")}>
        <PanelTitle>Terminal install</PanelTitle>
        <p className="text-xs text-neutral-500 mt-2 mb-4">
          Installs the latest build for Linux or macOS. Windows users should use
          the direct download above.
        </p>
        <CopyCommand command={getCurlInstallCommand(baseUrl)} />
      </section>

      <section className={cn(PANEL_CLASS, "p-5 sm:p-6 space-y-5")}>
        <div>
          <PanelTitle>Docker</PanelTitle>
          <p className="text-xs text-neutral-500 mt-2">
            Run Turbo as a container on any host with Docker installed.
          </p>
        </div>
        <CopyCommand label="Pull image" command={getDockerPullCommand()} />
        <CopyCommand label="Run container" command={getDockerRunCommand()} />
      </section>
      </div>
    </div>
  );
}
