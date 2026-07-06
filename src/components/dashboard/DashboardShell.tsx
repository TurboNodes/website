import React from "react";
import Head from "next/head";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardShellProps {
  title: string;
  children: React.ReactNode;
}

/** Shared dashboard chrome: ambient glow, grid backdrop, header and main area. */
export function DashboardShell({ title, children }: DashboardShellProps) {
  const { isConnected, nodeStats } = useSupabaseRealtime();

  const activeNodes =
    nodeStats?.filter((node) => node.isActive && node.isConnected).length ?? 0;
  const totalNodes = nodeStats?.length ?? 0;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="relative h-dvh bg-neutral-950 text-white flex flex-col">
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

        <DashboardHeader
          supabaseConnected={isConnected}
          activeNodes={activeNodes}
          totalNodes={totalNodes}
        />

        <main className="relative flex-1 min-h-0">{children}</main>
      </div>
    </>
  );
}
