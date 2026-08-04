import Head from "next/head";
import { NetworkAccessPage } from "@/components/network-access/NetworkAccessPage";

export default function Network() {
  return (
    <>
      <Head>
        <title>Network Access — Consent-Based Residential Proxies | Turbo</title>
        <meta
          name="description"
          content="Proxies are no longer the bottleneck. Ethically sourced residential egress with 99.5% success rates, TLS-encrypted paths, and industry-leading latency across NA, Europe, and Asia-Pacific."
        />
        <link rel="canonical" href="https://turbo.network/network" />
      </Head>
      <NetworkAccessPage />
    </>
  );
}
