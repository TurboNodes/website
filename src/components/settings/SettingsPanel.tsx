import React from "react";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  label: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Bordered dark panel used to group a settings section, matching the dashboard's visual language. */
export function SettingsPanel({
  label,
  title,
  description,
  children,
  className,
}: SettingsPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-6 sm:p-7",
        className,
      )}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400/90 mb-2">
        // {label}
      </p>
      <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
      {description && (
        <p className="text-sm text-neutral-400 mb-5 leading-relaxed">{description}</p>
      )}
      {!description && <div className="mb-5" />}
      {children}
    </section>
  );
}
