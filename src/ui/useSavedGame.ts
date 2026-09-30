"use client";

import { useEffect, useState } from "react";
import type { Lang, Turn, Verdict } from "@/game/types";

export interface SavedGame {
  lang: Lang;
  turns: Turn[];
  seen: string[];
  ending: { accusedId: string; cited: string[]; verdict: Verdict } | null;
}

const KEY = "interrogatorio:santa-rita:v1";

export const EMPTY: SavedGame = { lang: "es", turns: [], seen: [], ending: null };

function load(): SavedGame | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as SavedGame) } : null;
  } catch {
    return null;
  }
}

/** Keeps the game in this browser so a reload doesn't lose the interrogation. Storage may be unavailable; the game works without it. */
export function useSavedGame() {
  const [game, setGame] = useState<SavedGame>(EMPTY);
  const [hadSave, setHadSave] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = load();
    // Reading storage has to wait for the client; this is the one-time sync from it.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved) {
      setGame(saved);
      setHadSave(saved.turns.length > 0 || saved.ending !== null);
    } else {
      const browserLang = navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
      setGame({ ...EMPTY, lang: browserLang });
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(game));
    } catch {
      // Private mode or blocked storage: keep playing in memory.
    }
  }, [game, loaded]);

  return { game, setGame, hadSave, loaded };
}
