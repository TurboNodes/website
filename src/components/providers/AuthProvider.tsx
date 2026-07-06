import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { bootstrapUserAfterAuth } from "@/lib/claimReferral";
import type { Session, User } from "@supabase/supabase-js";

function buildOAuthCallbackUrl(redirectTo?: string): string {
  const base = `${window.location.origin}/auth/callback`;
  if (!redirectTo) return base;
  return `${base}?redirect=${encodeURIComponent(redirectTo)}`;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signInWithDiscord: (redirectTo?: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const runBootstrap = (session: Session | null) => {
      if (!session?.user) return;
      void bootstrapUserAfterAuth(session);
    };

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting initial session:", error);
          setAuthState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
          }));
          return;
        }

        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false,
          error: null,
        });

        runBootstrap(session);
      } catch (err) {
        console.error("Unexpected error getting session:", err);
        if (mounted) {
          setAuthState((prev) => ({
            ...prev,
            error: "Failed to get session",
            loading: false,
          }));
        }
      }
    };

    void getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      });

      if (event === "SIGNED_IN") {
        runBootstrap(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithDiscord = useCallback(async (redirectTo?: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: buildOAuthCallbackUrl(redirectTo),
        },
      });

      if (error) {
        console.error("Discord sign-in error:", error);
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    } catch (err) {
      console.error("Unexpected error during Discord sign-in:", err);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to initiate Discord sign-in",
        loading: false,
      }));
    }
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildOAuthCallbackUrl(redirectTo),
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    } catch (err) {
      console.error("Unexpected error during Google sign-in:", err);
      setAuthState((prev) => ({
        ...prev,
        error: "Failed to initiate Google sign-in",
        loading: false,
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
        router.push("/");
        return;
      }

      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        console.error("Sign-out error:", error);
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      router.push("/");
    } catch (err) {
      console.error("Unexpected error during sign-out:", err);
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
      router.push("/");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      signInWithDiscord,
      signInWithGoogle,
      signOut,
      isAuthenticated: !!authState.user,
    }),
    [authState, signInWithDiscord, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
