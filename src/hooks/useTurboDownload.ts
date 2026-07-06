import { useState, useEffect, useCallback } from "react";
import {
  detectArchitecture,
  downloadTurboClient,
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
      const result = await downloadTurboClient(platform, arch);
      if (!result.ok) {
        setDownloadError(result.error);
        return false;
      }

      setDownloadComplete(true);
      return true;
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
