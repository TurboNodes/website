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
import { formatWeb3AuthError, WEB3_AUTH_STATEMENT } from "@/lib/web3Auth";
import type { EthereumWallet, SolanaWallet } from "@supabase/auth-js";
import type { Session, User } from "@supabase/supabase-js";
import type { Hex } from "viem";

export type Web3AuthChain = "ethereum" | "solana";

interface EthereumSignInOptions {
  wallet?: EthereumWallet;
  message?: string;
  signature?: Hex;
  redirectTo?: string;
  refCode?: string;
}

interface SolanaSignInOptions {
  wallet?: SolanaWallet;
  message?: string;
  signature?: Uint8Array;
  redirectTo?: string;
  refCode?: string;
}

function buildOAuthCallbackUrl(redirectTo?: string, refCode?: string): string {
  const url = new URL(`${window.location.origin}/auth/callback`);
  if (redirectTo) url.searchParams.set("redirect", redirectTo);
  if (refCode) url.searchParams.set("ref", refCode);
  return url.toString();
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signInWithDiscord: (redirectTo?: string, refCode?: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string, refCode?: string) => Promise<void>;
  signInWithWeb3Wallet: {
    (chain: "ethereum", options?: EthereumSignInOptions): Promise<void>;
    (chain: "solana", options?: SolanaSignInOptions): Promise<void>;
  };
  signOut: () => Promise<void>;
  clearAuthError: () => void;
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

  const signInWithDiscord = useCallback(async (redirectTo?: string, refCode?: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: buildOAuthCallbackUrl(redirectTo, refCode),
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

  const signInWithGoogle = useCallback(async (redirectTo?: string, refCode?: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildOAuthCallbackUrl(redirectTo, refCode),
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

  const signInWithWeb3Wallet = useCallback(
    async (
      chain: Web3AuthChain,
      options?: EthereumSignInOptions | SolanaSignInOptions,
    ) => {
      // Web3 flows can involve multiple wallet prompts (connect + sign). We avoid
      // toggling the global `loading` flag here because it replaces the entire
      // auth UI with a spinner. Instead, the calling component shows a local
      // pending state for the clicked wallet option.
      setAuthState((prev) => ({ ...prev, error: null }));

      try {
        const ethereumOptions =
          chain === "ethereum" ? (options as EthereumSignInOptions | undefined) : undefined;
        const solanaOptions =
          chain === "solana" ? (options as SolanaSignInOptions | undefined) : undefined;

        const { data, error } =
          chain === "ethereum"
            ? await supabase.auth.signInWithWeb3(
                ethereumOptions?.message && ethereumOptions.signature
                  ? {
                      chain: "ethereum",
                      message: ethereumOptions.message,
                      signature: ethereumOptions.signature,
                    }
                  : {
                      chain: "ethereum",
                      statement: WEB3_AUTH_STATEMENT,
                      ...(ethereumOptions?.wallet
                        ? { wallet: ethereumOptions.wallet as EthereumWallet }
                        : {}),
                      options: {
                        url: window.location.href,
                      },
                    },
              )
            : await supabase.auth.signInWithWeb3(
                solanaOptions?.message && solanaOptions.signature
                  ? {
                      chain: "solana",
                      message: solanaOptions.message,
                      signature: solanaOptions.signature,
                    }
                  : {
                      chain: "solana",
                      statement: WEB3_AUTH_STATEMENT,
                      ...(solanaOptions?.wallet
                        ? { wallet: solanaOptions.wallet as SolanaWallet }
                        : {}),
                      options: {
                        url: window.location.href,
                      },
                    },
              );

        if (error) {
          console.error(`${chain} wallet sign-in error:`, error);
          throw new Error(
            formatWeb3AuthError(error, `Failed to sign in with ${chain} wallet.`),
          );
        }

        if (data.session) {
          await bootstrapUserAfterAuth(data.session, options?.refCode);

          if (options?.redirectTo) {
            router.push(options.redirectTo);
          }
        }
      } catch (err) {
        console.error(`Unexpected error during ${chain} wallet sign-in:`, err);
        throw new Error(
          formatWeb3AuthError(err, `Failed to sign in with ${chain} wallet.`),
        );
      }
    },
    [router],
  );

  const clearAuthError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
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
        router.push("/login");
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

      router.push("/login");
    } catch (err) {
      console.error("Unexpected error during sign-out:", err);
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
      router.push("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      signInWithDiscord,
      signInWithGoogle,
      signInWithWeb3Wallet,
      signOut,
      clearAuthError,
      isAuthenticated: !!authState.user,
    }),
    [
      authState,
      signInWithDiscord,
      signInWithGoogle,
      signInWithWeb3Wallet,
      signOut,
      clearAuthError,
    ],
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
