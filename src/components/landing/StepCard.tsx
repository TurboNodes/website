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
        "flex flex-col md:flex-row rounded-xl md:rounded-2xl border overflow-hidden transition-all duration-500",
        isLocked && "border-neutral-800/50 bg-neutral-900/20 opacity-45",
        isActive &&
          "border-orange-500/30 bg-neutral-900/50 shadow-[0_0_24px_rgba(249,115,22,0.06)]",
        isComplete && "border-neutral-800/60 bg-neutral-900/30",
        className
      )}
    >
      {/* Text area */}
      <div className="flex-1 min-w-0 px-3.5 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 flex flex-col justify-center">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-orange-400/60 mb-1.5 sm:mb-2.5">
          step_{step}
        </span>

        {/*
          Mobile: title → description → actions (stacked).
          sm+: title + actions in a fixed left column, description on the right.
        */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[10.5rem_1fr] sm:gap-x-5 sm:gap-y-2.5 md:grid-cols-[12.5rem_1fr] md:gap-x-8 lg:grid-cols-[13.75rem_1fr]">
          <h3
            className={cn(
              "col-start-1 text-base sm:text-lg md:text-xl font-semibold",
              isLocked ? "text-neutral-600" : "text-white"
            )}
          >
            {title}
          </h3>

          <div className="row-start-2 sm:col-start-2 sm:row-start-1 sm:row-span-2 min-w-0 text-[11px] sm:text-xs md:text-sm text-neutral-400 leading-snug sm:leading-relaxed">
            {description}
          </div>

          <div className="row-start-3 sm:col-start-1 sm:row-start-2 min-w-0">
            {actions}
          </div>
        </div>
      </div>

      {/* Illustration — desktop only so the section stays one viewport tall on phones */}
      <div
        className={cn(
          "hidden md:flex shrink-0 border-l border-neutral-800/80 bg-neutral-950/70",
          "items-center justify-center p-3 sm:p-4",
          "aspect-square w-36 lg:w-44 xl:w-48",
          isLocked && "grayscale"
        )}
      >
        {visual}
      </div>
    </div>
  );
}
