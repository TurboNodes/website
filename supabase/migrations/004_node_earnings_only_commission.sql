-- Commission base: node operator earnings only (never referral balance or referral payouts)

-- ---------------------------------------------------------------------------
-- Node earnings only — excludes users.referralBalance and non-date JSON keys
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calculate_user_node_earnings(p_user_id UUID)
RETURNS DECIMAL(18, 4)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total DECIMAL(18, 4) := 0;
  node_row RECORD;
  earnings_key TEXT;
  earnings_value DECIMAL(18, 4);
BEGIN
  FOR node_row IN
    SELECT "dailyEarnings" FROM nodes WHERE "userId" = p_user_id
  LOOP
    IF node_row."dailyEarnings" IS NOT NULL AND jsonb_typeof(node_row."dailyEarnings") = 'object' THEN
      FOR earnings_key, earnings_value IN
        SELECT key, (value::text)::DECIMAL(18, 4)
        FROM jsonb_each(node_row."dailyEarnings")
      LOOP
        -- Only date-keyed entries are node operator earnings (YYYY-MM-DD).
        -- Referral payouts or other adjustments must not use date keys.
        IF earnings_key ~ '^\d{4}-\d{2}-\d{2}$' THEN
          total := total + COALESCE(earnings_value, 0);
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RETURN total;
END;
$$;

-- Backwards-compatible alias
CREATE OR REPLACE FUNCTION calculate_user_total_earnings(p_user_id UUID)
RETURNS DECIMAL(18, 4)
LANGUAGE sql
STABLE
AS $$
  SELECT calculate_user_node_earnings(p_user_id);
$$;

-- ---------------------------------------------------------------------------
-- Process referral commissions on node earnings deltas only
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
    commission := ROUND(delta * 0.10, 4);

    IF commission > 0 THEN
      INSERT INTO referral_earnings ("referrerId", "referredId", type, amount, "sourceEarningsDelta")
      VALUES (referrer_id, p_referred_user_id, 'commission', commission, delta);

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

COMMENT ON FUNCTION calculate_user_node_earnings(UUID) IS
  'Sum of node operator earnings (date-keyed dailyEarnings). Excludes referralBalance and referral payouts.';

COMMENT ON COLUMN referrals."earningsCommissionedThrough" IS
  'Node operator earnings total already commissioned. Referral income is never included.';
