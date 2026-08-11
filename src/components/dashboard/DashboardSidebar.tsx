import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowUpRight, Settings } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "./dashboardNavItems";
import { pill } from "./ui";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  className?: string;
}

const SECONDARY_NAV_ITEMS = [
  { label: "Withdraw", href: "/dashboard/withdrawal", icon: ArrowUpRight },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const router = useRouter();
  const logoHref = router.pathname.startsWith("/dashboard/")
    ? "/dashboard"
    : "/";

  return (
    <aside
      className={cn(
        "w-60 shrink-0 flex-col border-r border-neutral-800/80 bg-neutral-950 backdrop-blur-md",
        className,
      )}
    >
      <Link
        href={logoHref}
        className="flex items-center gap-3 group px-5 py-4 border-b border-neutral-800/80"
      >
        <img
          src="/logo.png"
          alt="Turbo"
          className="h-10 w-10 transition-transform group-hover:scale-105"
        />
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            Turbo
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
            Node Operations
          </p>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const active = router.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors",
                active
                  ? "bg-orange-500 text-neutral-950 shadow-[0_2px_0_0_rgba(0,0,0,0.5)]"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  active ? "text-neutral-950" : "text-neutral-500",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="!mt-5 pt-4 border-t border-neutral-800/70 space-y-1.5">
          {SECONDARY_NAV_ITEMS.map((item) => {
            const active = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                  active
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3">
        <Link
          href="/dashboard/download"
          className={cn(pill({ variant: "primary", size: "md", full: true }))}
        >
          Add a node
        </Link>
      </div>
    </aside>
  );
}
