import { DownloadStep } from "./steps/DownloadStep";
import { InstallStep } from "./steps/InstallStep";
import { ConnectStep } from "./steps/ConnectStep";
import { StepCheckpoint } from "./StepCheckpoint";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useOnboardingTrack } from "@/hooks/useOnboardingTrack";
import { useTurboDownload } from "@/hooks/useTurboDownload";
import { getOSName, isSupportedPlatform } from "@/lib/turboClientDownload";
import { cn } from "@/lib/utils";

export function OnboardingPipeline() {
  const {
    markDownloadComplete,
    markInstallConfirmed,
    getStepState,
    hydrated,
    downloadPlatform,
  } = useOnboardingProgress();

  const { containerRef, setCircleRef, trackStyle, animateProgress } =
    useOnboardingTrack(getStepState, hydrated);

  const { platform, osName, isDownloading, download, isReady, downloadError } =
    useTurboDownload();

  const handleDownload = async () => {
    const success = await download();
    if (success && isSupportedPlatform(platform)) {
      markDownloadComplete(platform);
    }
  };

  const selectedPlatform = downloadPlatform ?? platform;
  const selectedOsName = downloadPlatform ? getOSName(downloadPlatform) : osName;

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-1 items-start justify-center w-full px-6 sm:px-10 pt-24 sm:pt-28 pb-12">
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto">
        <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-10">
          // setup
        </p>
        <div
          ref={containerRef}
          className="relative grid grid-cols-[2.25rem_1fr] sm:grid-cols-[2.5rem_1fr] gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-5"
        >
          {trackStyle && (
            <div
              className="pointer-events-none absolute left-0 w-9 sm:w-10 z-0"
              style={{ top: trackStyle.top, height: trackStyle.height }}
              aria-hidden
            >
              <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-neutral-800">
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-orange-500 via-orange-400 to-amber-400 shadow-[0_0_14px_rgba(249,115,22,0.55)]",
                    animateProgress
                      ? "transition-[height] duration-700 ease-out"
                      : "transition-none"
                  )}
                  style={{ height: `${trackStyle.fillPercent}%` }}
                />
              </div>
            </div>
          )}

          <StepCheckpoint
            ref={setCircleRef(0)}
            index={0}
            state={getStepState("download")}
            className="col-start-1 row-start-1"
          />
          <div className="col-start-2 row-start-1 min-w-0">
            <DownloadStep
              state={getStepState("download")}
              platform={selectedPlatform}
              currentPlatform={platform}
              osName={selectedOsName}
              isDownloading={isDownloading}
              isReady={isReady}
              downloadError={downloadError}
              onDownload={handleDownload}
            />
          </div>

          <StepCheckpoint
            ref={setCircleRef(1)}
            index={1}
            state={getStepState("install")}
            className="col-start-1 row-start-2"
          />
          <div className="col-start-2 row-start-2 min-w-0">
            <InstallStep
              state={getStepState("install")}
              platform={selectedPlatform}
              onConfirm={markInstallConfirmed}
            />
          </div>

          <StepCheckpoint
            ref={setCircleRef(2)}
            index={2}
            state={getStepState("connect")}
            className="col-start-1 row-start-3"
          />
          <div className="col-start-2 row-start-3 min-w-0">
            <ConnectStep state={getStepState("connect")} />
          </div>
        </div>
      </div>
    </div>
  );
}
