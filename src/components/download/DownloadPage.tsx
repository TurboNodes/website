import { useCallback } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { OnboardingNav } from "@/components/landing/OnboardingNav";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { DownloadOptions } from "./DownloadOptions";
import { markOnboardingDownloadComplete } from "@/hooks/useOnboardingProgress";
import {
  buildDownloadBackPath,
  ONBOARDING_SECTION_ID,
  type Platform,
} from "@/lib/turboClientDownload";

type SupportedPlatform = Exclude<Platform, "" | "unknown">;

export function DownloadPage() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    void router.push(buildDownloadBackPath(router.query.from));
  }, [router]);

  const handleDownloaded = useCallback(
    (platform: SupportedPlatform) => {
      markOnboardingDownloadComplete(platform);
      void router.push(`/#${ONBOARDING_SECTION_ID}`);
    },
    [router],
  );

  return (
    <>
      <OnboardingNav theme="dark" animate={false} />
      <div className="min-h-dvh bg-neutral-950 text-white flex flex-col">
        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <p className="text-xs font-mono tracking-widest uppercase text-orange-400/90 mb-3">
              // download
            </p>
            <h1
              className="text-white leading-tight mb-3"
              style={{
                fontFamily: "'Bitstream Iowan Old Style Bold BT', Georgia, serif",
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              }}
            >
              Download Turbo
            </h1>
            <p className="text-sm text-neutral-400 mb-10 leading-relaxed">
              Choose your platform and architecture, or install via terminal or
              Docker.
            </p>

            <DownloadOptions onDownloaded={handleDownloaded} />
          </div>
        </main>
        <SiteFooter theme="dark" />
      </div>
    </>
  );
}
