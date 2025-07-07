import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * intersection observer hook
 * @description 영역 간 교차점 파악
 * @param options intersection observer options
 */
export function useIntersections(
  options: IntersectionObserverInit = { threshold: [0.5] },
) {
  const [intersections, setIntersections] = useState<Map<string, IntersectionObserverEntry>>(new Map());
  const observerRef = useRef<IntersectionObserver>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      setIntersections((prev) => {
        const newIntersections = new Map(prev);
        for (const entry of entries) {
          newIntersections.set(entry.target.id, entry);
        }
        return newIntersections;
      });
    }, options);
    observerRef.current = observer;
    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRef = useCallback((el: Element | null) => {
    if (el && observerRef.current) {
      observerRef.current.observe(el);
    }
    else if (el && !observerRef.current) {
      elementsRef.current.add(el);
    }
  }, []);

  return {
    entries: intersections,
    setRef,
  };
}
