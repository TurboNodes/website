-- Daily cleanup for node_connect_requests
-- Removes expired requests and old consumed requests.

-- pg_cron lives in the `extensions` schema on Supabase.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.cleanup_node_connect_requests()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Delete expired (whether consumed or not)
  DELETE FROM public.node_connect_requests
  WHERE expires_at < now();

  -- Delete consumed requests after 7 days (audit window)
  DELETE FROM public.node_connect_requests
  WHERE consumed_at IS NOT NULL
    AND consumed_at < now() - interval '7 days';
$$;

-- Schedule daily at 03:15 UTC. Idempotent by job name.
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'cleanup-node-connect-requests'
  ) THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'cleanup-node-connect-requests';
  END IF;

  PERFORM cron.schedule(
    'cleanup-node-connect-requests',
    '15 3 * * *',
    $$SELECT public.cleanup_node_connect_requests();$$
  );
END
$do$;

