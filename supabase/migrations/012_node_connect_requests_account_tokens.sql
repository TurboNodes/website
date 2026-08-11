-- Account-initiated pairing ("install tokens"), the reverse of the flow this
-- table was built for.
--
-- Until now every row here was node-initiated: a node minted a uuid for its
-- own device_id, the server handed the user a /connect?uuid=... link, and the
-- website claimed it after sign-in. That requires a browser on the node's
-- machine, which a headless server does not have.
--
-- The new direction: a signed-in user mints a uuid tied to their account
-- *before any node exists*, and pastes it into a terminal install command on
-- the target machine. The node presents it on connect and the Go server claims
-- it (see ClaimInstallToken in the Turbo backend), binding nodes.userId with
-- no browser round-trip.
--
-- Both directions share this table because the lifecycle is identical -- mint,
-- expire, consume once -- only the direction differs. `source` records which,
-- so the two are never confusable: a node-initiated uuid must not be usable as
-- an install token, and vice versa.

ALTER TABLE node_connect_requests
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'node'
    CHECK (source IN ('node', 'account'));

-- An account-initiated row is minted before the node is known: device_id and
-- node_ip are both filled in later, at claim time, from the connecting node.
ALTER TABLE node_connect_requests
  ALTER COLUMN node_ip DROP NOT NULL;

-- Lookups now happen by (uuid, source) rather than uuid alone.
CREATE INDEX IF NOT EXISTS node_connect_requests_source_idx
  ON node_connect_requests (source);

-- The 005 policy was WITH CHECK (true) -- fine when every column was
-- self-describing and a row conferred nothing on its own, but user_id does:
-- a row claiming to belong to a user is what binds a node to that account.
-- Left open, any authenticated caller could insert an account-sourced row
-- naming someone *else* as user_id straight through PostgREST, bypassing
-- /api/connect/install-token, and pair their own node into that user's
-- dashboard.
--
-- Split it in two so each direction can only assert what it is entitled to.
-- Our own API routes are unaffected either way: they use the service-role
-- client, which bypasses RLS entirely (same as claim.ts and unpair.ts).
DROP POLICY IF EXISTS node_connect_requests_insert_any ON node_connect_requests;

-- Node-initiated: still unauthenticated (the node has no user yet), still
-- free to insert, but may not name an owner.
CREATE POLICY node_connect_requests_insert_node
  ON node_connect_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    source = 'node'
    AND user_id IS NULL
    AND device_id IS NOT NULL
  );

-- Account-initiated: must be signed in, and may only mint tokens for oneself.
CREATE POLICY node_connect_requests_insert_account
  ON node_connect_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    source = 'account'
    AND user_id = auth.uid()
    AND device_id IS NULL
  );

-- The 007 cleanup job needs no change: it deletes by expires_at/consumed_at,
-- which both directions populate identically.
