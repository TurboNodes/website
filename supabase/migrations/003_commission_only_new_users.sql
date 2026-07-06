-- Remove $5 milestone bonus; block referrals for existing users

-- ---------------------------------------------------------------------------
-- Commission only (no milestone bonus)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION process_referral_earnings(p_referred_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  ref_row RECORD;
  new_total DECIMAL(18, 4);
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
-- Claim referral: new signups only
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION claim_referral(p_ref_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_referrer_id UUID;
  v_code TEXT;
  v_auth_created_at TIMESTAMPTZ;
  v_user_created_at TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  v_code := upper(trim(p_ref_code));
  IF v_code IS NULL OR v_code = '' THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'no_ref_code');
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND "referredById" IS NOT NULL) THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'already_attributed');
  END IF;

  IF EXISTS (SELECT 1 FROM referrals WHERE "referredId" = v_user_id) THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'already_attributed');
  END IF;

  SELECT created_at INTO v_auth_created_at
  FROM auth.users
  WHERE id = v_user_id;

  IF v_auth_created_at IS NULL OR v_auth_created_at < now() - interval '30 minutes' THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'existing_user');
  END IF;

  SELECT "createdAt" INTO v_user_created_at
  FROM users
  WHERE id = v_user_id;

  IF v_user_created_at IS NOT NULL AND v_user_created_at < now() - interval '30 minutes' THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'existing_user');
  END IF;

  IF EXISTS (SELECT 1 FROM nodes WHERE "userId" = v_user_id) THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'existing_user');
  END IF;

  SELECT id INTO v_referrer_id FROM users WHERE "referralCode" = v_code;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'invalid_ref_code');
  END IF;

  IF v_referrer_id = v_user_id THEN
    RETURN jsonb_build_object('ok', true, 'attributed', false, 'reason', 'self_referral');
  END IF;

  UPDATE users
  SET "referredById" = v_referrer_id
  WHERE id = v_user_id AND "referredById" IS NULL;

  INSERT INTO referrals ("referrerId", "referredId")
  VALUES (v_referrer_id, v_user_id);

  RETURN jsonb_build_object('ok', true, 'attributed', true);
END;
$$;

GRANT EXECUTE ON FUNCTION claim_referral(TEXT) TO authenticated;
