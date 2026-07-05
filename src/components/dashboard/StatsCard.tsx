import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  subtitle?: string;
  accent?: "orange" | "emerald";
  compact?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  accent = "orange",
  compact = false,
}) => (
  <div
    className={cn(
      "rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm",
      "hover:border-neutral-700 hover:bg-neutral-900/60 transition-all duration-200",
      compact ? "p-4" : "p-4 sm:p-5",
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div
        className={cn(
          "p-2 rounded-lg border shrink-0",
          accent === "emerald"
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-orange-500/10 border-orange-500/20",
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4",
            accent === "emerald" ? "text-emerald-400" : "text-orange-400",
          )}
        />
      </div>
      {subtitle && (
        <p className="text-[10px] font-mono text-neutral-600 text-right leading-tight">
          {subtitle}
        </p>
      )}
    </div>
    <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-3 mb-1">
      {title}
    </p>
    <p
      className={cn(
        "font-semibold text-white tabular-nums tracking-tight",
        compact ? "text-xl" : "text-2xl",
      )}
    >
      {value}
    </p>
  </div>
);
