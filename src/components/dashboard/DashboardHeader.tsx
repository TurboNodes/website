import React from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { UserProfile } from "../UserProfile";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  supabaseConnected?: boolean;
  activeNodes?: number;
  totalNodes?: number;
}

export function DashboardHeader({
  supabaseConnected = false,
  activeNodes = 0,
  totalNodes = 0,
}: DashboardHeaderProps) {
  return (
    <header className="relative z-10 shrink-0 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-3 group">
        <img
          src="/logo.png"
          alt="Turbo"
          className="h-9 w-9 transition-transform group-hover:scale-105"
        />
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            Turbo
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
            Node Operations
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border",
              supabaseConnected
                ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400"
                : "border-neutral-800 bg-neutral-900/50 text-neutral-500",
            )}
          >
            <Radio className="w-3 h-3" />
            <span className="font-medium">
              {supabaseConnected ? "Live" : "Connecting"}
            </span>
          </div>
          {totalNodes > 0 && (
            <div className="text-neutral-500">
              <span className="text-white font-medium">{activeNodes}</span>
              <span className="text-neutral-600"> / {totalNodes} nodes online</span>
            </div>
          )}
        </div>

        <UserProfile />
      </div>
    </header>
  );
}
