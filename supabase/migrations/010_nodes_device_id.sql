-- A node's earnings and pairing are now keyed on a client-generated,
-- persistent device id rather than nodeIp. nodeIp is just the address the
-- network handed the node's connection at some point in time — on a dynamic
-- IP a different physical machine can be handed the same address later, and
-- until now that meant it would silently inherit the previous node's row
-- (owner, isActive, dailyEarnings and all).
--
-- nodeIp stays as an informational/display column (last known address); it
-- is no longer unique or an identity.

ALTER TABLE nodes
  ADD COLUMN IF NOT EXISTS "deviceId" TEXT;

DROP INDEX IF EXISTS nodes_node_ip_unique;
CREATE UNIQUE INDEX IF NOT EXISTS nodes_device_id_unique
  ON nodes ("deviceId");

ALTER TABLE node_connect_requests
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Existing rows predate device ids and have no way to acquire one
-- retroactively; they are inert until/unless reconciled by hand. Nodes
-- reconnecting with an updated client mint their own device id on first
-- launch and pair as new rows going forward.
