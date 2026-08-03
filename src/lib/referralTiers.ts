/**
 * Tiered referral commission rates.
 *
 * IMPORTANT: this ladder is mirrored in SQL by `referral_commission_rate()` in
 * supabase/migrations/005_tiered_referral_commission.sql. Postgres computes the
 * commission actually paid; this file only renders it. Any change here must be
 * applied there in the same commit, or the UI will advertise a rate the
 * database does not pay.
 */

/** Node earnings a referred user must exceed before the referral counts toward a tier. */
export const VERIFIED_EARNINGS_THRESHOLD = 1;

export interface ReferralTier {
  id: number;
  name: string;
  /** Minimum verified referrals required to reach this tier. */
  minVerified: number;
  /** Commission rate as a fraction, e.g. 0.075 for 7.5%. */
  rate: number;
}

export const REFERRAL_TIERS: readonly ReferralTier[] = [
  { id: 1, name: "Relay", minVerified: 0, rate: 0.05 },
  { id: 2, name: "Hub", minVerified: 5, rate: 0.075 },
  { id: 3, name: "Gateway", minVerified: 10, rate: 0.1 },
  { id: 4, name: "Core", minVerified: 25, rate: 0.2 },
  { id: 5, name: "Backbone", minVerified: 50, rate: 0.3 },
];

export const BASE_REFERRAL_TIER = REFERRAL_TIERS[0];
export const TOP_REFERRAL_TIER = REFERRAL_TIERS[REFERRAL_TIERS.length - 1];

/** Highest tier unlocked by `verifiedCount`. */
export function getTier(verifiedCount: number): ReferralTier {
  let tier = BASE_REFERRAL_TIER;
  for (const candidate of REFERRAL_TIERS) {
    if (verifiedCount >= candidate.minVerified) tier = candidate;
  }
  return tier;
}

/** The tier above the current one, or null when already at the top. */
export function getNextTier(verifiedCount: number): ReferralTier | null {
  return REFERRAL_TIERS.find((tier) => verifiedCount < tier.minVerified) ?? null;
}

/** Verified referrals still needed to reach the next tier. 0 when at the top. */
export function verifiedUntilNextTier(verifiedCount: number): number {
  const next = getNextTier(verifiedCount);
  return next ? Math.max(0, next.minVerified - verifiedCount) : 0;
}

/** Progress through the current tier toward the next, as a 0-1 fraction. */
export function tierProgress(verifiedCount: number): number {
  const next = getNextTier(verifiedCount);
  if (!next) return 1;
  const current = getTier(verifiedCount);
  const span = next.minVerified - current.minVerified;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (verifiedCount - current.minVerified) / span));
}

/** 0.075 -> "7.5%", 0.1 -> "10%" */
export function formatRate(rate: number): string {
  const percent = rate * 100;
  return `${Number.isInteger(percent) ? percent : Number(percent.toFixed(2))}%`;
}

/** Inclusive-exclusive verified range label for a tier, e.g. "5-9" or "50+". */
export function formatTierRange(tier: ReferralTier): string {
  const next = REFERRAL_TIERS.find((t) => t.minVerified > tier.minVerified);
  return next ? `${tier.minVerified}-${next.minVerified - 1}` : `${tier.minVerified}+`;
}
