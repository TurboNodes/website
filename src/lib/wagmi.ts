import { http, createConfig, type Config } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet } from "@wagmi/connectors/coinbaseWallet";
import { metaMask } from "@wagmi/connectors/metaMask";
import { walletConnect } from "@wagmi/connectors/walletConnect";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://turbo.network";

let wagmiConfig: Config | undefined;

/** Lazily create wagmi config so wallet discovery only runs when needed. */
export function getWagmiConfig(): Config {
  if (!wagmiConfig) {
    wagmiConfig = createConfig({
      chains: [mainnet, base],
      // EIP-6963 discovers installed extensions (Rabby, Phantom EVM, Brave, etc.).
      // SDK connectors below cover users without extensions (mobile, deep links, QR).
      // Do not add generic injected() — it duplicates EIP-6963 and races on window.ethereum.
      connectors: [
        metaMask({
          dapp: {
            name: "Turbo",
            url: appOrigin,
          },
        }),
        coinbaseWallet({
          appName: "Turbo",
        }),
        ...(walletConnectProjectId
          ? [
              walletConnect({
                projectId: walletConnectProjectId,
                showQrModal: true,
                metadata: {
                  name: "Turbo",
                  description: "Turbo network",
                  url: appOrigin,
                  icons: [`${appOrigin}/favicon.ico`],
                },
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
