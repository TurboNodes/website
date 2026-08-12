import React, { useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { SettingsPanel } from "./SettingsPanel";
import {
  DISPLAY_NAME_MAX_LENGTH,
  getAuthDisplayName,
  getAuthDisplaySubtitle,
  getCustomDisplayName,
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

function DisplayNameField({
  value,
  isCustom,
  onSave,
}: {
  value: string;
  isCustom: boolean;
  onSave: (name: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setDraft(value);
    setError(null);
    setSaved(false);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
    setDraft(value);
  };

  const save = async (nextName: string) => {
    const trimmed = nextName.trim();
    if (trimmed === value.trim()) {
      cancel();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save name.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <div className="flex items-center gap-2 mb-1.5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
          display_name
        </p>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-orange-400">
            <Check className="w-3 h-3" />
            saved
          </span>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            disabled={saving}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void save(draft);
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            placeholder="Your name"
            className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 disabled:opacity-60"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void save(draft)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white disabled:opacity-60 transition-colors"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm text-white truncate">{value}</p>
          <button
            type="button"
            onClick={startEditing}
            className="text-neutral-500 hover:text-orange-400 transition-colors shrink-0"
            aria-label="Edit display name"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {editing && (
        <p className="mt-1.5 text-xs text-neutral-500">
          {isCustom
            ? "Leave empty to go back to the name from your sign-in provider."
            : `Up to ${DISPLAY_NAME_MAX_LENGTH} characters.`}
        </p>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function AccountSection() {
  const { user, updateDisplayName } = useAuth();

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
      title="Account"
      description="Choose the name shown across your dashboard. Your other profile details are managed by your sign-in provider."
    >
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-14 h-14 border border-neutral-700">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-orange-500/20 text-orange-400 font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-white truncate">{displayName}</p>
          {displaySubtitle && (
            <p className="text-sm text-neutral-500 truncate">{displaySubtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DisplayNameField
          value={displayName}
          isCustom={!!getCustomDisplayName(user)}
          onSave={updateDisplayName}
        />
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
