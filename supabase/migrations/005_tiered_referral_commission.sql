-- Tiered referral commission based on verified referrals
--
-- Replaces the flat 10% rate with a five-tier ladder. A referral is "verified"
-- once the referred user's node operator earnings exceed the threshold below,
-- which prevents fake signups from lifting a referrer into a higher tier.
--
-- IMPORTANT: this ladder is mirrored in TypeScript by REFERRAL_TIERS in
-- src/lib/referralTiers.ts, which drives the dashboard UI. Any change here must
-- be applied there in the same commit.

-- ---------------------------------------------------------------------------
-- Record the rate each commission was paid at
-- ---------------------------------------------------------------------------

-- Pre-existing rows stay NULL and are treated as the legacy flat 10% by the UI.
ALTER TABLE referral_earnings
  ADD COLUMN IF NOT EXISTS rate DECIMAL(6, 5);

COMMENT ON COLUMN referral_earnings.rate IS
  'Commission rate applied to this payout (e.g. 0.07500). NULL for rows predating tiered commission (legacy flat 0.10).';

-- ---------------------------------------------------------------------------
-- Verified referral count
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION verified_referral_threshold()
RETURNS DECIMAL(18, 4)
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 1::DECIMAL(18, 4);
$$;

CREATE OR REPLACE FUNCTION count_verified_referrals(p_referrer_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM referrals r
  WHERE r."referrerId" = p_referrer_id
    AND calculate_user_node_earnings(r."referredId") > verified_referral_threshold();
$$;

COMMENT ON FUNCTION count_verified_referrals(UUID) IS
  'Number of a referrer''s referrals whose referred user has earned more than the verification threshold in node earnings.';

-- ---------------------------------------------------------------------------
-- Tier ladder
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION referral_commission_rate(p_referrer_id UUID)
RETURNS DECIMAL(6, 5)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  verified INTEGER;
BEGIN
  verified := count_verified_referrals(p_referrer_id);

  RETURN CASE
    WHEN verified >= 50 THEN 0.30000  -- Backbone
    WHEN verified >= 25 THEN 0.20000  -- Core
    WHEN verified >= 10 THEN 0.10000  -- Gateway
    WHEN verified >= 5  THEN 0.07500  -- Hub
    ELSE                     0.05000  -- Relay
  END;
END;
$$;

COMMENT ON FUNCTION referral_commission_rate(UUID) IS
  'Commission rate for a referrer based on verified referral count: 0-4 = 5%, 5-9 = 7.5%, 10-24 = 10%, 25-49 = 20%, 50+ = 30%.';

-- ---------------------------------------------------------------------------
-- Process referral commissions at the referrer's current tier rate
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION process_referral_earnings(p_referred_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  ref_row RECORD;
  new_node_total DECIMAL(18, 4);
  delta DECIMAL(18, 4);
  commission DECIMAL(18, 4);
  commission_rate DECIMAL(6, 5);
  referrer_id UUID;
BEGIN
  SELECT * INTO ref_row
  FROM referrals
  WHERE "referredId" = p_referred_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  referrer_id := ref_row."referrerId";
  new_node_total := calculate_user_node_earnings(p_referred_user_id);
  delta := new_node_total - ref_row."earningsCommissionedThrough";

  IF delta > 0 THEN
    -- Resolved live, so a referred user crossing the verification threshold can
    -- promote the referrer within this same event. Forward-only: previously
    -- commissioned earnings are never repriced.
    commission_rate := referral_commission_rate(referrer_id);
    commission := ROUND(delta * commission_rate, 4);

    IF commission > 0 THEN
      INSERT INTO referral_earnings ("referrerId", "referredId", type, amount, "sourceEarningsDelta", rate)
      VALUES (referrer_id, p_referred_user_id, 'commission', commission, delta, commission_rate);

      -- Credit referrer referral balance only — never users.totalEarnings / node earnings
      UPDATE users
      SET "referralBalance" = "referralBalance" + commission
      WHERE id = referrer_id;
    END IF;

    UPDATE referrals
    SET "earningsCommissionedThrough" = new_node_total
    WHERE id = ref_row.id;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants (match existing referral function exposure)
-- ---------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION verified_referral_threshold() TO authenticated;
GRANT EXECUTE ON FUNCTION count_verified_referrals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION referral_commission_rate(UUID) TO authenticated;
