-- Referral system: schema, functions, triggers, and RLS

-- ---------------------------------------------------------------------------
-- Extend users table
-- ---------------------------------------------------------------------------

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "referralCode" TEXT,
  ADD COLUMN IF NOT EXISTS "referralBalance" DECIMAL(18, 4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "referredById" UUID REFERENCES users(id);

CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_key ON users ("referralCode");

-- Generate a unique 8-char alphanumeric referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
  attempts INT := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM users WHERE "referralCode" = result) THEN
      RETURN result;
    END IF;

    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique referral code';
    END IF;
  END LOOP;
END;
$$;

-- Backfill referral codes for existing users
UPDATE users
SET "referralCode" = generate_referral_code()
WHERE "referralCode" IS NULL;

-- Auto-generate referral code on insert
CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."referralCode" IS NULL OR NEW."referralCode" = '' THEN
    NEW."referralCode" := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_set_referral_code ON users;
CREATE TRIGGER users_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_referral_code();

ALTER TABLE users
  ALTER COLUMN "referralCode" SET NOT NULL;

-- ---------------------------------------------------------------------------
-- Referrals relationship table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "referredId" UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  "earningsCommissionedThrough" DECIMAL(18, 4) NOT NULL DEFAULT 0,
  "milestoneBonusPaid" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals ("referrerId");

-- ---------------------------------------------------------------------------
-- Referral earnings ledger
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "referredId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('milestone_bonus', 'commission')),
  amount DECIMAL(18, 4) NOT NULL,
  "sourceEarningsDelta" DECIMAL(18, 4),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_earnings_referrer_id_idx ON referral_earnings ("referrerId");
CREATE INDEX IF NOT EXISTS referral_earnings_created_at_idx ON referral_earnings ("createdAt" DESC);

-- ---------------------------------------------------------------------------
-- Earnings calculation (mirrors client-side calculateTotalEarnings)
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
        IF earnings_key ~ '^\d{4}-\d{2}-\d{2}$' THEN
          total := total + COALESCE(earnings_value, 0);
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_user_total_earnings(p_user_id UUID)
RETURNS DECIMAL(18, 4)
LANGUAGE sql
STABLE
AS $$
  SELECT calculate_user_node_earnings(p_user_id);
$$;

-- ---------------------------------------------------------------------------
-- Process referral commissions (10% lifetime)
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
  new_total := calculate_user_node_earnings(p_referred_user_id);
  delta := new_total - ref_row."earningsCommissionedThrough";

  IF delta > 0 THEN
    commission := ROUND(delta * 0.10, 4);

    IF commission > 0 THEN
      INSERT INTO referral_earnings ("referrerId", "referredId", type, amount, "sourceEarningsDelta")
      VALUES (referrer_id, p_referred_user_id, 'commission', commission, delta);

      -- Credit referrer referral balance only — never node/total earnings
      UPDATE users
      SET "referralBalance" = "referralBalance" + commission
      WHERE id = referrer_id;
    END IF;

    UPDATE referrals
    SET "earningsCommissionedThrough" = new_total
    WHERE id = ref_row.id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_process_referral_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM process_referral_earnings(NEW."userId");
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nodes_referral_earnings ON nodes;
CREATE TRIGGER nodes_referral_earnings
  AFTER INSERT OR UPDATE OF "dailyEarnings" ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_referral_earnings();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

-- Users can read referrals where they are the referrer
DROP POLICY IF EXISTS referrals_select_own ON referrals;
CREATE POLICY referrals_select_own ON referrals
  FOR SELECT
  USING (auth.uid() = "referrerId");

-- Users can read their own referral earnings
DROP POLICY IF EXISTS referral_earnings_select_own ON referral_earnings;
CREATE POLICY referral_earnings_select_own ON referral_earnings
  FOR SELECT
  USING (auth.uid() = "referrerId");

-- Users can read their own referral fields on users table
-- (Assumes RLS is enabled on users; add policy if not present)
DROP POLICY IF EXISTS users_select_referral_fields ON users;
CREATE POLICY users_select_referral_fields ON users
  FOR SELECT
  USING (auth.uid() = id);
