import React, { useEffect, useState } from "react";
import { type Config, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getWagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient();

export function Web3Provider({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    setConfig(getWagmiConfig());
  }, []);

  if (!config) return <>{fallback}</>;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
