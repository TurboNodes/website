export type Platform = "windows" | "macos" | "linux" | "unknown" | "";
export type Architecture = "amd64" | "arm64";

export const CLIENT_NODE_REPO = "TurboNodes/client-node";
export const CLIENT_NODE_ACTIONS_URL =
  "https://github.com/TurboNodes/client-node/actions";

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
