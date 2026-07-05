import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepState } from "@/hooks/useOnboardingProgress";

interface StepCheckpointProps {
  index: number;
  state: StepState;
  className?: string;
}

export const StepCheckpoint = forwardRef<HTMLDivElement, StepCheckpointProps>(
  function StepCheckpoint({ index, state, className }, ref) {
    const isComplete = state === "complete";
    const isActive = state === "active" || state === "loading";

    return (
      <div
        ref={ref}
        className={cn(
          "relative z-10 flex items-center justify-center",
          className
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-500",
            isComplete &&
              "bg-gradient-to-br from-orange-500 to-amber-500 border-orange-400/50 shadow-lg shadow-orange-500/15",
            isActive &&
              "border-orange-500/60 bg-neutral-950 shadow-[0_0_16px_rgba(249,115,22,0.2)]",
            !isComplete &&
              !isActive &&
              "border-neutral-800 bg-neutral-950"
          )}
        >
          {isComplete ? (
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[3]" />
          ) : (
            <span
              className={cn(
                "text-[9px] sm:text-[10px] font-bold font-mono",
                isActive ? "text-orange-400/90" : "text-neutral-700"
              )}
            >
              {index + 1}
            </span>
          )}
        </div>
      </div>
    );
  }
);
