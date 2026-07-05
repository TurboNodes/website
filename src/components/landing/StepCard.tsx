import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StepState } from "@/hooks/useOnboardingProgress";

interface StepCardProps {
  step: number;
  title: string;
  description: ReactNode;
  actions: ReactNode;
  state: StepState;
  visual: ReactNode;
  className?: string;
}

export function StepCard({
  step,
  title,
  description,
  actions,
  state,
  visual,
  className,
}: StepCardProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";
  const isActive = state === "active" || state === "loading";

  return (
    <div
      className={cn(
        "flex rounded-2xl border overflow-hidden transition-all duration-500",
        isLocked && "border-neutral-800/50 bg-neutral-900/20 opacity-45",
        isActive &&
          "border-orange-500/30 bg-neutral-900/50 shadow-[0_0_24px_rgba(249,115,22,0.06)]",
        isComplete && "border-neutral-800/60 bg-neutral-900/30",
        className
      )}
    >
      {/* Text area */}
      <div className="flex-1 min-w-0 px-5 py-5 sm:px-6 sm:py-6 flex flex-col justify-center">
        <span className="text-[11px] font-mono tracking-widest uppercase text-orange-400/60 mb-3">
          step_{step}
        </span>

        <div className="flex items-center gap-6 sm:gap-8">
          {/* Title + actions — left column, fixed width for alignment across steps */}
          <div className="shrink-0 w-[200px] sm:w-[220px] flex flex-col gap-3">
            <h3
              className={cn(
                "text-lg sm:text-xl font-semibold",
                isLocked ? "text-neutral-600" : "text-white"
              )}
            >
              {title}
            </h3>
            {actions}
          </div>

          {/* Description — right column */}
          <div className="flex-1 min-w-0 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {description}
          </div>
        </div>
      </div>

      {/* Square illustration */}
      <div
        className={cn(
          "shrink-0 aspect-square w-36 sm:w-44 lg:w-52 border-l border-neutral-800/80 bg-neutral-950/70",
          "flex items-center justify-center p-3 sm:p-4",
          isLocked && "grayscale"
        )}
      >
        {visual}
      </div>
    </div>
  );
}
