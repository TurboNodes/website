import type { GetServerSideProps } from "next";
import { redirectToJoinWithReferral } from "@/lib/joinReferral";
import { isValidReferralCode } from "@/lib/referrals";

export default function ReferralRedirect() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code;
  if (typeof code !== "string" || !isValidReferralCode(code)) {
    return { redirect: { destination: "/join", permanent: false } };
  }

  return redirectToJoinWithReferral(context, code);
};
