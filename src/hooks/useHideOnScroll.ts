import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const SCROLL_KEY = "turbo_landing_scroll";

interface UseHideOnScrollOptions {
  threshold?: number;
  minScroll?: number;
}

export function useHideOnScroll(
  scrollRef: RefObject<HTMLElement | null>,
  { threshold = 8, minScroll = 48 }: UseHideOnScrollOptions = {},
) {
  const [hidden, setHidden] = useState(true);
  const [animate, setAnimate] = useState(false);
  const lastScrollY = useRef(0);
  const hiddenRef = useRef(true);
  const hideFrameRef = useRef<number | null>(null);
  const isHidingRef = useRef(false);

  const cancelHideFrame = () => {
    if (hideFrameRef.current !== null) {
      cancelAnimationFrame(hideFrameRef.current);
      hideFrameRef.current = null;
    }
    isHidingRef.current = false;
  };

  const hideNav = () => {
    if (hiddenRef.current || isHidingRef.current) return;

    isHidingRef.current = true;

    if (hideFrameRef.current !== null) {
      cancelAnimationFrame(hideFrameRef.current);
    }

    hideFrameRef.current = requestAnimationFrame(() => {
      hideFrameRef.current = requestAnimationFrame(() => {
        hideFrameRef.current = null;
        isHidingRef.current = false;
        hiddenRef.current = true;
        setHidden(true);
      });
    });
  };

  useLayoutEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const top = Number.parseInt(saved, 10);
      if (!Number.isNaN(top)) {
        element.scrollTop = top;
      }
    }

    const atTop = element.scrollTop <= minScroll;
    lastScrollY.current = element.scrollTop;
    hiddenRef.current = !atTop;
    setHidden(!atTop);
  }, [scrollRef, minScroll]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const onScroll = () => {
      const current = element.scrollTop;
      const delta = current - lastScrollY.current;
      const atTop = current <= minScroll;

      if (atTop || delta < -threshold) {
        cancelHideFrame();
        hiddenRef.current = false;
        setHidden(false);
      } else if (delta > threshold) {
        hideNav();
      }

      lastScrollY.current = current;
    };

    let timer: ReturnType<typeof setTimeout>;
    const persist = () => {
      sessionStorage.setItem(SCROLL_KEY, String(element.scrollTop));
    };

    const onScrollPersist = () => {
      onScroll();
      clearTimeout(timer);
      timer = setTimeout(persist, 100);
    };

    element.addEventListener("scroll", onScrollPersist, { passive: true });

    return () => {
      cancelHideFrame();
      clearTimeout(timer);
      persist();
      element.removeEventListener("scroll", onScrollPersist);
    };
  }, [scrollRef, threshold, minScroll]);

  return { hidden, animate };
}
