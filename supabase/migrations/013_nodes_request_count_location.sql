-- Per-node request count and human-readable location.
--
-- The dashboard has always had a "Requests" column and a "Location" column; it
-- filled them with a hardcoded 0 and "Unknown" because nothing stored either.
-- Both are now written by the Go server, which is the only place that knows
-- them: it hands each proxied connection to a node (see AddNodeStats) and
-- already resolves the node's country to route it.
--
-- location is plain text -- "France", not "FR". The ISO code stays where it
-- belongs, in the router's pool keys and the server-side ip_geo cache; what
-- lands here is only ever read to be shown to a person, so it is stored the way
-- it is displayed rather than re-translated in every client. Nodes we cannot
-- place read "Unknown".
--
-- requestCount is cumulative and additive: the server holds per-connection
-- counters that reset when a node reconnects, and flushes deltas into this
-- column, so the row keeps the node's lifetime total across reconnects and
-- across unpair/re-pair cycles (which keep the row -- see migration 011).
--
-- No new grants or policies: both columns are on `nodes`, which is already
-- exposed to the API roles with RLS in place, and column-level privileges are
-- not in use, so the existing table grants cover them.

ALTER TABLE nodes
  ADD COLUMN IF NOT EXISTS "requestCount" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location       TEXT;

COMMENT ON COLUMN nodes."requestCount" IS
  'Lifetime count of proxied connections served by this node. Written additively by the Turbo server.';
COMMENT ON COLUMN nodes.location IS
  'Node country as display text, e.g. "France". "Unknown" when it could not be geolocated.';
