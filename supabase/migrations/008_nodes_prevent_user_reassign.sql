-- Prevent a node from being reassigned to a different user.
-- This enforces "a node can't be paired twice" at the database layer.

CREATE OR REPLACE FUNCTION public.prevent_node_user_reassign()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW."userId" IS DISTINCT FROM OLD."userId" THEN
      RAISE EXCEPTION 'nodes.userId cannot be reassigned';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nodes_prevent_user_reassign ON public.nodes;
CREATE TRIGGER nodes_prevent_user_reassign
  BEFORE UPDATE OF "userId" ON public.nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_node_user_reassign();

