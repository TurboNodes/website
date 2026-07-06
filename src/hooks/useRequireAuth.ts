import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

/** Redirects unauthenticated users to `/login` with a return path. */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || isAuthenticated) return;

    const redirect = encodeURIComponent(router.asPath);
    void router.replace(`/login?redirect=${redirect}`);
  }, [loading, isAuthenticated, router]);

  return { isAuthenticated, loading };
}
