import React, { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { cn } from "@/lib/utils";

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
}

export function ReferralLinkCard({ referralCode, referralLink }: ReferralLinkCardProps) {
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
      description="Share this link or code. When someone signs up and earns, you get rewards."
    >
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
            referral_link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 min-w-0">
              <Link2 className="w-4 h-4 text-neutral-500 shrink-0" />
              <span className="text-sm text-neutral-300 truncate font-mono">{referralLink}</span>
            </div>
            <button
              type="button"
              onClick={() => copy(referralLink, "link")}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors",
                copiedField === "link"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:border-neutral-600 hover:text-white",
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
                  Copy
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
