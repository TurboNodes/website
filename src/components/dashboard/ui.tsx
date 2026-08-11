import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared dashboard surface: soft-rounded card with a hard bottom edge, so panels
 * read as physical tiles stacked on the page rather than flat outlines.
 */
export const PANEL_CLASS =
  "rounded-3xl border border-neutral-800 bg-neutral-900/50 shadow-[0_3px_0_0_rgba(0,0,0,0.55)]";

export function Panel({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn(PANEL_CLASS, "p-5 sm:p-6", className)} {...props}>
      {children}
    </section>
  );
}

interface PanelTitleProps {
  children: React.ReactNode;
  className?: string;
  /** Renders as this element — headings should stay in document order. */
  as?: "h1" | "h2" | "h3";
  size?: "sm" | "md" | "lg";
}

const TITLE_SIZES = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-xl sm:text-2xl",
} as const;

/** Marker-highlight heading — the dashboard's signature section label. */
export function PanelTitle({
  children,
  className,
  as: Tag = "h2",
  size = "md",
}: PanelTitleProps) {
  return (
    <Tag className={cn("font-semibold tracking-tight", TITLE_SIZES[size], className)}>
      <span className="inline-block rounded-lg bg-orange-500/20 px-2 py-0.5 text-white">
        {children}
      </span>
    </Tag>
  );
}

/** Pill button styling, shared by <button> and <Link> so both read identically. */
export const pill = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-orange-500 text-neutral-950 hover:bg-orange-400 shadow-[0_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none",
        secondary:
          "border border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white",
        soft:
          "border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200",
        ghost: "text-neutral-400 hover:bg-neutral-800/60 hover:text-white",
        danger:
          "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200",
      },
      size: {
        xs: "px-2.5 py-1 text-[10px]",
        sm: "px-3.5 py-1.5 text-[11px]",
        md: "px-5 py-2.5 text-xs",
        lg: "px-7 py-3.5 text-sm",
        icon: "p-2.5",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", full: false },
  },
);

export type PillProps = VariantProps<typeof pill>;

export function PillButton({
  className,
  variant,
  size,
  full,
  ...props
}: React.ComponentProps<"button"> & PillProps) {
  return (
    <button
      type="button"
      className={cn(pill({ variant, size, full }), className)}
      {...props}
    />
  );
}
