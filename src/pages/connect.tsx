import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AuthButtons } from "@/components/AuthButtons";
import { AuthCard, AuthShell } from "@/components/brand/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { AlertCircle, ArrowRight, Check, Loader2, LogIn, Server, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectPageProps =
  | { ok: true; uuid: string }
  | { ok: false; reason: "missing_uuid" | "invalid_uuid" | "unknown_uuid" | "expired_uuid" };

function isUuid(value: string): boolean {
  // Accept any RFC4122 UUID (not only v4).
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default function ConnectPage(props: ConnectPageProps) {
  const router = useRouter();
  const { user, session, loading, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<
    "checking" | "tutorial" | "signup" | "linking" | "success" | "already_paired" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const uuid = props.ok ? props.uuid : null;

  const redirectTo = useMemo(() => {
    if (!uuid) return "/connect";
    return `/connect?uuid=${encodeURIComponent(uuid)}`;
  }, [uuid]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!props.ok) {
      if (props.reason === "missing_uuid") {
        setStatus("tutorial");
        setErrorMessage("");
        return;
      }

      setStatus("error");
      setErrorMessage(
        props.reason === "invalid_uuid"
          ? "Invalid uuid."
          : props.reason === "expired_uuid"
            ? "This connect link has expired. Please generate a new one from your node."
            : "Unknown uuid. Please generate a new connect link from your node.",
      );
      return;
    }

    if (!loading && isAuthenticated && user && session?.access_token) {
      void (async () => {
        try {
          setStatus("linking");
          const response = await fetch("/api/connect/claim", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ uuid }),
          });

          const body = (await response.json().catch(() => null)) as
            | { ok: true; nodeIp: string }
            | { ok: false; error: string }
            | null;

          if (response.status === 409) {
            setStatus("already_paired");
            setErrorMessage(
              (body && "ok" in body && !body.ok && body.error) ||
                "This node is already connected to another user.",
            );
            return;
          }

          if (!response.ok || !body || !("ok" in body)) {
            throw new Error("Failed to connect node.");
          }

          if (!body.ok) {
            throw new Error(body.error || "Failed to connect node.");
          }

          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } catch (err) {
          console.error("Connect claim failed:", err);
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Failed to connect node.");
        }
      })();
      return;
    }

    if (!loading && !isAuthenticated) {
      setStatus("signup");
    }
  }, [router.isReady, props, loading, isAuthenticated, user, session?.access_token, uuid, router]);

  const statusDisplay = (() => {
    switch (status) {
      case "checking":
        return {
          icon: <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />,
          title: "Preparing connection",
          description: "Validating your connect link…",
          iconBg: "bg-orange-500/10 border-orange-500/30",
        };
      case "tutorial":
        return {
          icon: <Info className="w-6 h-6 text-orange-400" />,
          title: "Connect your node",
          description: "Open Turbo on your computer and use the tray icon to connect.",
          iconBg: "bg-orange-500/10 border-orange-500/30",
        };
      case "signup":
        return {
          icon: <LogIn className="w-6 h-6 text-orange-400" />,
          title: "Sign in to connect",
          description: "Sign in or create an account to pair this node with your user.",
          iconBg: "bg-orange-500/10 border-orange-500/30",
        };
      case "linking":
        return {
          icon: <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />,
          title: "Linking node",
          description: "Pairing your node with your account…",
          iconBg: "bg-emerald-500/10 border-emerald-500/30",
        };
      case "success":
        return {
          icon: <Check className="w-6 h-6 text-emerald-400" />,
          title: "Connected",
          description: "Your node has been paired successfully.",
          iconBg: "bg-emerald-500/10 border-emerald-500/30",
        };
      case "already_paired":
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
          title: "Already paired",
          description:
            errorMessage ||
            "This node is already connected to another user. Open Turbo on that machine and generate a new connect link if needed.",
          iconBg: "bg-amber-500/10 border-amber-500/30",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-400" />,
          title: "Can't connect",
          description: errorMessage || "We couldn't connect this node.",
          iconBg: "bg-red-500/10 border-red-500/30",
        };
    }
  })();

  return (
    <AuthShell title="Connect Node | Turbo">
      <AuthCard>
        <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-4 text-center">
          // connect
        </p>

        <div className="text-center mb-6">
          <div
            className={cn(
              "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 border",
              statusDisplay.iconBg,
            )}
          >
            {statusDisplay.icon}
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">{statusDisplay.title}</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">{statusDisplay.description}</p>
        </div>

        {status === "already_paired" && (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Manage nodes
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/connect")}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Try pairing again
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {status === "tutorial" && !props.ok && props.reason === "missing_uuid" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4">
              <p className="text-sm font-medium text-white mb-2">How to get your connect link</p>
              <ol className="space-y-1 list-decimal list-inside text-sm text-neutral-400 leading-snug">
                <li>Open Turbo on your computer</li>
                <li>Right click the Turbo tray icon</li>
                <li>
                  Select <span className="text-neutral-200 font-medium">“Connect”</span>
                </li>
                <li>Your browser will open a connect link automatically</li>
              </ol>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 overflow-hidden">
              <img
                src="/how_to_connect.png"
                alt='Turbo tray menu showing "Connect with your account"'
                className="w-full h-auto block"
              />
            </div>
          </div>
        )}

        {status === "signup" && props.ok && (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Server className="w-4 h-4 text-orange-400/80" />
                <span className="font-mono uppercase tracking-widest text-[10px] text-neutral-500">
                  pairing_uuid
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-neutral-300 break-all">{props.uuid}</p>
            </div>

            <AuthButtons layout="column" redirectTo={redirectTo} />

            <p className="text-[11px] text-neutral-600 text-center">
              After signing in, we&apos;ll automatically finish pairing.
            </p>
          </div>
        )}
      </AuthCard>
    </AuthShell>
  );
}

export const getServerSideProps: GetServerSideProps<ConnectPageProps> = async (context) => {
  const uuidParam = context.query.uuid;
  if (typeof uuidParam !== "string") {
    return { props: { ok: false, reason: "missing_uuid" } };
  }

  const uuid = uuidParam.trim();
  if (!isUuid(uuid)) {
    return { props: { ok: false, reason: "invalid_uuid" } };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("node_connect_requests")
      .select("uuid, expires_at, consumed_at")
      .eq("uuid", uuid)
      .maybeSingle();

    if (error || !data) {
      return { props: { ok: false, reason: "unknown_uuid" } };
    }

    if (data.consumed_at) {
      // Already claimed: bring user to dashboard (they may need to log in)
      return {
        props: { ok: true, uuid },
      };
    }

    const expiresAt = new Date(data.expires_at as string).getTime();
    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
      return { props: { ok: false, reason: "expired_uuid" } };
    }

    return { props: { ok: true, uuid } };
  } catch (e) {
    console.error("connect getServerSideProps error:", e);
    return { props: { ok: false, reason: "unknown_uuid" } };
  }
};

