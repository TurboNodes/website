import { http, createConfig, type Config } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { walletConnect } from "@wagmi/connectors/walletConnect";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

let wagmiConfig: Config | undefined;

/** Lazily create wagmi config so wallet discovery only runs when needed. */
export function getWagmiConfig(): Config {
  if (!wagmiConfig) {
    wagmiConfig = createConfig({
      chains: [mainnet, base],
      // Browser wallets are discovered via EIP-6963 (Phantom, MetaMask, etc.).
      // Do not add generic injected() — it duplicates EIP-6963 entries and races
      // on window.ethereum when multiple extensions are installed.
      connectors: [
        ...(walletConnectProjectId
          ? [
              walletConnect({
                projectId: walletConnectProjectId,
                showQrModal: true,
              }),
            ]
          : []),
      ],
      multiInjectedProviderDiscovery: true,
      transports: {
        [mainnet.id]: http(),
        [base.id]: http(),
      },
      ssr: true,
    });
  }
  return wagmiConfig;
}
