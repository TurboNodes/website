import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  MessageCircle,
  LogOut,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { formatUsdcOnChain, getPrimaryPayoutWallet, truncateAddress } from "@/lib/payoutChains";
import { TOP_REFERRAL_TIER, formatRate } from "@/lib/referralTiers";
import { getAuthDisplayName } from "@/lib/web3Auth";

const DISCORD_SUPPORT_URL = "https://discord.gg/ZqdvQkSEc7";

export function UserProfile() {
  const { user, signOut } = useAuth();
  const { preferences } = useUserPreferences();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = getAuthDisplayName(user);
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const primaryWallet = getPrimaryPayoutWallet(preferences);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 hover:bg-neutral-900/60 rounded-xl p-2 transition-colors group border border-transparent hover:border-neutral-800"
      >
        <Avatar className="w-9 h-9 border border-neutral-700">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-orange-500/20 text-orange-400 font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
            {displayName}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-600">
            {primaryWallet
              ? `${formatUsdcOnChain(primaryWallet.chain)} · ${truncateAddress(primaryWallet.wallet.address)}`
              : "node_operator"}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-all hidden sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/40 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {!primaryWallet && (
            <div className="px-4 py-3.5 border-b border-neutral-800/80">
              <Link
                href="/dashboard/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-800 px-3 py-2 text-xs text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                Set up payout wallet
              </Link>
            </div>
          )}

          {/* Menu actions */}
          <div className="p-1.5 space-y-0.5">
            <Link
              href="/dashboard/referrals"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex w-full items-center gap-2.5 rounded-lg border border-orange-400/70 bg-neutral-900 px-3 py-2.5 text-sm text-white shadow-[0_0_16px_-4px_rgba(249,115,22,0.45)] hover:border-orange-400 hover:bg-neutral-900/80 transition-colors"
            >
              <Users className="w-4 h-4 text-orange-400 group-hover:text-amber-300 transition-colors" />
              <span className="flex-1 font-medium">Referrals</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90">
                Earn up to {formatRate(TOP_REFERRAL_TIER.rate)}
              </span>
            </Link>

            <Link
              href="/dashboard/withdrawal"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 text-neutral-500" />
              Withdraw
            </Link>

            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            >
              <Settings className="w-4 h-4 text-neutral-500" />
              Account settings
            </Link>

            <a
              href={DISCORD_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-neutral-500" />
              Support
            </a>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
