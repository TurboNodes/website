import type { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  /** Document title */
  title: string;
  children: ReactNode;
}

/** Centered full-viewport dark screen with the brand's ambient orange glow. */
export function AuthShell({ title, children }: AuthShellProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="relative min-h-dvh bg-neutral-950 text-white flex items-center justify-center px-4 py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-orange-600/6 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent" />
        </div>

        <Link
          href="/"
          className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10 flex items-center gap-2 group"
        >
          <img
            src="/logo.png"
            alt="Turbo"
            className="h-9 w-9 transition-transform group-hover:scale-105"
          />
          <span className="text-sm font-semibold text-white tracking-tight">
            Turbo
          </span>
        </Link>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-6 sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
