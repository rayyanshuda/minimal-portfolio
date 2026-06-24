"use client";

import { useEffect, useRef, useState } from "react";

export default function OverflowMarquee({ text }: { text: string }) {
  const viewportRef = useRef<HTMLSpanElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const check = () => {
      const v = viewportRef.current;
      if (!v) return;
      const d = Math.max(0, v.scrollWidth - v.clientWidth);
      setIsOverflowing(d > 1);
      setOverflowDistance(d);
    };
    check();
    const v = viewportRef.current;
    if (!v) return;
    const ro = new ResizeObserver(check);
    ro.observe(v);
    return () => ro.disconnect();
  }, [text]);

  return (
    <span
      ref={viewportRef}
      className={isOverflowing ? "marquee-viewport is-overflow" : "marquee-viewport"}
      style={{ "--marquee-distance": `-${overflowDistance}px` } as React.CSSProperties}
    >
      <span className="marquee-track">
        <span className="marquee-segment">{text}</span>
      </span>
    </span>
  );
}
