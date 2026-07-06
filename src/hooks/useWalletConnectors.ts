import { useMemo } from "react";
import { useConnectors } from "wagmi";
import { dedupeConnectors } from "@/lib/walletConnectors";

export function useWalletConnectors() {
  const connectors = useConnectors();
  return useMemo(() => dedupeConnectors(connectors), [connectors]);
}
