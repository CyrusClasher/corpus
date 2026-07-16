"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper for the landing page. Starts invisible/offset,
 * then animates in the first time it enters the viewport — used sparingly
 * (whole sections, not individual words) so it reads as one orchestrated
 * reveal per section rather than scattered motion.
 *
 * Respects prefers-reduced-motion by skipping straight to the visible
 * state (handled by the "motion-reduce" utility below).
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ animationDelay: visible ? `${delayMs}ms` : undefined }}
      className={cn(
        "motion-reduce:opacity-100",
        visible ? "animate-rise-in" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
