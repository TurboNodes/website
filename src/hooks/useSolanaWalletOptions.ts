import { useEffect, useMemo, useRef, useState } from "react";
import type { Wallet } from "@wallet-standard/base";
import { getWallets } from "@wallet-standard/app";
import { StandardWalletAdapter } from "@solana/wallet-standard-wallet-adapter-base";
import {
  adaptersToSolanaOptions,
  createUniversalSolanaAdapters,
  wrapStandardWallets,
  type SolanaWalletOption,
} from "@/lib/solanaWallets";

export function useSolanaWalletOptions(): SolanaWalletOption[] {
  const walletsApi = useRef(getWallets());
  const [standardAdapters, setStandardAdapters] = useState<StandardWalletAdapter[]>(() =>
    wrapStandardWallets(walletsApi.current.get()),
  );
  const prevStandardAdapters = useRef<StandardWalletAdapter[] | undefined>(undefined);

  useEffect(() => {
    const api = walletsApi.current;
    const offRegister = api.on("register", (...wallets: Wallet[]) => {
      setStandardAdapters((current) => [...current, ...wrapStandardWallets(wallets)]);
    });
    const offUnregister = api.on("unregister", (...wallets: Wallet[]) => {
      setStandardAdapters((current) =>
        current.filter(
          (adapter) => !wallets.some((wallet) => wallet === adapter.wallet),
        ),
      );
    });

    return () => {
      offRegister();
      offUnregister();
    };
  }, []);

  useEffect(() => {
    const previous = prevStandardAdapters.current;
    if (previous) {
      const current = new Set(standardAdapters);
      previous
        .filter((adapter) => !current.has(adapter))
        .forEach((adapter) => adapter.destroy());
    }
    prevStandardAdapters.current = standardAdapters;
  }, [standardAdapters]);

  useEffect(
    () => () => {
      standardAdapters.forEach((adapter) => adapter.destroy());
    },
    [standardAdapters],
  );

  const universalAdapters = useMemo(() => createUniversalSolanaAdapters(), []);

  return useMemo(
    () =>
      adaptersToSolanaOptions([
        ...standardAdapters,
        ...universalAdapters.filter(
          (adapter) => !standardAdapters.some((standard) => standard.name === adapter.name),
        ),
      ]),
    [standardAdapters, universalAdapters],
  );
}
