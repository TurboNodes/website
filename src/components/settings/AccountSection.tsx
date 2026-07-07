import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { SettingsPanel } from "./SettingsPanel";
import {
  getAuthDisplayName,
  getAuthDisplaySubtitle,
  getWeb3WalletAddress,
  isWeb3User,
} from "@/lib/web3Auth";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1.5">
        {label}
      </p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

export function AccountSection() {
  const { user } = useAuth();

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = getAuthDisplayName(user);
  const displaySubtitle = getAuthDisplaySubtitle(user);
  const walletAddress = getWeb3WalletAddress(user);
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <SettingsPanel
      label="account"
      title="Account"
      description="Your profile details are managed by your sign-in provider."
    >
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-14 h-14 border border-neutral-700">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-orange-500/20 text-orange-400 font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-white">{displayName}</p>
          {displaySubtitle && (
            <p className="text-sm text-neutral-500">{displaySubtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="display_name" value={displayName} />
        <Field
          label={isWeb3User(user) ? "wallet_address" : "email"}
          value={isWeb3User(user) ? (walletAddress ?? "—") : (user?.email ?? "—")}
        />
        <Field label="member_since" value={memberSince} />
        <Field label="role" value="node_operator" />
      </div>
    </SettingsPanel>
  );
}
