"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/game/types";
import { PaperClip } from "./Doc";
import { Mark } from "./Mark";
import { afterMotion, delay } from "./motion";
import { play } from "./sound";
import { strings } from "./strings";

const READ_KEY = "interrogatorio:memo-read";

/** Whether this browser has already been through the memo. Storage may be unavailable; then it shows again. */
export function memoRead(): boolean {
  try {
    return localStorage.getItem(READ_KEY) === "1";
  } catch {
    return false;
  }
}

function markMemoRead() {
  try {
    localStorage.setItem(READ_KEY, "1");
  } catch {
    // Shown again next visit; harmless.
  }
}

/** A scrawled signature, drawn in ink like the fingerprints. */
const SIGNATURE =
  "M8 32 C10 20 18 6 24 10 C30 14 18 34 14 32 C10 30 24 20 32 24 C38 27 34 34 40 31 C46 28 48 18 52 21 C56 24 50 33 56 32 C62 31 66 14 72 12 C78 10 74 26 70 30 C68 32 76 22 84 23 C90 24 88 31 96 28 C104 25 110 17 118 15 M20 40 C48 35 90 34 130 27 C124 29 120 32 118 34";

/**
 * The prosecutor's memo: how to play, in the fiction's own paperwork.
 * As a page it opens the case the first time and is stamped when the player
 * acknowledges it; as a dialog it can be reread from the file header.
 */
export function Memo({
  lang,
  mode,
  canDrag,
  onDone,
}: {
  lang: Lang;
  mode: "page" | "dialog";
  /** Dragging evidence only works with a mouse, so the memo only offers it there. */
  canDrag: boolean;
  onDone: () => void;
}) {
  const t = strings[lang].memo;
  const [stamped, setStamped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const page = mode === "page";

  // First read: the points arrive one by one, then the key phrase is underlined, then the signature.
  // Reread from the header: everything is already there.
  const step = page ? 180 : 0;
  const first = page ? 350 : 0;
  const underlineAt = page ? first + 4 * step + 350 : 0;
  const signAt = page ? underlineAt + 500 : 0;
  const buttonAt = page ? signAt + 300 : 0;

  function acknowledge() {
    if (stamped) return;
    if (!page) {
      play("paper");
      onDone();
      return;
    }
    setStamped(true);
    markMemoRead();
    // Stamp lands, then the sheet is set aside and the file is underneath.
    afterMotion(220, () => play("thud"));
    afterMotion(900, () => {
      setLeaving(true);
      play("paper");
      afterMotion(380, onDone);
    });
  }

  useEffect(() => {
    if (page) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDone();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, onDone]);

  const sheet = (
    <article
      className={`sheet relative w-full max-w-xl px-6 pt-9 pb-8 sm:px-10 ${leaving ? "anim-leave" : page ? "anim-drop" : "anim-lift"}`}
      role={page ? undefined : "dialog"}
      aria-modal={page ? undefined : true}
      aria-labelledby="memo-title"
      onClick={(e) => e.stopPropagation()}
    >
      <PaperClip className="absolute -top-4 left-10 h-12 w-5" />

      <header className="text-center">
        <p className="label tracking-[0.3em]">Santa Rita del Monte</p>
        <p className="mt-1 font-serif text-lg font-semibold tracking-wide uppercase">{strings[lang].agency}</p>
        <div className="mt-3 border-t-2 border-b border-ink pt-0.5" />
        <h1 id="memo-title" className="label mt-4 text-sm tracking-[0.4em] text-ink">
          {t.title}
        </h1>
      </header>

      <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-y-1 font-mono text-[0.8rem]">
        {t.fields.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-soft uppercase">{k}:</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-rule" />

      <ol className="mt-5 space-y-4 leading-relaxed">
        {t.points.map((p, i) => (
          <li key={i} className="anim-fade-up grid grid-cols-[1.75rem_1fr]" style={delay(first + i * step)}>
            <span className="font-mono text-sm text-ink-soft">{i + 1}.</span>
            <p>
              <strong className="font-semibold">{p.head}</strong> {p.body}
            </p>
          </li>
        ))}
        <li className="anim-fade-up grid grid-cols-[1.75rem_1fr]" style={delay(first + 2 * step)}>
          <span className="font-mono text-sm text-ink-soft">3.</span>
          <p>
            <strong className="font-semibold">{t.evidence.head}</strong> {canDrag ? t.evidence.drag : t.evidence.pick} {t.evidence.effect}
          </p>
        </li>
        <li className="anim-fade-up grid grid-cols-[1.75rem_1fr]" style={delay(first + 3 * step)}>
          <span className="font-mono text-sm text-ink-soft">4.</span>
          <p>
            <strong className="font-semibold">{t.last.head}</strong> {t.last.before}
            <Mark type="underline" show delayMs={underlineAt} animate={page} padding={1}>
              {t.last.key}
            </Mark>
            {t.last.after}
          </p>
        </li>
      </ol>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <button onClick={acknowledge} disabled={stamped} className="ink-button anim-fade-up" style={delay(buttonAt)}>
          {t.ok}
        </button>
        <div className="text-center">
          <svg viewBox="0 0 136 44" className="h-11 w-32 text-ink" aria-hidden="true">
            <g className="anim-ink" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path
                d={SIGNATURE}
                pathLength={1}
                // On a reread the signature is already dry.
                style={page ? { animationDelay: `${signAt}ms`, animationDuration: "1100ms" } : { animation: "none", strokeDasharray: "none" }}
              />
            </g>
          </svg>
          <p className="label -mt-1 border-t border-ink/40 pt-1">{t.signed}</p>
        </div>
      </div>

      {stamped && (
        <span className="stamp stamp-down absolute top-24 right-6 px-4 py-1.5 text-2xl sm:right-10">{t.stamp}</span>
      )}
    </article>
  );

  if (page) {
    return <main className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">{sheet}</main>;
  }
  return (
    <div className="anim-backdrop fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center" onClick={onDone}>
      {sheet}
    </div>
  );
}
