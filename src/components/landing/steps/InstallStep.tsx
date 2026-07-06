import { ArrowRight, Check, FolderOpen, HardDrive } from "lucide-react";
import { StepCard } from "../StepCard";
import type { StepState } from "@/hooks/useOnboardingProgress";
import type { Platform } from "@/hooks/useTurboDownload";
import { cn } from "@/lib/utils";

interface InstallStepProps {
  state: StepState;
  platform: Platform;
  onConfirm: () => void;
}

function getInstallCopy(platform: Platform): string[] {
  switch (platform) {
    case "macos":
      return [
        "Open the downloaded .dmg file",
        "Drag Turbo into Applications",
      ];
    case "windows":
      return [
        "Extract the downloaded .zip if needed",
        "Run the .exe installer inside",
        "Launch Turbo from the Start menu",
      ];
    case "linux":
      return [
        "Extract the downloaded .zip",
        "Make the binary executable if needed",
        "Launch Turbo from your terminal or menu",
      ];
    default:
      return [
        "Open the downloaded installer",
        "Complete the setup wizard",
        "Launch Turbo on your computer",
      ];
  }
}

function InstallVisual({ platform }: { platform: Platform }) {
  const isMac = platform === "macos";

  return (
    <div className="w-full h-full p-2 flex items-center justify-center">
      <div className="w-full max-w-[220px] rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1 bg-neutral-800 border-b border-neutral-700">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[8px] text-neutral-500 font-mono">Setup</span>
        </div>
        <div className="p-2.5 flex items-center justify-center gap-2">
          {isMac ? (
            <>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <img src="/logo.png" alt="" className="w-4 h-4" />
                </div>
                <span className="text-[7px] text-neutral-500">Turbo</span>
              </div>
              <span className="text-neutral-600 text-sm">→</span>
              <div className="flex flex-col items-center gap-0.5">
                <FolderOpen className="w-7 h-7 text-orange-400/80" />
                <span className="text-[7px] text-neutral-500">Apps</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-0.5">
              <HardDrive className="w-7 h-7 text-neutral-500" />
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-orange-600 to-amber-400 rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InstallStep({ state, platform, onConfirm }: InstallStepProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";
  const steps = getInstallCopy(platform);

  return (
    <StepCard
      step={2}
      title="Install"
      state={state}
      visual={<InstallVisual platform={platform} />}
      description={
        <ol className="space-y-1 list-decimal list-inside leading-snug">
          {steps.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      }
      actions={
        isComplete ? (
          <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-400">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20">
              <Check className="w-3 h-3 text-orange-400 stroke-[3]" />
            </span>
            Installed
          </div>
        ) : (
          <button
            onClick={onConfirm}
            disabled={isLocked}
            className={cn(
              "group w-full inline-flex items-center justify-between pl-3.5 pr-1 py-1",
              "rounded-full font-medium text-sm transition-all duration-200",
              isLocked
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white active:scale-[0.97] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            )}
          >
            <span>I&apos;ve installed</span>
            <span className="flex items-center justify-center w-7 h-7 bg-white/10 rounded-full transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </button>
        )
      }
    />
  );
}
