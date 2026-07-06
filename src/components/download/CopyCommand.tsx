import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyCommandProps {
  command: string;
  label?: string;
  className?: string;
}

export function CopyCommand({ command, label, className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail in some browsers.
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs font-medium text-neutral-400">{label}</p>
      )}
      <div className="relative group">
        <pre className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 pr-12 text-xs sm:text-sm font-mono text-neutral-200">
          <code>{command}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy command"}
          className={cn(
            "absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-lg",
            "border border-neutral-700 bg-neutral-800/80 text-neutral-400",
            "hover:text-white hover:border-neutral-600 hover:bg-neutral-700/80 transition-colors",
          )}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
