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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="accuse-title">
      <form
        className="sheet slide-in max-h-[92vh] w-full max-w-xl overflow-y-auto px-6 py-7 shadow-2xl sm:px-9"
        onSubmit={(e) => {
          e.preventDefault();
          if (who) onAccuse(who, cited);
        }}
      >
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">
          <span className="label">{t.agency}</span>
          <span className="label">{t.fileNo} 0522-SR</span>
        </div>
        <h2 id="accuse-title" className="mt-4 text-2xl font-semibold">
          {t.accuseRecord}
        </h2>
        {!onCancel && <p className="mt-2 text-sm text-stamp">{t.accuseForced}</p>}

        <fieldset className="mt-6">
          <legend className="label mb-2">1. {t.accuseWho}</legend>
          <div className="divide-y divide-rule border-y border-rule">
            {c.suspects.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-baseline gap-3 py-2">
                <input type="radio" name="who" checked={who === s.id} onChange={() => setWho(s.id)} className="xbox rounded-full" />
                <span>
                  {s.name} <span className="text-sm text-ink-soft">· {s.role[lang]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="label mb-2">
            2. {t.accuseCite(max)} ({cited.length}/{max})
          </legend>
          <div className="divide-y divide-rule border-y border-rule">
            {evidence.map((e) => {
              const full = !cited.includes(e.id) && cited.length >= max;
              return (
                <label key={e.id} className={`flex cursor-pointer items-baseline gap-3 py-2 text-sm ${full ? "opacity-40" : ""}`}>
                  <input type="checkbox" checked={cited.includes(e.id)} onChange={() => toggle(e.id)} disabled={full} className="xbox" />
                  <span className="flex-1">{e.title[lang]}</span>
                  <span className="label shrink-0 text-[0.6rem]">{t.kind[e.kind]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-9 flex flex-wrap items-center gap-6">
          <button
            type="submit"
            disabled={!who}
            className="stamp cursor-pointer px-4 py-1.5 text-base hover:bg-stamp hover:text-paper disabled:cursor-not-allowed disabled:opacity-35"
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
