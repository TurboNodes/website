export type Platform = "windows" | "macos" | "linux" | "unknown" | "";
export type Architecture = "amd64" | "arm64";

export const CLIENT_NODE_REPO = "TurboNodes/client-node";
export const CLIENT_NODE_ACTIONS_URL =
  "https://github.com/TurboNodes/client-node/actions";
export const DOWNLOAD_PAGE_PATH = "/download";
export const ONBOARDING_SECTION_ID = "get-started";
export const TURBO_DOCKER_IMAGE = "ghcr.io/turbonodes/client-node:latest";

export function buildDownloadPagePath(from?: "onboarding"): string {
  return from === "onboarding"
    ? `${DOWNLOAD_PAGE_PATH}?from=onboarding`
    : DOWNLOAD_PAGE_PATH;
}

export function buildDownloadBackPath(from?: string | string[]): string {
  return from === "onboarding" ? `/#${ONBOARDING_SECTION_ID}` : "/";
}

export const DOWNLOAD_OPTIONS: {
  platform: Exclude<Platform, "" | "unknown">;
  arch: Architecture;
  label: string;
}[] = [
  { platform: "windows", arch: "amd64", label: "Windows (x64)" },
  { platform: "windows", arch: "arm64", label: "Windows (ARM64)" },
  { platform: "macos", arch: "amd64", label: "macOS (Intel)" },
  { platform: "macos", arch: "arm64", label: "macOS (Apple Silicon)" },
  { platform: "linux", arch: "amd64", label: "Linux (x64)" },
  { platform: "linux", arch: "arm64", label: "Linux (ARM64)" },
];

export function getCurlInstallCommand(baseUrl = "https://turbo.network"): string {
  return `curl -fsSL ${baseUrl}/install.sh | sh`;
}

export function getDockerPullCommand(
  image = TURBO_DOCKER_IMAGE
): string {
  return `docker pull ${image}`;
}

export function getDockerRunCommand(
  image = TURBO_DOCKER_IMAGE
): string {
  return `docker run -d --name turbo-node --restart unless-stopped ${image}`;
}

export function getArtifactName(
  platform: Exclude<Platform, "" | "unknown">,
  arch: Architecture
): string {
  switch (platform) {
    case "windows":
      return `Turbo_windows-${arch}.exe`;
    case "macos":
      return `Turbo_macos-${arch}.dmg`;
    case "linux":
      return `Turbo_linux-${arch}`;
  }
}

export function getArtifactArchiveName(
  platform: Exclude<Platform, "" | "unknown">,
  arch: Architecture
): string {
  return `${getArtifactName(platform, arch)}.zip`;
}

export function buildDownloadUrl(
  platform: Exclude<Platform, "" | "unknown">,
  arch: Architecture
): string {
  const params = new URLSearchParams({ platform, arch });
  return `/api/download?${params.toString()}`;
}

export async function detectArchitecture(): Promise<Architecture> {
  const ua = navigator.userAgent;
  if (
    ua.includes("ARM64") ||
    ua.includes("aarch64") ||
    ua.includes("arm64")
  ) {
    return "arm64";
  }

  const userAgentData = (
    navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues: (
          hints: string[]
        ) => Promise<{ architecture?: string }>;
      };
    }
  ).userAgentData;

  if (userAgentData?.getHighEntropyValues) {
    try {
      const { architecture } =
        await userAgentData.getHighEntropyValues(["architecture"]);
      if (architecture === "arm") return "arm64";
    } catch {
      // Fall through to heuristics below.
    }
  }

  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return "arm64";
  }

  return "amd64";
}

export function isSupportedPlatform(
  platform: Platform
): platform is Exclude<Platform, "" | "unknown"> {
  return platform === "windows" || platform === "macos" || platform === "linux";
}

export function getOSName(platform: Platform): string {
  switch (platform) {
    case "windows":
      return "Windows";
    case "macos":
      return "macOS";
    case "linux":
      return "Linux";
    default:
      return "your OS";
  }
}

function getFilenameFromResponse(response: Response, fallback: string): string {
  const disposition = response.headers.get("content-disposition");
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = disposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const plainMatch = disposition.match(/filename=([^;]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].trim();
  }

  return fallback;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadTurboClient(
  platform: Exclude<Platform, "" | "unknown">,
  arch: Architecture
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const url = buildDownloadUrl(platform, arch);
    const fallbackFilename = getArtifactArchiveName(platform, arch);

    const response = await fetch(url);
    if (!response.ok) {
      let message = "Download is temporarily unavailable.";
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await response.json()) as { error?: string };
        message = data.error ?? message;
      } else if (response.status === 404) {
        message = "No build is available for this platform yet.";
      }
      return { ok: false, error: message };
    }

    const blob = await response.blob();
    const filename = getFilenameFromResponse(response, fallbackFilename);
    triggerBlobDownload(blob, filename);

    return { ok: true };
  } catch {
    return { ok: false, error: "Download failed. Please try again." };
  }
}
