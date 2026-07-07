import Head from "next/head";
import type { GetServerSideProps } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { redirectToJoinWithReferral } from "@/lib/joinReferral";
import { isValidReferralCode } from "@/lib/referrals";

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
          href="/ai-sunset.png"
          fetchPriority="high"
        />
      </Head>
      <LandingPage />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ref = context.query.ref;
  if (typeof ref === "string" && isValidReferralCode(ref)) {
    return redirectToJoinWithReferral(context, ref);
  }

  return { props: {} };
};
