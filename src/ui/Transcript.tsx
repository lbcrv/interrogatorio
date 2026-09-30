"use client";

import { useEffect, useRef } from "react";
import { santaRita as c } from "@/content/santa-rita";
import type { Lang, Suspect, TurnInput } from "@/game/types";
import type { PlayedTurn } from "./Game";
import { clockAt, strings } from "./strings";
import { Typewriter } from "./Typewriter";

/** "Ernesto «Neto» Salazar" -> "E. SALAZAR", the way a typed transcript names the speaker. */
export function speakerTag(name: string): string {
  const words = name.split(/\s+/).filter((w) => !/^[«"“]/.test(w));
  return `${words[0][0]}. ${words[words.length - 1]}`.toUpperCase();
}

function evidenceTitle(id: string | undefined, lang: Lang): string {
  return c.evidence.find((e) => e.id === id)?.title[lang] ?? "";
}

/** Typed on the ruled sheet: time in the margin, then speaker and words. */
export function Transcript({
  lang,
  suspect,
  played,
  pending,
  pendingTime,
  freshIndex,
}: {
  lang: Lang;
  suspect: Suspect;
  played: PlayedTurn[];
  pending: TurnInput | null;
  pendingTime: string;
  freshIndex: number | null;
}) {
  const t = strings[lang];
  const end = useRef<HTMLDivElement>(null);
  const last = useRef(suspect.id);
  const tag = speakerTag(suspect.name);

  // Follow new lines, but don't yank the page when the player just switches tabs.
  useEffect(() => {
    if (last.current === suspect.id) end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    last.current = suspect.id;
  }, [suspect.id, played.length, pending]);

  return (
    <div className="font-mono text-[0.84rem]" aria-live="polite">
      {played.length === 0 && !pending && <Line time="" who="">{<span className="text-ink-soft">{t.emptyTranscript(suspect.name)}</span>}</Line>}

      <ol className="space-y-7">
        {played.map((p) => (
          <li key={p.index}>
            <Line time={clockAt(p.index)} who={t.detective}>
              {p.kind === "present" && <span className="text-stamp">{t.showed(evidenceTitle(p.evidenceId, lang))} </span>}
              {p.text}
            </Line>
            <Line time="" who={tag} strong>
              <Typewriter text={p.reply} animate={p.index === freshIndex} />
            </Line>
            {p.fired?.unlocks && (
              <Line time="" who="">
                <span className="hand inline-block -rotate-1 text-lg">{t.added(evidenceTitle(p.fired.unlocks, lang))}</span>
              </Line>
            )}
          </li>
        ))}

        {pending && (
          <li>
            <Line time={pendingTime} who={t.detective}>
              {pending.kind === "present" && (
                <span className="text-stamp">{t.showed(evidenceTitle(pending.evidenceId, lang))} </span>
              )}
              {pending.text}
            </Line>
            <Line time="" who={tag} strong>
              <span className="animate-pulse">{t.waiting}</span>
            </Line>
          </li>
        )}
      </ol>
      <div ref={end} />
    </div>
  );
}

export function Line({ time, who, strong = false, children }: { time: string; who: string; strong?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[3.25rem_1fr]">
      <span className="pl-1.5 text-[0.72rem] text-ink-soft tabular-nums">{time}</span>
      <p className="grid grid-cols-[5.5rem_1fr] pl-3 max-sm:grid-cols-1">
        <span className={`${strong ? "font-medium text-ink" : "text-ink-soft"} max-sm:hidden`}>{who}</span>
        <span className={`whitespace-pre-line ${strong ? "" : "text-ink-soft"}`}>
          {who && <span className={`sm:hidden ${strong ? "font-medium" : ""}`}>{who} </span>}
          {children}
        </span>
      </p>
    </div>
  );
}
