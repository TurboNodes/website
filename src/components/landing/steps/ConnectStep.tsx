import Link from "next/link";
import { Check } from "lucide-react";
import { StepCard } from "../StepCard";
import type { StepState } from "@/hooks/useOnboardingProgress";

interface ConnectStepProps {
  state: StepState;
}

function ConnectVisual() {
  return (
    <div className="w-full h-full p-2 flex items-center justify-center">
      <div className="w-full max-w-[220px] rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1 bg-neutral-800 border-b border-neutral-700">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[8px] text-neutral-500 font-mono">Turbo</span>
        </div>
        <div className="p-3 flex flex-col items-center gap-2">
          <img src="/logo.png" alt="" className="w-8 h-8 opacity-80" />
          <div className="w-full px-2 py-1.5 rounded-md bg-gradient-to-r from-orange-600 to-orange-500 text-white text-[9px] font-semibold text-center ring-1 ring-orange-400/40 animate-pulse">
            Connect
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConnectStep({ state }: ConnectStepProps) {
  const isLocked = state === "locked";
  const isComplete = state === "complete";

  return (
    <StepCard
      step={3}
      title="Connect"
      state={state}
      visual={<ConnectVisual />}
      description={
        <ol className="space-y-1 list-decimal list-inside leading-snug">
          <li>Open Turbo on your computer</li>
          <li>
            Click <strong className="font-semibold text-neutral-300">Connect</strong> in the app
          </li>
          <li>Sign in when your browser opens</li>
        </ol>
      }
      actions={
        isComplete ? (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-orange-400">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20">
                <Check className="w-3 h-3 text-orange-400 stroke-[3]" />
              </span>
              Node connected
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-medium transition-all shadow-lg shadow-orange-500/20"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <p className="text-xs text-neutral-500">
            {isLocked
              ? "Complete install first"
              : "Your browser will open to finish pairing"}
          </p>
        )
      }
    />
  );
}
