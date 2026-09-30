/** True when the player asked the system for less motion. The CSS animations already respect it; this is for JS timing. */
export function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Runs `fn` once an animation of `ms` has played, or right away under reduced motion. */
export function afterMotion(ms: number, fn: () => void): void {
  if (reducedMotion()) fn();
  else window.setTimeout(fn, ms);
}

/** Style for an element whose CSS animation should start later. */
export function delay(ms: number): React.CSSProperties {
  return { "--delay": `${ms}ms` } as React.CSSProperties;
}
