import React from "react";
import { Panel, PanelTitle } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  title: string;
  description?: string;
  /** Optional control rendered on the title row (link, pill button, badge…). */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Bordered panel used to group a section, matching the dashboard's visual language. */
export function SettingsPanel({
  title,
  description,
  action,
  children,
  className,
}: SettingsPanelProps) {
  return (
    <Panel className={cn("flex flex-col", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <PanelTitle>{title}</PanelTitle>
          {description && (
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </Panel>
  );
}
