-- Unpairing clears nodes.userId to NULL rather than deleting the row, so the
-- node keeps its id, deviceId and dailyEarnings history across an
-- unpair/re-pair cycle (see /api/nodes/unpair and /api/connect/claim).
--
-- Migration 009 relaxed the trigger that blocked the userId change, but the
-- column itself was still NOT NULL, so every unpair failed with:
--   null value in column "userId" of relation "nodes" violates not-null constraint
--
-- "No owner" is now a real, representable state for a node row: an unpaired
-- node that still has its history. Both readers already treat NULL as
-- unpaired — the Go server's GetNodeUserID maps it to "", and claim.ts
-- claims rows with `.is("userId", null)`.

ALTER TABLE nodes
  ALTER COLUMN "userId" DROP NOT NULL;
