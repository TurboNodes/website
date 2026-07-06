import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { OnboardingNav } from "@/components/landing/OnboardingNav";
import { OSLogo } from "@/components/landing/ui/OSLogos";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { TurboDownloadButton } from "@/components/shared/TurboDownloadButton";
import { CopyCommand } from "./CopyCommand";
import { markOnboardingDownloadComplete } from "@/hooks/useOnboardingProgress";
import {
  buildDownloadBackPath,
  detectArchitecture,
  DOWNLOAD_OPTIONS,
  downloadTurboClient,
  getCurlInstallCommand,
  getDockerPullCommand,
  getDockerRunCommand,
  isSupportedPlatform,
  ONBOARDING_SECTION_ID,
  type Architecture,
  type Platform,
} from "@/lib/turboClientDownload";
import { usePlatform } from "@/hooks/useTurboDownload";
import { cn } from "@/lib/utils";

type SupportedPlatform = Exclude<Platform, "" | "unknown">;

const PLATFORMS: SupportedPlatform[] = ["windows", "macos", "linux"];
const ARCHITECTURES: Architecture[] = ["amd64", "arm64"];

function getArchLabel(platform: SupportedPlatform, arch: Architecture): string {
  if (arch === "arm64") {
    return platform === "macos" ? "Apple Silicon" : "ARM64";
  }
  return platform === "macos" ? "Intel" : "x64";
}

export function DownloadPage() {
  const router = useRouter();
  const detectedPlatform = usePlatform();
  const [platform, setPlatform] = useState<SupportedPlatform>("linux");
  const [arch, setArch] = useState<Architecture>("amd64");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("https://turbo.network");

  const backHref = buildDownloadBackPath(router.query.from);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    async function applyDetectedPlatform() {
      if (isSupportedPlatform(detectedPlatform)) {
        setPlatform(detectedPlatform);
        setArch(await detectArchitecture());
      }
    }

    void applyDetectedPlatform();
  }, [detectedPlatform]);

  const selectedLabel =
    DOWNLOAD_OPTIONS.find(
      (option) => option.platform === platform && option.arch === arch,
    )?.label ?? "Turbo client";

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    const result = await downloadTurboClient(platform, arch);
    if (!result.ok) {
      setDownloadError(result.error);
      setIsDownloading(false);
      return;
    }

    markOnboardingDownloadComplete(platform);
    void router.push(`/#${ONBOARDING_SECTION_ID}`);
    setIsDownloading(false);
  }, [arch, isDownloading, platform, router]);

  return (
    <>
      <OnboardingNav theme="dark" animate={false} />
      <div className="min-h-dvh bg-neutral-950 text-white flex flex-col">
        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>

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

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6 mb-6">
              <h2 className="text-sm font-medium text-neutral-200 mb-4">
                Direct download
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Platform</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPlatform(option)}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                          platform === option
                            ? "border-orange-500/50 bg-orange-500/10 text-white"
                            : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200",
                        )}
                      >
                        <OSLogo platform={option} />
                        <span className="capitalize">
                          {option === "macos" ? "macOS" : option}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 mb-2">Architecture</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ARCHITECTURES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setArch(option)}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                          arch === option
                            ? "border-orange-500/50 bg-orange-500/10 text-white"
                            : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200",
                        )}
                      >
                        {getArchLabel(platform, option)}
                      </button>
                    ))}
                  </div>
                </div>

                <TurboDownloadButton
                  onClick={handleDownload}
                  disabled={isDownloading}
                  isDownloading={isDownloading}
                  platform={platform}
                  label={
                    isDownloading ? "Downloading…" : `Download ${selectedLabel}`
                  }
                  size="md"
                />

                {downloadError && (
                  <p className="text-xs text-red-400/90 text-center">
                    {downloadError}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6 mb-6 space-y-5">
              <div>
                <h2 className="text-sm font-medium text-neutral-200 mb-1">
                  Terminal install
                </h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Installs the latest build for Linux or macOS. Windows users
                  should use the direct download above.
                </p>
                <CopyCommand command={getCurlInstallCommand(baseUrl)} />
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="text-sm font-medium text-neutral-200 mb-1">
                  Docker
                </h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Run Turbo as a container on any host with Docker installed.
                </p>
              </div>
              <CopyCommand
                label="Pull image"
                command={getDockerPullCommand()}
              />
              <CopyCommand label="Run container" command={getDockerRunCommand()} />
            </section>
          </div>
        </main>
        <SiteFooter theme="dark" />
      </div>
    </>
  );
}
