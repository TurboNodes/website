import Head from "next/head";
import { DownloadPage } from "@/components/download/DownloadPage";

export default function Download() {
  return (
    <>
      <Head>
        <title>Download Turbo — All Platforms</title>
        <meta
          name="description"
          content="Download the Turbo client for Windows, macOS, and Linux. Install via direct download, curl, or Docker."
        />
        <link rel="canonical" href="https://turbo.network/download" />
      </Head>
      <DownloadPage />
    </>
  );
}
