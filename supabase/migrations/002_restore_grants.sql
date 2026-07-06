-- Restore PostgREST role grants (fixes "permission denied for schema public")
-- Safe to re-run: GRANT is idempotent.

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Ensure new referral tables are exposed to API roles
GRANT ALL ON TABLE referrals TO service_role;
GRANT ALL ON TABLE referral_earnings TO service_role;
GRANT SELECT ON TABLE referrals TO authenticated;
GRANT SELECT ON TABLE referral_earnings TO authenticated;

-- Default privileges for objects created later in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: allow referrers to read referred users and their nodes (for dashboard)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS users_select_referred_by_referrer ON users;
CREATE POLICY users_select_referred_by_referrer ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM referrals r
      WHERE r."referredId" = users.id
        AND r."referrerId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS nodes_select_referred_by_referrer ON nodes;
CREATE POLICY nodes_select_referred_by_referrer ON nodes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM referrals r
      WHERE r."referredId" = nodes."userId"
        AND r."referrerId" = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RPC: claim referral without service-role key
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
