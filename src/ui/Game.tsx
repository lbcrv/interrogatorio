"use client";

import { useMemo, useRef, useState } from "react";
import { santaRita as c } from "@/content/santa-rita";
import { applyTurn, availableEvidence, evaluateAccusation, initialState, questionsLeft, validateTurn } from "@/game/engine";
import type { Evidence, GameState, Lang, Suspect, Turn, TurnInput, UnlockRule } from "@/game/types";
import { Accusation } from "./Accusation";
import { EvidenceSheet } from "./EvidenceSheet";
import { clockAt, strings } from "./strings";
import { Transcript } from "./Transcript";
import { EMPTY, useSavedGame } from "./useSavedGame";

export interface PlayedTurn extends Turn {
  index: number;
  fired: UnlockRule | null;
}

export function Game() {
  const { game, setGame, hadSave, loaded } = useSavedGame();
  const [started, setStarted] = useState(false);
  const [suspectId, setSuspectId] = useState(c.suspects[0].id);
  const [draft, setDraft] = useState("");
  const [presenting, setPresenting] = useState<string | null>(null);
  const [pending, setPending] = useState<TurnInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [accusing, setAccusing] = useState(false);
  const [freshIndex, setFreshIndex] = useState<number | null>(null);
  // Only matters on small screens; on desktop the list is always shown.
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lang = game.lang;
  const t = strings[lang];

  // Replay the log once per change: state plus which rule each turn fired.
  const { state, played } = useMemo(() => {
    let s: GameState = initialState();
    const played: PlayedTurn[] = [];
    game.turns.forEach((turn, index) => {
      const r = applyTurn(c, s, turn);
      s = r.state;
      played.push({ ...turn, index, fired: r.fired });
    });
    return { state: s, played };
  }, [game.turns]);

  const evidence = availableEvidence(c, state);
  const left = questionsLeft(c, state);
  const suspect = c.suspects.find((s) => s.id === suspectId)!;
  const unseen = evidence.filter((e) => !e.initial && !game.seen.includes(e.id)).map((e) => e.id);

  function setLang(next: Lang) {
    setGame((g) => ({ ...g, lang: next }));
  }

  function restart(confirmFirst = true) {
    if (confirmFirst && game.turns.length > 0 && !window.confirm(t.restartConfirm)) return;
    setGame({ ...EMPTY, lang });
    setSuspectId(c.suspects[0].id);
    setDraft("");
    setPresenting(null);
    setError(null);
    setAccusing(false);
    setStarted(true);
  }

  async function send() {
    const next: TurnInput = presenting
      ? { suspectId, kind: "present", evidenceId: presenting, text: draft }
      : { suspectId, kind: "ask", text: draft };
    if (pending || validateTurn(c, state, next)) return;

    setPending(next);
    setError(null);
    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang, history: game.turns, next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(data.error === "closed" ? t.errors.closed : t.errors.generic);
        return;
      }
      setFreshIndex(game.turns.length);
      setGame((g) => ({ ...g, turns: [...g.turns, { ...next, reply: data.reply! }] }));
      setDraft("");
      setPresenting(null);
    } catch {
      setError(t.errors.generic);
    } finally {
      setPending(null);
      inputRef.current?.focus();
    }
  }

  function markSeen(id: string) {
    if (!game.seen.includes(id)) setGame((g) => ({ ...g, seen: [...g.seen, id] }));
  }

  function accuse(accusedId: string, cited: string[]) {
    const verdict = evaluateAccusation(c, state, accusedId, cited);
    setGame((g) => ({ ...g, ending: { accusedId, cited, verdict } }));
    setAccusing(false);
  }

  if (!loaded) return <main className="min-h-screen bg-desk" />;

  if (game.ending) {
    return <Ending lang={lang} verdict={game.ending.verdict} onRestart={() => restart(false)} onLang={setLang} />;
  }

  if (!started) {
    return (
      <Briefing
        lang={lang}
        onLang={setLang}
        canResume={hadSave}
        onStart={() => (hadSave ? restart() : setStarted(true))}
        onResume={() => setStarted(true)}
      />
    );
  }

  const readingEvidence = reading ? c.evidence.find((e) => e.id === reading) ?? null : null;
  const presentingEvidence = presenting ? c.evidence.find((e) => e.id === presenting) ?? null : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
            <div className="label">{t.fileNo} 0522-SR</div>
            <h1 className="text-lg font-semibold leading-tight">{c.title[lang]}</h1>
          </div>
          <Stat label={t.clock} value={clockAt(state.questionsUsed)} />
          <Stat label={t.questionsLeft} value={String(left)} warn={left <= 5} />
          <button onClick={() => setAccusing(true)} className="stamp ml-auto shrink-0 cursor-pointer hover:bg-stamp hover:text-paper sm:ml-0">
            {t.accuse}
          </button>
          <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="label cursor-pointer underline-offset-4 hover:underline">
            {t.lang}
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <section>
            <h2 className="label mb-2">{t.suspects}</h2>
            <ul className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {c.suspects.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSuspectId(s.id)}
                    aria-pressed={s.id === suspectId}
                    className={`w-full cursor-pointer border px-3 py-2 text-left transition-colors ${
                      s.id === suspectId ? "border-ink bg-paper" : "border-rule hover:border-ink-soft"
                    }`}
                  >
                    <span className="hidden text-sm font-semibold leading-snug lg:block">{s.name}</span>
                    <span className="block text-sm font-semibold leading-snug lg:hidden">{shortName(s.name)}</span>
                    <span className="label hidden normal-case tracking-normal lg:block">{s.role[lang]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="label mb-2">
              <button
                onClick={() => setEvidenceOpen((o) => !o)}
                aria-expanded={evidenceOpen}
                className="cursor-pointer uppercase lg:pointer-events-none"
              >
                {t.evidence} ({evidence.length})
                <span className="lg:hidden"> {evidenceOpen ? "−" : "+"}</span>
                {unseen.length > 0 && <span className="text-stamp lg:hidden"> · {t.newEvidence}</span>}
              </button>
            </h2>
            <ul className={`divide-y divide-rule border-y border-rule ${evidenceOpen ? "" : "max-lg:hidden"}`}>
              {evidence.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => {
                      setReading(e.id);
                      markSeen(e.id);
                    }}
                    className="flex w-full cursor-pointer items-baseline gap-2 py-2 text-left text-sm hover:text-stamp"
                  >
                    <span className="flex-1">{e.title[lang]}</span>
                    {unseen.includes(e.id) && <span className="label text-stamp!">{t.newEvidence}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="flex min-h-[70vh] flex-col border border-rule bg-paper shadow-[0_1px_0_var(--rule),0_12px_30px_-18px_rgba(0,0,0,0.35)]">
          <SuspectHeader suspect={suspect} lang={lang} />
          <Transcript
            lang={lang}
            suspect={suspect}
            played={played.filter((p) => p.suspectId === suspect.id)}
            pending={pending?.suspectId === suspect.id ? pending : null}
            pendingTime={clockAt(state.questionsUsed)}
            freshIndex={freshIndex}
          />

          <form
            className="border-t border-rule p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            {error && <p className="mb-3 text-sm text-stamp">{error}</p>}
            {left <= 0 ? (
              <p className="text-sm">{t.accuseForced}</p>
            ) : (
              <>
                {presentingEvidence && (
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <span className="label text-stamp!">{t.present}:</span>
                    <span className="flex-1 truncate">{presentingEvidence.title[lang]}</span>
                    <button type="button" onClick={() => setPresenting(null)} className="label cursor-pointer hover:text-ink">
                      {t.cancel}
                    </button>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  maxLength={400}
                  rows={2}
                  placeholder={presentingEvidence ? t.presentNote : t.placeholder}
                  disabled={pending !== null}
                  className="w-full resize-none border-b border-rule bg-transparent py-2 font-mono text-sm outline-none placeholder:text-ink-soft focus:border-ink"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={pending !== null || (!presenting && draft.trim() === "")}
                    className="cursor-pointer bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-paper disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {presenting ? t.present : t.ask}
                  </button>
                  <EvidencePicker
                    lang={lang}
                    evidence={evidence}
                    label={t.present}
                    onPick={(id) => {
                      setPresenting(id);
                      inputRef.current?.focus();
                    }}
                  />
                </div>
              </>
            )}
          </form>
        </main>
      </div>

      {readingEvidence && (
        <EvidenceSheet
          lang={lang}
          evidence={readingEvidence}
          presentLabel={left > 0 ? t.presentTo(suspect.name) : null}
          closeLabel={t.close}
          onPresent={() => {
            setPresenting(readingEvidence.id);
            setReading(null);
            inputRef.current?.focus();
          }}
          onClose={() => setReading(null)}
        />
      )}

      {(accusing || left <= 0) && !game.ending && (
        <Accusation lang={lang} evidence={evidence} onAccuse={accuse} onCancel={left > 0 ? () => setAccusing(false) : null} />
      )}
    </div>
  );
}

/** "Ernesto «Neto» Salazar" -> "Neto Salazar"; "Lucía Paredes" stays. For narrow screens. */
function shortName(name: string): string {
  const nick = name.match(/«(.+?)»/)?.[1];
  const words = name.split(/\s+/);
  return `${nick ?? words[0]} ${words[words.length - 1]}`;
}

function Stat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="text-right">
      <div className="label">{label}</div>
      <div className={`font-mono text-lg leading-tight tabular-nums ${warn ? "text-stamp" : ""}`}>{value}</div>
    </div>
  );
}

function SuspectHeader({ suspect, lang }: { suspect: Suspect; lang: Lang }) {
  const t = strings[lang];
  return (
    <div className="border-b border-rule px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 className="text-xl font-semibold">{suspect.name}</h2>
        <span className="label">
          {suspect.role[lang]} · {suspect.age} {t.age}
        </span>
      </div>
      <p className="mt-1 max-w-prose text-sm text-ink-soft">{suspect.summary[lang]}</p>
    </div>
  );
}

function EvidencePicker({
  lang,
  evidence,
  label,
  onPick,
}: {
  lang: Lang;
  evidence: Evidence[];
  label: string;
  onPick: (id: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="label">{label}:</span>
      <select
        value=""
        onChange={(e) => e.target.value && onPick(e.target.value)}
        className="max-w-[16rem] cursor-pointer border border-rule bg-paper px-2 py-1.5 text-sm"
      >
        <option value="">—</option>
        {evidence.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}

function LangToggle({ lang, onLang }: { lang: Lang; onLang: (l: Lang) => void }) {
  return (
    <button onClick={() => onLang(lang === "es" ? "en" : "es")} className="label cursor-pointer underline-offset-4 hover:underline">
      {strings[lang].lang}
    </button>
  );
}

function Briefing({
  lang,
  onLang,
  canResume,
  onStart,
  onResume,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  canResume: boolean;
  onStart: () => void;
  onResume: () => void;
}) {
  const t = strings[lang];
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <article className="w-full max-w-xl border border-rule bg-paper px-6 py-8 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12">
        <div className="flex items-start justify-between gap-4">
          <div className="label">{t.fileNo} 0522-SR</div>
          <LangToggle lang={lang} onLang={onLang} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">{c.title[lang]}</h1>
        <p className="mt-6 text-lg leading-relaxed">{c.briefing[lang]}</p>
        <ul className="mt-8 space-y-3 border-t border-rule pt-6">
          {c.suspects.map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-semibold">{s.name}</span>
              <span className="text-ink-soft"> · {s.role[lang]}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {canResume && (
            <button onClick={onResume} className="cursor-pointer bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper">
              {t.resume}
            </button>
          )}
          <button
            onClick={onStart}
            className={
              canResume
                ? "label cursor-pointer underline-offset-4 hover:underline"
                : "cursor-pointer bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper"
            }
          >
            {canResume ? t.restart : t.open}
          </button>
        </div>
      </article>
    </main>
  );
}

function Ending({
  lang,
  verdict,
  onRestart,
  onLang,
}: {
  lang: Lang;
  verdict: "solved" | "weak" | "wrong";
  onRestart: () => void;
  onLang: (l: Lang) => void;
}) {
  const t = strings[lang];
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <article className="w-full max-w-xl border border-rule bg-paper px-6 py-8 sm:px-10 sm:py-12">
        <div className="flex items-start justify-between gap-4">
          <div className="label">{t.fileNo} 0522-SR</div>
          <LangToggle lang={lang} onLang={onLang} />
        </div>
        <div className="mt-8">
          <span className="stamp text-base">{t.verdict[verdict]}</span>
        </div>
        <div className="mt-8 space-y-4 text-lg leading-relaxed">
          {c.epilogues[verdict][lang].split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <button
          onClick={onRestart}
          className="mt-10 cursor-pointer bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper"
        >
          {t.playAgain}
        </button>
      </article>
    </main>
  );
}
