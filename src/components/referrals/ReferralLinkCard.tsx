import React, { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { pill } from "@/components/dashboard/ui";
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
                pill({ size: "md" }),
                "shrink-0",
                copiedField === "link" &&
                  "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 shadow-none",
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
                pill({ variant: "secondary", size: "md" }),
                "shrink-0",
                copiedField === "code" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
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
