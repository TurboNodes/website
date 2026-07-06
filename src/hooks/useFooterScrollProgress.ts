import { useEffect, useState, type RefObject } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useFooterScrollProgress(
  scrollRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const footerEl = footerRef.current;
    if (!scrollEl || !footerEl) return;

    const section = footerEl.closest("section");
    if (!section) return;

    const update = () => {
      const sectionTop = section.offsetTop;
      const runway = section.offsetHeight - scrollEl.clientHeight;
      const scrolled = scrollEl.scrollTop - sectionTop;

      if (runway <= 0) {
        setProgress(scrolled >= 0 ? 1 : 0);
        return;
      }

      setProgress(clamp(scrolled / runway, 0, 1));
    };

    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      scrollEl.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollRef, footerRef]);

  return progress;
}
