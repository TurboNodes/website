import Head from "next/head";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  return (
    <>
      <Head>
        <title>Turbo: Earn Passive Income</title>
        <meta
          name="description"
          content="Share your unused bandwidth with Turbo. Learn how the node works, then download, install, and connect in minutes."
        />
        <link
          rel="preload"
          as="image"
          href="/hero-powerlines.jpg"
          fetchPriority="high"
        />
      </Head>
      <LandingPage />
    </>
  );
}
