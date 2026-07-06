import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  LogOut,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { buildReferralLink } from "@/lib/referrals";
import { supabase } from "@/lib/supabase";

import { formatUsdcOnChain, getPrimaryPayoutWallet, truncateAddress } from "@/lib/payoutChains";

export function UserProfile() {
  const { user, signOut } = useAuth();
  const { preferences } = useUserPreferences();
  const [open, setOpen] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";
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

  useEffect(() => {
    if (!open || !user?.id) {
      setReferralLink(null);
      setLinkCopied(false);
      return;
    }

    const userId = user.id;
    let cancelled = false;

    async function loadReferralLink() {
      const { data, error } = await supabase
        .from("users")
        .select("referralCode")
        .eq("id", userId)
        .single();

      if (cancelled || error || !data?.referralCode) return;
      setReferralLink(buildReferralLink(data.referralCode));
    }

    void loadReferralLink();

    return () => {
      cancelled = true;
    };
  }, [open, user?.id]);

  const copyReferralLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy referral link:", err);
    }
  };

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
          {/* Profile header */}
          <div className="px-4 py-3.5 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-neutral-700 grayscale opacity-80">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-neutral-800 text-neutral-400 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-neutral-300 truncate">{displayName}</p>
                <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>

            {primaryWallet ? (
              <Link
                href="/dashboard/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="mt-3 flex items-center gap-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60 px-3 py-2 hover:border-neutral-700 hover:bg-neutral-800/40 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="font-mono text-xs text-neutral-400 truncate">
                  {formatUsdcOnChain(primaryWallet.chain)} ·{" "}
                  {truncateAddress(primaryWallet.wallet.address)}
                </span>
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-neutral-800 px-3 py-2 text-xs text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                Set up payout wallet
              </Link>
            )}

            <div className="mt-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                Referral link
              </p>
              <button
                type="button"
                role="menuitem"
                onClick={() => void copyReferralLink()}
                disabled={!referralLink}
                title={referralLink ? "Copy referral link" : "Loading referral link"}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                  linkCopied
                    ? "border-neutral-600 bg-neutral-800/40"
                    : "border-neutral-800/60 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-800/40",
                  !referralLink && "opacity-60 cursor-wait",
                )}
              >
                <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-mono text-xs text-neutral-400 truncate">
                    {linkCopied ? "Referral link copied!" : referralLink ?? "Loading…"}
                  </span>
                  {!linkCopied && referralLink && (
                    <span className="block text-[10px] text-neutral-600 mt-0.5">
                      Tap to copy and share
                    </span>
                  )}
                </span>
                {linkCopied ? (
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Menu actions */}
          <div className="p-1.5">
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
              href="/dashboard/referrals"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
            >
              <Users className="w-4 h-4 text-neutral-500" />
              Referrals
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
