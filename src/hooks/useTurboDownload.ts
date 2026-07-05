import { useState, useEffect, useCallback } from "react";
import {
  buildDownloadUrl,
  detectArchitecture,
  getArtifactArchiveName,
  getOSName,
  isSupportedPlatform,
  type Platform,
} from "@/lib/turboClientDownload";

export type { Platform } from "@/lib/turboClientDownload";

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("");

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Win")) setPlatform("windows");
    else if (userAgent.includes("Mac")) setPlatform("macos");
    else if (userAgent.includes("Linux")) setPlatform("linux");
    else setPlatform("unknown");
  }, []);

  return platform;
}

export { getOSName };

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

export function useTurboDownload() {
  const platform = usePlatform();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const download = useCallback(async (): Promise<boolean> => {
    if (!isSupportedPlatform(platform) || isDownloading) return false;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const arch = await detectArchitecture();
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
          message = "No build is available for your platform yet.";
        }
        setDownloadError(message);
        return false;
      }

      const blob = await response.blob();
      const filename = getFilenameFromResponse(response, fallbackFilename);
      triggerBlobDownload(blob, filename);

      setDownloadComplete(true);
      return true;
    } catch {
      setDownloadError("Download failed. Please try again.");
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [platform, isDownloading]);

  return {
    platform,
    osName: getOSName(platform),
    isDownloading,
    downloadComplete,
    downloadError,
    download,
    isReady: platform !== "",
  };
}
