import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const SCROLL_PREFIX = "turbo_scroll:";
const SAVE_DEBOUNCE_MS = 100;

function scrollKey(path: string) {
  return `${SCROLL_PREFIX}${path.split("#")[0]}`;
}

function readScroll(path: string): number | null {
  const saved = sessionStorage.getItem(scrollKey(path));
  if (!saved) return null;

  const top = Number.parseInt(saved, 10);
  return Number.isNaN(top) ? null : top;
}

function saveScroll(path: string, top = window.scrollY) {
  sessionStorage.setItem(scrollKey(path), String(top));
}

function restoreScroll(path: string) {
  const top = readScroll(path);
  if (top === null) return;

  const apply = () => window.scrollTo(0, top);

  apply();

  // Next.js or hydration may reset scroll after the initial paint.
  requestAnimationFrame(() => {
    if (window.scrollY !== top) {
      apply();
    }
  });

  // Reloads can shift layout once assets finish loading.
  if (document.readyState !== "complete") {
    window.addEventListener(
      "load",
      () => {
        if (window.scrollY !== top) {
          apply();
        }
      },
      { once: true },
    );
  }
}

function shouldRestoreOnFullPageLoad() {
  const nav = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming | undefined;

  return nav?.type === "back_forward" || nav?.type === "reload";
}

export function useScrollRestoration(enabled = true) {
  const router = useRouter();
  const enabledRef = useRef(enabled);
  const pathRef = useRef(router.asPath);
  const isPopRef = useRef(false);
  const [restorePath, setRestorePath] = useState<string | null>(null);

  enabledRef.current = enabled;
  pathRef.current = router.asPath;

  // Full page load when returning via back or reload.
  useLayoutEffect(() => {
    if (!enabled || !router.isReady) return;

    if (shouldRestoreOnFullPageLoad()) {
      restoreScroll(router.asPath);
    }
  }, [enabled, router.isReady, router.asPath]);

  // Client-side back navigation: restore before paint to avoid a flash at the top.
  useLayoutEffect(() => {
    if (!enabled || !restorePath) return;

    restoreScroll(restorePath);
    setRestorePath(null);
  }, [enabled, restorePath]);

  useEffect(() => {
    if (!router.isReady) return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    let timer: ReturnType<typeof setTimeout>;

    const saveCurrent = () => {
      if (!enabledRef.current) return;
      saveScroll(pathRef.current);
    };

    const onScroll = () => {
      if (!enabledRef.current) return;

      clearTimeout(timer);
      timer = setTimeout(saveCurrent, SAVE_DEBOUNCE_MS);
    };

    const onPopState = () => {
      isPopRef.current = true;
    };

    const onRouteChangeStart = () => {
      saveCurrent();
    };

    const onRouteChangeComplete = (url: string) => {
      if (!enabledRef.current || !isPopRef.current) return;

      isPopRef.current = false;
      setRestorePath(url);
    };

    const persist = () => saveCurrent();

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persist();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", persist);
    window.addEventListener("beforeunload", persist);
    document.addEventListener("visibilitychange", onVisibilityChange);
    router.events.on("routeChangeStart", onRouteChangeStart);
    router.events.on("routeChangeComplete", onRouteChangeComplete);

    return () => {
      clearTimeout(timer);
      persist();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", persist);
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      router.events.off("routeChangeStart", onRouteChangeStart);
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, [router.isReady, router.events]);
}
