import { useEffect, type RefObject } from "react";
import {
  animateScrollTo,
  easeInOutCubic,
  FOOTER_COLLAPSE_MS,
  FOOTER_REVEAL_MS,
  getNearestSectionIndex,
  getSectionTops,
  landingScrollState,
  SECTION_SCROLL_MS,
  SECTION_TOLERANCE,
} from "@/lib/landingScroll";

const INSTALL_TOLERANCE = SECTION_TOLERANCE;
const TOUCH_THRESHOLD = 40;

export function useLandingScroll(
  scrollRef: RefObject<HTMLElement | null>,
  footerSectionRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const footerSection = footerSectionRef.current;
    const installSection = document.getElementById("get-started");
    if (!scrollEl || !footerSection || !installSection) return;

    const isAnimating = () => landingScrollState.animating;

    const metrics = () => {
      const footerTop = footerSection.offsetTop;
      const runway = footerSection.offsetHeight - scrollEl.clientHeight;
      return {
        footerTop,
        footerEnd: footerTop + runway,
        installTop: installSection.offsetTop,
      };
    };

    const isOnInstallSection = () => {
      const { installTop } = metrics();
      return Math.abs(scrollEl.scrollTop - installTop) < INSTALL_TOLERANCE;
    };

    const isInFooterZone = () => {
      const { footerTop } = metrics();
      return scrollEl.scrollTop >= footerTop - 2;
    };

    const isInMainSections = () => {
      const { footerTop } = metrics();
      return scrollEl.scrollTop < footerTop - 2;
    };

    const goToSection = async (index: number) => {
      if (isAnimating()) return;

      const tops = getSectionTops();
      const target = tops[index];
      if (target === undefined) return;
      if (Math.abs(scrollEl.scrollTop - target) < INSTALL_TOLERANCE) return;

      await animateScrollTo(
        scrollEl,
        target,
        SECTION_SCROLL_MS,
        easeInOutCubic,
      );
    };

    const revealFooter = async () => {
      if (isAnimating()) return;
      const { footerEnd } = metrics();
      await animateScrollTo(scrollEl, footerEnd, FOOTER_REVEAL_MS);
    };

    const collapseFooter = async () => {
      if (isAnimating()) return;
      const { installTop } = metrics();
      await animateScrollTo(scrollEl, installTop, FOOTER_COLLAPSE_MS);
    };

    const resolveStrandedScroll = () => {
      if (isAnimating()) return;

      const { footerTop, footerEnd, installTop } = metrics();
      const top = scrollEl.scrollTop;

      if (top > installTop + INSTALL_TOLERANCE && top < footerEnd - 2 && top >= footerTop) {
        const mid = footerTop + (footerEnd - footerTop) / 2;
        if (top >= mid) void revealFooter();
        else void collapseFooter();
        return;
      }

      if (top <= installTop + INSTALL_TOLERANCE) {
        const tops = getSectionTops();
        const nearest = getNearestSectionIndex(top, tops);
        if (Math.abs(top - tops[nearest]) > INSTALL_TOLERANCE) {
          void goToSection(nearest);
        }
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (isAnimating()) {
        event.preventDefault();
        return;
      }

      const deltaY = event.deltaY;
      if (Math.abs(deltaY) < 1) return;

      if (deltaY > 0 && isOnInstallSection()) {
        event.preventDefault();
        void revealFooter();
        return;
      }

      if (deltaY < 0 && isInFooterZone()) {
        event.preventDefault();
        void collapseFooter();
        return;
      }

      if (!isInMainSections()) return;

      const tops = getSectionTops();
      const currentIndex = getNearestSectionIndex(scrollEl.scrollTop, tops);

      if (deltaY > 0) {
        if (currentIndex >= 2) return;
        event.preventDefault();
        void goToSection(currentIndex + 1);
        return;
      }

      if (currentIndex <= 0) return;
      event.preventDefault();
      void goToSection(currentIndex - 1);
    };

    let touchStartY = 0;
    let touchStartedOnInstall = false;
    let touchStartedInFooter = false;
    let touchStartedSectionIndex = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
      touchStartedOnInstall = isOnInstallSection();
      touchStartedInFooter = isInFooterZone();
      touchStartedSectionIndex = getNearestSectionIndex(
        scrollEl.scrollTop,
        getSectionTops(),
      );
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (isAnimating()) return;
      const endY = event.changedTouches[0]?.clientY;
      if (endY === undefined) return;

      const delta = touchStartY - endY;
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;

      if (delta > 0 && touchStartedOnInstall) {
        void revealFooter();
        return;
      }

      if (delta < 0 && touchStartedInFooter) {
        void collapseFooter();
        return;
      }

      if (touchStartedInFooter) return;

      if (delta > 0 && touchStartedSectionIndex < 2) {
        void goToSection(touchStartedSectionIndex + 1);
        return;
      }

      if (delta < 0 && touchStartedSectionIndex > 0) {
        void goToSection(touchStartedSectionIndex - 1);
      }
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
    scrollEl.addEventListener("scroll", resolveStrandedScroll, { passive: true });

    return () => {
      scrollEl.removeEventListener("wheel", onWheel);
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchend", onTouchEnd);
      scrollEl.removeEventListener("scroll", resolveStrandedScroll);
    };
  }, [scrollRef, footerSectionRef]);
}
