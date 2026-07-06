import Head from "next/head";
import { NetworkAccessPage } from "@/components/network-access/NetworkAccessPage";

export default function NetworkAccess() {
  return (
    <>
      <Head>
        <title>Network Access — Residential Proxies | Turbo</title>
        <meta
          name="description"
          content="Internet-scale residential proxy infrastructure for businesses, researchers, and automators. Geo-diverse egress from real homes."
        />
        <link rel="canonical" href="https://turbo.network/network-access" />
      </Head>
      <NetworkAccessPage />
    </>
  );
}
