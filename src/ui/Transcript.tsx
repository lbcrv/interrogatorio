"use client";

import { useEffect, useRef } from "react";
import { santaRita as c } from "@/content/santa-rita";
import type { Lang, Suspect, TurnInput } from "@/game/types";
import type { PlayedTurn } from "./Game";
import { clockAt, strings } from "./strings";
import { Typewriter } from "./Typewriter";

/** "Ernesto «Neto» Salazar" -> "E. SALAZAR", the way a typed transcript names the speaker. */
function speakerTag(name: string): string {
  const words = name.split(/\s+/).filter((w) => !/^[«"“]/.test(w));
  return `${words[0][0]}. ${words[words.length - 1]}`.toUpperCase();
}

function evidenceTitle(id: string | undefined, lang: Lang): string {
  return c.evidence.find((e) => e.id === id)?.title[lang] ?? "";
}

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
  const tag = speakerTag(suspect.name);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [played.length, pending]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 font-mono text-[0.84rem] leading-relaxed" aria-live="polite">
      {played.length === 0 && !pending && <p className="text-ink-soft">{t.emptyTranscript(suspect.name)}</p>}

      <ol className="space-y-5">
        {played.map((p) => (
          <li key={p.index} className="space-y-2">
            <Line time={clockAt(p.index)} who={t.detective}>
              {p.kind === "present" && <span className="text-stamp">{t.showed(evidenceTitle(p.evidenceId, lang))} </span>}
              {p.text}
            </Line>
            <Line time={clockAt(p.index)} who={tag} strong>
              <Typewriter text={p.reply} animate={p.index === freshIndex} />
            </Line>
            {p.fired?.unlocks && (
              <p className="pl-[7.5rem] text-xs uppercase tracking-wider text-stamp max-sm:pl-0">
                {t.added(evidenceTitle(p.fired.unlocks, lang))}
              </p>
            )}
          </li>
        ))}

        {pending && (
          <li className="space-y-2">
            <Line time={pendingTime} who={t.detective}>
              {pending.kind === "present" && (
                <span className="text-stamp">{t.showed(evidenceTitle(pending.evidenceId, lang))} </span>
              )}
              {pending.text}
            </Line>
            <Line time={pendingTime} who={tag} strong>
              <span className="animate-pulse">{t.waiting}</span>
            </Line>
          </li>
        )}
      </ol>
      <div ref={end} />
    </div>
  );
}

function Line({ time, who, strong = false, children }: { time: string; who: string; strong?: boolean; children: React.ReactNode }) {
  return (
    <p className="grid grid-cols-[3rem_4rem_1fr] gap-x-2 max-sm:grid-cols-[3rem_1fr]">
      <span className="text-ink-soft tabular-nums">{time}</span>
      <span className={`${strong ? "text-ink" : "text-ink-soft"} max-sm:hidden`}>{who}</span>
      <span className={`whitespace-pre-line ${strong ? "" : "text-ink-soft"}`}>
        <span className="sm:hidden">{who} </span>
        {children}
      </span>
    </p>
  );
}
