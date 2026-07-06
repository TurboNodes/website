export const SECTION_SCROLL_MS = 580;
export const FOOTER_REVEAL_MS = 1300;
export const FOOTER_COLLAPSE_MS = 1000;
export const SECTION_TOLERANCE = 48;

export const LANDING_SECTION_IDS = ["hero", "how-it-works", "get-started"] as const;

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getSectionTops() {
  return LANDING_SECTION_IDS.map((id) => document.getElementById(id)?.offsetTop ?? 0);
}

export function getNearestSectionIndex(scrollTop: number, tops: number[]) {
  let index = 0;
  for (let i = 0; i < tops.length; i++) {
    if (scrollTop >= tops[i] - SECTION_TOLERANCE) index = i;
  }
  return index;
}

export const landingScrollState = { animating: false };

export function animateScrollTo(
  element: HTMLElement,
  targetTop: number,
  duration: number,
  easing: (t: number) => number = easeOutCubic,
): Promise<void> {
  const startTop = element.scrollTop;
  const distance = targetTop - startTop;
  if (Math.abs(distance) < 2) return Promise.resolve();

  const start = performance.now();
  landingScrollState.animating = true;

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      element.scrollTop = startTop + distance * easing(t);
      if (t < 1) requestAnimationFrame(tick);
      else {
        landingScrollState.animating = false;
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

export function scrollToLandingSection(
  id: string,
  container?: HTMLElement | null,
) {
  const target = document.getElementById(id);
  const scrollEl =
    container ?? document.querySelector("main.landing-scroll-main");
  if (!target || !(scrollEl instanceof HTMLElement)) return Promise.resolve();
  return animateScrollTo(
    scrollEl,
    target.offsetTop,
    SECTION_SCROLL_MS,
    easeInOutCubic,
  );
}

