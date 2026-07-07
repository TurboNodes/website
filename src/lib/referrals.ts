export const COMMISSION_RATE = 0.1;
export const NEW_USER_REFERRAL_WINDOW_MINUTES = 30;

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidReferralCode(code: string): boolean {
  return /^[A-Z0-9]{6,12}$/i.test(code.trim());
}

export function buildReferralLink(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "https://turbo.network");
  return `${base}/r/${code}`;
}

export function buildJoinPath(code: string): string {
  return `/r/${encodeURIComponent(normalizeReferralCode(code))}`;
}

export function buildReferralShareText(link: string): string {
  return `Earn passive income sharing bandwidth with Turbo. Join with my link: ${link}`;
}

export function anonymizeReferralUser(username?: string | null, email?: string | null): string {
  if (username && username.length >= 2) {
    return `${username.slice(0, 2)}***`;
  }
  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local.length >= 2) return `${local.slice(0, 2)}***`;
    return "user***";
  }
  return "user***";
}

/** Clears legacy referral cookies from older flows. */
export function getClearReferralCookieHeaderValue(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `turbo_ref=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
