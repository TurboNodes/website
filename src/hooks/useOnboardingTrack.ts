import { useCallback, useEffect, useRef, useState } from "react";
import type { StepState } from "@/hooks/useOnboardingProgress";

const STEPS = ["download", "install", "connect"] as const;

function getTargetStepIndex(
  getStepState: (step: (typeof STEPS)[number]) => StepState
): number {
  const states = STEPS.map((key) => getStepState(key));

  if (states.every((state) => state === "complete")) {
    return STEPS.length - 1;
  }

  const activeIndex = states.findIndex(
    (state) => state === "active" || state === "loading"
  );

  return activeIndex === -1 ? 0 : activeIndex;
}

export function useOnboardingTrack(
  getStepState: (step: (typeof STEPS)[number]) => StepState,
  hydrated: boolean
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const getStepStateRef = useRef(getStepState);
  getStepStateRef.current = getStepState;
  const [trackStyle, setTrackStyle] = useState<{
    top: number;
    height: number;
    fillPercent: number;
  } | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);

  const setCircleRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      circleRefs.current[index] = element;
    },
    []
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    const circles = circleRefs.current;
    if (!container || circles.some((circle) => !circle)) return;

    const containerRect = container.getBoundingClientRect();
    const centers = circles.map((circle) => {
      const rect = circle!.getBoundingClientRect();
      return rect.top + rect.height / 2 - containerRect.top;
    });

    const top = centers[0];
    const bottom = centers[centers.length - 1];
    const trackHeight = bottom - top;
    if (trackHeight <= 0) return;

    const targetIndex = getTargetStepIndex(getStepStateRef.current);
    const fillPercent =
      ((centers[targetIndex] - top) / trackHeight) * 100;

    setTrackStyle((prev) => {
      if (
        prev &&
        prev.top === top &&
        prev.height === trackHeight &&
        prev.fillPercent === fillPercent
      ) {
        return prev;
      }
      return { top, height: trackHeight, fillPercent };
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    measure();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    circleRefs.current.forEach((circle) => {
      if (circle) observer.observe(circle);
    });

    const frame = requestAnimationFrame(() => setAnimateProgress(true));

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [hydrated, measure]);

  const progressKey = STEPS.map((key) => getStepState(key)).join("|");

  useEffect(() => {
    if (!hydrated) return;
    measure();
  }, [hydrated, progressKey, measure]);

  return { containerRef, setCircleRef, trackStyle, animateProgress };
}
