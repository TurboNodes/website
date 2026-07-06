import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { LoginCard } from "@/components/auth/LoginCard";
import { useAuth } from "@/hooks/useAuth";

function getSafeRedirectPath(redirect: string | string[] | undefined): string {
  if (typeof redirect !== "string" || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/dashboard";
  }
  return redirect;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const redirectTo = getSafeRedirectPath(router.query.redirect);

  useEffect(() => {
    if (!router.isReady || authLoading || !isAuthenticated) return;
    void router.replace(redirectTo);
  }, [router.isReady, authLoading, isAuthenticated, redirectTo, router]);

  if (!router.isReady || authLoading) {
    return (
      <AuthShell title="Sign In | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-400">Loading…</p>
        </AuthCard>
      </AuthShell>
    );
  }

  if (isAuthenticated) {
    return (
      <AuthShell title="Sign In | Turbo">
        <AuthCard className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-400">Redirecting…</p>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Sign In | Turbo">
      <LoginCard redirectTo={redirectTo} />
    </AuthShell>
  );
}
