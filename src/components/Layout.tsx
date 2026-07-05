import React from "react";
import { OnboardingNav } from "@/components/landing/OnboardingNav";
import { SiteFooter } from "@/components/brand/SiteFooter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <OnboardingNav theme="light" animate={false} />
      <div className="min-h-dvh bg-neutral-50 text-neutral-900 flex flex-col">
        <main className="flex-1 pt-20">{children}</main>
        <SiteFooter theme="light" />
      </div>
    </>
  );
}
