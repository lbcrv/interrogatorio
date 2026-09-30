"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "@/game/types";
import { setSoundEnabled, soundEnabled, subscribeSound } from "./sound";
import { strings } from "./strings";

export function SoundToggle({ lang, className = "" }: { lang: Lang; className?: string }) {
  // The server renders it on; the browser then reads the saved choice.
  const on = useSyncExternalStore(subscribeSound, soundEnabled, () => true);
  const t = strings[lang].sound;
  return (
    <button
      onClick={() => setSoundEnabled(!on)}
      aria-pressed={on}
      className={`label cursor-pointer underline-offset-4 hover:underline ${className}`}
    >
      {on ? t.on : t.off}
    </button>
  );
}
