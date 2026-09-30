"use client";

import { useState } from "react";
import { santaRita as c } from "@/content/santa-rita";
import type { Evidence, Lang } from "@/game/types";
import { strings } from "./strings";

export function Accusation({
  lang,
  evidence,
  onAccuse,
  onCancel,
}: {
  lang: Lang;
  evidence: Evidence[];
  onAccuse: (suspectId: string, cited: string[]) => void;
  /** Null when the player is out of questions and must accuse. */
  onCancel: (() => void) | null;
}) {
  const t = strings[lang];
  const [who, setWho] = useState<string | null>(null);
  const [cited, setCited] = useState<string[]>([]);
  const max = c.solution.maxCitations;

  function toggle(id: string) {
    setCited((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < max ? [...cur, id] : cur));
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby="accuse-title">
      <form
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-rule bg-paper px-6 py-7 shadow-xl sm:px-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (who) onAccuse(who, cited);
        }}
      >
        <h2 id="accuse-title" className="text-xl font-semibold">
          {t.accuseTitle}
        </h2>
        {!onCancel && <p className="mt-2 text-sm text-stamp">{t.accuseForced}</p>}

        <fieldset className="mt-6">
          <legend className="label mb-2">{t.accuseWho}</legend>
          <div className="space-y-1">
            {c.suspects.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-baseline gap-3 py-1">
                <input type="radio" name="who" checked={who === s.id} onChange={() => setWho(s.id)} className="accent-stamp" />
                <span>
                  {s.name} <span className="text-sm text-ink-soft">· {s.role[lang]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="label mb-2">
            {t.accuseCite(max)} ({cited.length}/{max})
          </legend>
          <div className="space-y-1">
            {evidence.map((e) => (
              <label
                key={e.id}
                className={`flex cursor-pointer items-baseline gap-3 py-1 text-sm ${
                  !cited.includes(e.id) && cited.length >= max ? "opacity-40" : ""
                }`}
              >
                <input type="checkbox" checked={cited.includes(e.id)} onChange={() => toggle(e.id)} className="accent-stamp" />
                <span>{e.title[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!who}
            className="stamp cursor-pointer text-sm hover:bg-stamp hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.accuseConfirm}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="label cursor-pointer underline-offset-4 hover:underline">
              {t.cancel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
