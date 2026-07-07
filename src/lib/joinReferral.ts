import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { validateReferralCode } from "@/lib/referralValidation";
import {
  getClearReferralCookieHeaderValue,
  isValidReferralCode,
  normalizeReferralCode,
} from "@/lib/referrals";

export interface JoinReferralProps {
  prefillReferralCode: string | null;
  referralCodeError: "invalid" | null;
}

function clearLegacyReferralCookie(context: GetServerSidePropsContext): void {
  context.res.setHeader("Set-Cookie", getClearReferralCookieHeaderValue());
}

/** Validate a referral code and redirect to /join with a prefill query param (not stored). */
export async function redirectToJoinWithReferral(
  context: GetServerSidePropsContext,
  rawCode: string,
): Promise<GetServerSidePropsResult<never>> {
  const normalized = normalizeReferralCode(rawCode);

  if (!isValidReferralCode(normalized)) {
    clearLegacyReferralCookie(context);
    return { redirect: { destination: "/join", permanent: false } };
  }

  const validation = await validateReferralCode(normalized);

  if (!validation.valid || !validation.code) {
    clearLegacyReferralCookie(context);
    return {
      redirect: { destination: "/join?referral_error=invalid", permanent: false },
    };
  }

  clearLegacyReferralCookie(context);

  return {
    redirect: {
      destination: `/join?prefill=${encodeURIComponent(validation.code)}`,
      permanent: false,
    },
  };
}

/** Resolve join page props from a one-time prefill query param. */
export async function getJoinReferralProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<JoinReferralProps>> {
  clearLegacyReferralCookie(context);

  const ref = context.query.ref;
  if (typeof ref === "string" && isValidReferralCode(ref)) {
    return redirectToJoinWithReferral(context, ref);
  }

  const referralErrorParam = context.query.referral_error;
  if (referralErrorParam === "invalid") {
    return {
      props: {
        prefillReferralCode: null,
        referralCodeError: "invalid",
      },
    };
  }

  const prefill = context.query.prefill;
  if (typeof prefill === "string" && isValidReferralCode(prefill)) {
    const validation = await validateReferralCode(normalizeReferralCode(prefill));
    if (validation.valid && validation.code) {
      return {
        props: {
          prefillReferralCode: validation.code,
          referralCodeError: null,
        },
      };
    }

    return {
      props: {
        prefillReferralCode: null,
        referralCodeError: "invalid",
      },
    };
  }

  return {
    props: {
      prefillReferralCode: null,
      referralCodeError: null,
    },
  };
}
