import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { DASHBOARD_NAV_ITEMS } from "./dashboardNavItems";
import { cn } from "@/lib/utils";

interface DashboardMobileNavProps {
  className?: string;
}

export function DashboardMobileNav({ className }: DashboardMobileNavProps) {
  const router = useRouter();

  return (
    <nav
      className={cn(
        "flex items-stretch justify-around gap-1 border-t border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const active = router.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors",
              active
                ? "bg-orange-500 text-neutral-950"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
