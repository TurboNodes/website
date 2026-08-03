import React, { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { formatRate } from "@/lib/referralTiers";
import { cn } from "@/lib/utils";

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
  commissionRate: number;
}

export function ReferralLinkCard({
  referralCode,
  referralLink,
  commissionRate,
}: ReferralLinkCardProps) {
  const [copiedField, setCopiedField] = useState<"link" | "code" | null>(null);

  const copy = async (value: string, field: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <SettingsPanel
      label="referral_link"
      title="Your referral link"
      description={`Share this link or code. When someone signs up and earns, you get ${formatRate(commissionRate)} lifetime rewards.`}
      className="relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl"
      />
      <div className="relative space-y-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
            referral_link
          </p>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-neutral-950 p-1.5 pl-3 transition-colors",
              copiedField === "link"
                ? "border-emerald-400/70"
                : "border-orange-400/70",
            )}
          >
            <Link2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="flex-1 text-sm text-neutral-200 truncate font-mono min-w-0">
              {referralLink}
            </span>
            <button
              type="button"
              onClick={() => copy(referralLink, "link")}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                copiedField === "link"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400",
              )}
            >
              {copiedField === "link" ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
            referral_code
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5">
              <span className="text-lg font-semibold tracking-widest text-orange-400 font-mono">
                {referralCode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copy(referralCode, "code")}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors",
                copiedField === "code"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:border-neutral-600 hover:text-white",
              )}
            >
              {copiedField === "code" ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </SettingsPanel>
  );
}
