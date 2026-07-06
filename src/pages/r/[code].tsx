import type { GetServerSideProps } from "next";
import { getReferralCookieHeaderValue, isValidReferralCode, normalizeReferralCode } from "@/lib/referrals";

export default function ReferralRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code;
  if (typeof code !== "string" || !isValidReferralCode(code)) {
    return { redirect: { destination: "/join", permanent: false } };
  }

  const referralCode = normalizeReferralCode(code);

  context.res.setHeader("Set-Cookie", getReferralCookieHeaderValue(referralCode));

  return {
    redirect: {
      destination: `/join?ref=${encodeURIComponent(referralCode)}`,
      permanent: false,
    },
  };
};
