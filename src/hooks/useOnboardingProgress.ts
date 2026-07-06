import { useState, useEffect, useCallback } from "react";
import type { Platform } from "@/lib/turboClientDownload";

const SESSION_KEY = "turbo_onboarding_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type StepState = "locked" | "active" | "loading" | "complete";
export type SupportedPlatform = Exclude<Platform, "" | "unknown">;

interface SessionProgress {
  downloadComplete: boolean;
  installConfirmed: boolean;
  connectComplete: boolean;
  downloadPlatform?: SupportedPlatform;
  savedAt: number;
}

function readSessionProgress(): SessionProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SessionProgress;
    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function writeSessionProgress(progress: Omit<SessionProgress, "savedAt">) {
  if (typeof window === "undefined") return;

  const payload: SessionProgress = { ...progress, savedAt: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export function markOnboardingDownloadComplete(platform: SupportedPlatform) {
  const saved = readSessionProgress();
  writeSessionProgress({
    downloadComplete: true,
    installConfirmed: saved?.installConfirmed ?? false,
    connectComplete: saved?.connectComplete ?? false,
    downloadPlatform: platform,
  });
}

export function useOnboardingProgress() {
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [installConfirmed, setInstallConfirmed] = useState(false);
  const [connectComplete, setConnectComplete] = useState(false);
  const [downloadPlatform, setDownloadPlatform] =
    useState<SupportedPlatform | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readSessionProgress();
    if (saved) {
      setDownloadComplete(saved.downloadComplete);
      setInstallConfirmed(saved.installConfirmed);
      setConnectComplete(saved.connectComplete);
      setDownloadPlatform(saved.downloadPlatform ?? null);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeSessionProgress({
      downloadComplete,
      installConfirmed,
      connectComplete,
      ...(downloadPlatform ? { downloadPlatform } : {}),
    });
  }, [
    hydrated,
    downloadComplete,
    installConfirmed,
    connectComplete,
    downloadPlatform,
  ]);

  const markDownloadComplete = useCallback((platform?: SupportedPlatform) => {
    setDownloadComplete(true);
    if (platform) setDownloadPlatform(platform);
  }, []);

  const markInstallConfirmed = useCallback(() => {
    setInstallConfirmed(true);
  }, []);

  const getStepState = useCallback(
    (step: "download" | "install" | "connect"): StepState => {
      if (!hydrated) return "locked";

      switch (step) {
        case "download":
          return downloadComplete ? "complete" : "active";
        case "install":
          if (!downloadComplete) return "locked";
          return installConfirmed ? "complete" : "active";
        case "connect":
          if (!installConfirmed) return "locked";
          return connectComplete ? "complete" : "active";
      }
    },
    [hydrated, downloadComplete, installConfirmed, connectComplete]
  );

  const completedCount =
    (downloadComplete ? 1 : 0) +
    (installConfirmed ? 1 : 0) +
    (connectComplete ? 1 : 0);

  return {
    hydrated,
    downloadComplete,
    installConfirmed,
    connectComplete,
    downloadPlatform,
    markDownloadComplete,
    markInstallConfirmed,
    getStepState,
    completedCount,
  };
}
