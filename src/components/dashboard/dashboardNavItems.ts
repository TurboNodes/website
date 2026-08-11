import type { ComponentType } from "react";
import { LayoutDashboard, Users, Server, Download } from "lucide-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Referrals", href: "/dashboard/referrals", icon: Users },
  { label: "Nodes", href: "/dashboard/nodes", icon: Server },
  { label: "Download", href: "/dashboard/download", icon: Download },
];
