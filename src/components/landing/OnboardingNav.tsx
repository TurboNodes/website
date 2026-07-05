import Link from "next/link";
import { cn } from "@/lib/utils";

interface OnboardingNavProps {
  hidden?: boolean;
  animate?: boolean;
  /** "light" = frosted white glass (photo hero), "dark" = frosted dark glass (interior pages) */
  theme?: "light" | "dark";
}

export function OnboardingNav({
  hidden = false,
  animate = true,
  theme = "light",
}: OnboardingNavProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-2 will-change-transform",
        animate && "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        hidden && "-translate-y-full pointer-events-none",
      )}
    >
      <nav
        className={cn(
          "flex items-center justify-between w-full max-w-2xl h-14 px-4 rounded-xl border backdrop-blur-md shadow-md box-border",
          isDark
            ? "bg-neutral-950/70 border-neutral-800 shadow-black/20"
            : "bg-white/60 border-neutral-200/80 shadow-neutral-900/5",
        )}
      >
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo.png"
            alt="Turbo"
            className="h-9 w-9 transition-transform group-hover:scale-105"
          />
          <span
            className={cn(
              "text-sm font-semibold tracking-tight leading-none",
              isDark ? "text-white" : "text-neutral-900",
            )}
          >
            Turbo
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
          <Link
            href="/blog"
            className={cn(
              "text-sm font-medium leading-none transition-colors",
              isDark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-700 hover:text-neutral-900",
            )}
          >
            Blog
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center justify-center h-9 px-5 rounded-full border text-sm font-semibold leading-none transition-colors",
              isDark
                ? "border-neutral-700 bg-white/5 text-neutral-200 hover:bg-white/10 hover:text-white hover:border-neutral-600"
                : "border-neutral-300 bg-white/50 text-neutral-800 hover:bg-white/80 hover:text-neutral-900 hover:border-neutral-400",
            )}
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </div>
  );
}
