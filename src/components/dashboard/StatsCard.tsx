import React from "react";
import { PANEL_CLASS } from "./ui";
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
      PANEL_CLASS,
      "transition-colors duration-200 hover:border-neutral-700 hover:bg-neutral-900/70",
      compact ? "p-4" : "p-4 sm:p-5",
    )}
  >
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
          accent === "emerald"
            ? "bg-emerald-500/10 border-emerald-500/25"
            : "bg-orange-500/10 border-orange-500/25",
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4",
            accent === "emerald" ? "text-emerald-400" : "text-orange-400",
          )}
        />
      </span>
      <p className="min-w-0 text-xs font-semibold uppercase leading-tight tracking-wide text-neutral-300">
        {title}
      </p>
    </div>

    <p
      className={cn(
        "mt-3 font-semibold text-white tabular-nums tracking-tight",
        compact ? "text-xl" : "text-2xl sm:text-3xl",
      )}
    >
      {value}
    </p>
    {subtitle && (
      <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-neutral-600">
        {subtitle}
      </p>
    )}
  </div>
);
