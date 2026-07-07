-- Node pairing via /connect?uuid=...
--
-- Flow:
-- - A node client inserts (uuid, node_ip, expires_at) into node_connect_requests
-- - The website validates the uuid server-side (service role)
-- - After user sign-in, the website claims the uuid and links the user to the node (by node_ip)

CREATE TABLE IF NOT EXISTS node_connect_requests (
  uuid UUID PRIMARY KEY,
  node_ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at TIMESTAMPTZ,
  consumed_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS node_connect_requests_expires_at_idx
  ON node_connect_requests (expires_at DESC);

CREATE INDEX IF NOT EXISTS node_connect_requests_consumed_at_idx
  ON node_connect_requests (consumed_at);

ALTER TABLE node_connect_requests ENABLE ROW LEVEL SECURITY;

-- The node client is unauthenticated (no user yet). Allow inserts only.
-- The website uses the service role key server-side (bypasses RLS) to resolve/claim.
DROP POLICY IF EXISTS node_connect_requests_insert_any ON node_connect_requests;
CREATE POLICY node_connect_requests_insert_any
  ON node_connect_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

