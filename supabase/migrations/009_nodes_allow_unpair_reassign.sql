-- Unpairing now clears nodes.userId (see 009 update to unpair.ts) instead of
-- deleting the row, so a node keeps its id, nodeIp and dailyEarnings history
-- across an unpair/re-pair cycle rather than starting over from zero.
--
-- The 008 trigger blocked every userId change, which made that update
-- impossible. Narrow it to what it was actually protecting against: a node
-- owned by one user being handed to a different user without going through
-- unpair first. Clearing to NULL (unpair) and claiming from NULL (pair) are
-- both still allowed.

CREATE OR REPLACE FUNCTION public.prevent_node_user_reassign()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD."userId" IS NOT NULL
       AND NEW."userId" IS NOT NULL
       AND NEW."userId" IS DISTINCT FROM OLD."userId" THEN
      RAISE EXCEPTION 'nodes.userId cannot be reassigned directly; unpair first';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
