"use client";

import { useEffect, useRef } from "react";
import { annotate } from "rough-notation";
import { reducedMotion } from "./motion";

/** The stamp red. The drawing is SVG attributes, which can't read CSS variables. */
const MARKER = "#a3261b";

/**
 * A mark the detective draws on the file in red marker: a circle, a bracket,
 * an underline. It draws itself when `show` turns true, after `delayMs`.
 */
export function Mark({
  type,
  show,
  delayMs = 0,
  animate = true,
  padding = 4,
  padY,
  bracket = "left",
  block = false,
  children,
}: {
  type: "circle" | "bracket" | "underline" | "box";
  show: boolean;
  delayMs?: number;
  animate?: boolean;
  padding?: number;
  /** Vertical padding when it should differ, e.g. a bracket that must not reach the lines above and below. */
  padY?: number;
  bracket?: "left" | "right";
  block?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show || !ref.current) return;
    const mark = annotate(ref.current, {
      type,
      color: MARKER,
      strokeWidth: 1.6,
      padding: [padY ?? padding, padding],
      brackets: bracket,
      iterations: type === "circle" ? 1 : 2,
      animate: animate && !reducedMotion(),
      animationDuration: type === "circle" ? 700 : 500,
    });
    const id = window.setTimeout(() => mark.show(), delayMs);
    return () => {
      window.clearTimeout(id);
      mark.remove();
    };
  }, [type, show, delayMs, animate, padding, padY, bracket]);

  // The drawing is placed in the wrapper, which gives it a positioned parent.
  return (
    <span className={`relative ${block ? "block" : "inline-block"}`}>
      <span ref={ref} className={block ? "block" : "inline"}>
        {children}
      </span>
    </span>
  );
}
