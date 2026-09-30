"use client";

import { useEffect, useState } from "react";

/** Types out a fresh reply like a transcript being keyed in. Skipped for older lines and for reduced motion. */
export function Typewriter({ text, animate }: { text: string; animate: boolean }) {
  const [shown, setShown] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- jump to the end when there is nothing to animate
      setShown(text.length);
      return;
    }
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 2;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [text, animate]);

  return (
    <>
      {text.slice(0, shown)}
      {shown < text.length && <span className="opacity-40">▍</span>}
    </>
  );
}
