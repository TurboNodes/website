import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCheckmarkProps {
  show: boolean;
  className?: string;
}

export function StepCheckmark({ show, className }: StepCheckmarkProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 text-white transition-all duration-500",
        show ? "scale-100 opacity-100" : "scale-50 opacity-0",
        className
      )}
    >
      <Check className="w-4 h-4 stroke-[3]" />
    </div>
  );
}
