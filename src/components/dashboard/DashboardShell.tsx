import React from "react";
import Head from "next/head";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileNav } from "./DashboardMobileNav";

interface DashboardShellProps {
  /** Document title. */
  title: string;
  /** Page name shown in the header — falls back to the document title's first segment. */
  heading?: string;
  /** One-liner under the page name in the header. */
  description?: string;
  /** Page-specific header controls, rendered left of the balance. */
  actions?: React.ReactNode;
  /** Panels manage their own scrolling — set false for full-bleed pages. */
  scroll?: boolean;
  children: React.ReactNode;
}

/** Shared dashboard chrome: ambient glow, grid backdrop, sidebar, header and main area. */
export function DashboardShell({
  title,
  heading,
  description,
  actions,
  scroll = true,
  children,
}: DashboardShellProps) {
  const { userStats, refetch, refreshing } = useSupabaseRealtime();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="relative h-dvh bg-neutral-950 text-white flex flex-col md:flex-row">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-orange-600/6 rounded-full blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent" />
        </div>

        <DashboardSidebar className="hidden md:flex" />

        <div className="relative flex-1 min-w-0 flex flex-col min-h-0">
          <DashboardHeader
            heading={heading ?? title.split("|")[0].trim()}
            description={description}
            actions={actions}
            balance={userStats?.totalEarnings ?? 0}
            refreshing={refreshing}
            onRefresh={refetch}
          />

          <main className="relative flex-1 min-h-0">
            {scroll ? (
              <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                {children}
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        <DashboardMobileNav className="md:hidden shrink-0" />
      </div>
    </>
  );
}
