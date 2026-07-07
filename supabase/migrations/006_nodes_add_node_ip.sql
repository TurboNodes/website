-- Add a stable "node IP / node name" identifier for pairing.
-- nodes.id remains a UUID primary key.

ALTER TABLE nodes
  ADD COLUMN IF NOT EXISTS "nodeIp" TEXT;

-- Unique index for ON CONFLICT (nodeIp).
-- Postgres allows multiple NULLs in a unique index, so this is safe.
DROP INDEX IF EXISTS nodes_node_ip_unique;
CREATE UNIQUE INDEX IF NOT EXISTS nodes_node_ip_unique
  ON nodes ("nodeIp");

