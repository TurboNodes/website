import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { ChainWallet, PayoutChain, PayoutPreferences } from "@/lib/payoutChains";
import { getPayoutWallets } from "@/lib/payoutChains";

export interface UserPreferences extends PayoutPreferences {
  [key: string]: unknown;
}

export function useUserPreferences() {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!isAuthenticated || !user) {
      setPreferences({});
      setLoading(false);
      return;
    }

    async function fetchPreferences() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", user!.id)
        .single();

      if (!mounted) return;

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error loading user preferences:", fetchError);
        setError(fetchError.message);
      } else {
        setPreferences((data?.preferences as UserPreferences) ?? {});
      }

      setLoading(false);
    }

    fetchPreferences();

    return () => {
      mounted = false;
    };
  }, [user?.id, isAuthenticated]);

  const updatePreferences = useCallback(
    async (partial: Partial<UserPreferences>) => {
      if (!user) {
        setError("You must be signed in to update preferences.");
        return false;
      }

      setSaving(true);
      setError(null);

      const next = { ...preferences, ...partial };

      const { error: updateError } = await supabase
        .from("users")
        .update({ preferences: next })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving user preferences:", updateError);
        setError(updateError.message);
        setSaving(false);
        return false;
      }

      setPreferences(next);
      setSaving(false);
      return true;
    },
    [preferences, user],
  );

  const updatePayoutWallet = useCallback(
    (chain: PayoutChain, address: string, source: "connected" | "manual") => {
      const current = getPayoutWallets(preferences);
      return updatePreferences({
        payoutWallets: {
          ...current,
          [chain]: {
            address,
            source,
            linkedAt: new Date().toISOString(),
          },
        },
        // Clear legacy single-wallet fields when saving per-chain
        payoutWallet: undefined,
        walletSource: undefined,
        walletLinkedAt: undefined,
      });
    },
    [preferences, updatePreferences],
  );

  const clearPayoutWallet = useCallback(
    (chain: PayoutChain) => {
      const current = { ...getPayoutWallets(preferences) };
      delete current[chain];
      return updatePreferences({
        payoutWallets: current,
        ...(chain === "eth"
          ? {
              payoutWallet: undefined,
              walletSource: undefined,
              walletLinkedAt: undefined,
            }
          : {}),
      });
    },
    [preferences, updatePreferences],
  );

  return {
    preferences,
    loading,
    saving,
    error,
    updatePreferences,
    updatePayoutWallet,
    clearPayoutWallet,
  };
}
