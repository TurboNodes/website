export const REFERRAL_COOKIE_NAME = "turbo_ref";
export const REFERRAL_STORAGE_KEY = "turbo_ref";
export const REFERRAL_COOKIE_MAX_AGE_DAYS = 30;

export const COMMISSION_RATE = 0.1;
export const NEW_USER_REFERRAL_WINDOW_MINUTES = 30;

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidReferralCode(code: string): boolean {
  return /^[A-Z0-9]{6,12}$/i.test(code.trim());
}

export function getReferralCookieMaxAgeSec(): number {
  return REFERRAL_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
}

export function buildReferralLink(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "https://turbo.network");
  return `${base}/r/${code}`;
}

export function buildJoinPath(code: string): string {
  return `/join?ref=${encodeURIComponent(normalizeReferralCode(code))}`;
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

export function setReferralCookie(code: string): void {
  if (typeof document === "undefined") return;
  const maxAge = getReferralCookieMaxAgeSec();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function persistReferralCode(code: string): void {
  const normalized = normalizeReferralCode(code);
  if (!isValidReferralCode(normalized)) return;

  setReferralCookie(normalized);

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  }
}

export function getReferralCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredReferralCode(): string | null {
  const fromCookie = getReferralCookie();
  if (fromCookie) return fromCookie;

  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(REFERRAL_STORAGE_KEY);
}

export function clearStoredReferralCode(): void {
  if (typeof document !== "undefined") {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  }
}

export function getReferralCookieHeaderValue(code: string): string {
  const maxAge = getReferralCookieMaxAgeSec();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(normalizeReferralCode(code))}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}
