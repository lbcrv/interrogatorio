"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { santaRita as c } from "@/content/santa-rita";
import { applyTurn, availableEvidence, evaluateAccusation, initialState, questionsLeft, validateTurn } from "@/game/engine";
import type { Evidence, GameState, Lang, Suspect, Turn, TurnInput, UnlockRule } from "@/game/types";
import { Accusation } from "./Accusation";
import { DocSlip, PaperClip } from "./Doc";
import { EvidenceSheet } from "./EvidenceSheet";
import { Fingerprint } from "./Fingerprint";
import { afterMotion, delay } from "./motion";
import { clockAt, strings } from "./strings";
import { Line, Transcript } from "./Transcript";
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
  // The evidence is dealt onto the desk one slip at a time when the file opens; later slips land at once.
  const [dealt, setDealt] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!started) return;
    const id = window.setTimeout(() => setDealt(true), 1500);
    return () => window.clearTimeout(id);
  }, [started]);

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
        const e = data.error;
        setError(e === "closed" || e === "busy" || e === "limit" ? t.errors[e] : t.errors.generic);
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
    }
  }

  // The input line is hidden while a reply is being typed; put the cursor back when it returns.
  useEffect(() => {
    if (!pending) inputRef.current?.focus({ preventScroll: true });
  }, [pending]);

  function markSeen(id: string) {
    if (!game.seen.includes(id)) setGame((g) => ({ ...g, seen: [...g.seen, id] }));
  }

  function accuse(accusedId: string, cited: string[]) {
    const verdict = evaluateAccusation(c, state, accusedId, cited);
    setGame((g) => ({ ...g, ending: { accusedId, cited, verdict } }));
    setAccusing(false);
  }

  if (!loaded) return <main className="min-h-screen" />;

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
  const suspectTurns = played.filter((p) => p.suspectId === suspect.id);
  const changedStory = c.rules.some((r) => r.suspectId === suspect.id && state.admissions.includes(r.id));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-desk shadow-[0_10px_20px_-12px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <span className="sticker text-[0.65rem]">
              {t.fileNo} 0522-SR
            </span>
            <h1 className="on-desk mt-1.5 truncate text-lg leading-tight font-semibold">{c.title[lang]}</h1>
          </div>
          <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="label on-desk cursor-pointer underline-offset-4 hover:underline max-sm:order-first max-sm:basis-full max-sm:text-right">
            {t.lang}
          </button>
          <div className="sheet flex items-center gap-4 px-4 py-2 max-sm:basis-full max-sm:justify-between">
            <div>
              <div className="label">{t.clock}</div>
              <div className="overflow-hidden font-mono text-lg leading-tight tabular-nums">
                <div key={state.questionsUsed} className="anim-tick">
                  {clockAt(state.questionsUsed)}
                </div>
              </div>
            </div>
            <Tally total={c.questionBudget} left={left} label={t.questionsLeft} note={t.left(left)} />
            <button onClick={() => setAccusing(true)} className="stamp shrink-0 cursor-pointer hover:bg-stamp hover:text-paper">
              {t.accuse}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-x-8 gap-y-5 px-4 pt-6 pb-16 lg:grid-cols-[250px_1fr]">
        <aside className="lg:pt-11">
          <h2 className="label on-desk mb-3">
            <button
              onClick={() => setEvidenceOpen((o) => !o)}
              aria-expanded={evidenceOpen}
              className="cursor-pointer uppercase lg:pointer-events-none"
            >
              {t.evidence} ({evidence.length})
              <span className="lg:hidden"> {evidenceOpen ? "−" : "+"}</span>
              {unseen.length > 0 && <span className="lg:hidden"> · {t.newEvidence}</span>}
            </button>
          </h2>
          <ul className={`space-y-3.5 ${evidenceOpen ? "" : "max-lg:hidden"}`}>
            {evidence.map((e, i) => (
              <li key={e.id}>
                <DocSlip
                  evidence={e}
                  lang={lang}
                  fresh={unseen.includes(e.id)}
                  dealDelay={dealt ? 0 : 250 + i * 110}
                  onOpen={() => {
                    setReading(e.id);
                    markSeen(e.id);
                  }}
                />
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <Tabs
            lang={lang}
            active={suspect.id}
            onPick={(id) => {
              setSuspectId(id);
              // A reply only types out once; coming back to a tab shows it finished.
              setFreshIndex(null);
            }}
          />
          <main className="manila relative p-3 sm:p-5">
            {/* Keyed by suspect so a new card and record are laid down when the tab changes. */}
            <IndexCard key={`card-${suspect.id}`} suspect={suspect} lang={lang} statements={suspectTurns.length} changedStory={changedStory} />

            <section key={`record-${suspect.id}`} className="lined anim-drop relative mt-4 min-h-96 pt-7 pb-6 pr-4 shadow-(--shadow) sm:pr-6" style={delay(90)}>
              <div className="mb-7 flex items-baseline justify-between gap-3 pl-16">
                <span className="label">
                  {t.record} · {suspect.name}
                </span>
                <span className="label shrink-0">
                  {t.folio} {String(c.suspects.indexOf(suspect) + 1).padStart(3, "0")}
                </span>
              </div>

              <Transcript
                lang={lang}
                suspect={suspect}
                played={suspectTurns}
                pending={pending?.suspectId === suspect.id ? pending : null}
                pendingTime={clockAt(state.questionsUsed)}
                freshIndex={freshIndex}
              />

              <form
                className="mt-7 font-mono text-[0.84rem]"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                {error && (
                  <Line time="" who="">
                    <span className="text-stamp">{error}</span>
                  </Line>
                )}
                {left <= 0 ? (
                  <Line time="" who="">
                    {t.accuseForced}
                  </Line>
                ) : pending ? null : (
                  <>
                    {presentingEvidence && (
                      <Line time="" who="">
                        <span className="hand mr-3 text-lg">
                          {t.present}: {presentingEvidence.title[lang]}
                        </span>
                        <button type="button" onClick={() => setPresenting(null)} className="label cursor-pointer hover:text-ink">
                          {t.cancel}
                        </button>
                      </Line>
                    )}
                    <Line time={pending ? "" : clockAt(state.questionsUsed)} who={t.detective}>
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
                        aria-label={t.placeholder}
                        placeholder={presentingEvidence ? t.presentNote : t.placeholder}
                        disabled={pending !== null}
                        className="block w-full resize-none bg-transparent leading-7 caret-stamp outline-none placeholder:text-ink-soft/70 max-sm:mt-0"
                      />
                    </Line>
                    <Line time="" who="">
                      <span className="mt-3 flex flex-wrap items-center gap-3 leading-normal">
                        <button type="submit" disabled={pending !== null || (!presenting && draft.trim() === "")} className="ink-button">
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
                      </span>
                    </Line>
                  </>
                )}
              </form>
            </section>
          </main>
        </div>
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

/** "Ernesto «Neto» Salazar" -> "Salazar". What goes on a folder tab. */
function surname(name: string): string {
  const words = name.split(/\s+/);
  return words[words.length - 1];
}

/** One box per question. Used ones get struck through, like a tally on a form. */
function Tally({ total, left, label, note }: { total: number; left: number; label: string; note: string }) {
  const used = total - left;
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={left} aria-valuetext={note}>
      <div className="label flex justify-between gap-3">
        <span>{label}</span>
        <span className={`whitespace-nowrap ${left <= 5 ? "text-stamp" : ""}`}>{note}</span>
      </div>
      <div className="mt-1 grid grid-cols-12 gap-0.75">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`relative size-2.25 border ${i < used ? "border-ink-soft" : left <= 5 ? "border-stamp" : "border-ink/60"}`}>
            {/* The strike mounts when the question is spent, so only the newest one draws itself. */}
            {i < used && (
              <span
                className="anim-strike absolute inset-0"
                style={{ background: "linear-gradient(to top right, transparent 44%, var(--ink) 44% 58%, transparent 58%)" }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function Tabs({ lang, active, onPick }: { lang: Lang; active: string; onPick: (id: string) => void }) {
  return (
    <div className="flex gap-1 pl-3" role="tablist" aria-label={strings[lang].suspects}>
      {c.suspects.map((s, i) => {
        const on = s.id === active;
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={on}
            onClick={() => onPick(s.id)}
            className={`relative cursor-pointer rounded-t-md px-3 pt-2 pb-1.5 font-mono text-xs tracking-widest uppercase sm:px-5 ${
              on ? "z-10 -mb-px bg-manila text-ink" : "mt-1.5 bg-manila-back text-ink/65 hover:text-ink"
            }`}
            style={{ backgroundImage: "var(--grain)" }}
          >
            <span className="text-ink-soft">{i + 1}</span> {surname(s.name)}
          </button>
        );
      })}
    </div>
  );
}

function IndexCard({
  suspect,
  lang,
  statements,
  changedStory,
}: {
  suspect: Suspect;
  lang: Lang;
  statements: number;
  changedStory: boolean;
}) {
  const t = strings[lang];
  return (
    <article className="sheet anim-drop relative flex gap-4 px-4 py-4 sm:rotate-[-0.4deg] sm:gap-6 sm:px-6">
      <div className="min-w-0 flex-1 space-y-2">
        <Field label={t.field.name}>
          <span className="text-xl font-semibold">{suspect.name}</span>
        </Field>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <Field label={t.field.age}>
            {suspect.age} {t.age}
          </Field>
          <Field label={t.field.job}>{suspect.role[lang]}</Field>
          <Field label={t.field.statements}>
            <span className="font-mono tabular-nums">{statements}</span>
          </Field>
        </div>
        <Field label={t.field.notes}>
          <span className="block max-w-prose text-sm leading-relaxed text-ink-soft">{suspect.summary[lang]}</span>
        </Field>
        {/* In the margin on wide cards; on its own line on phones so it never covers text. */}
        {changedStory && (
          <span className="hand anim-write block -rotate-2 text-xl sm:absolute sm:top-3 sm:right-28 sm:-rotate-6" style={delay(700)}>
            {t.changedStory}
          </span>
        )}
      </div>
      <div className="hidden shrink-0 flex-col items-center sm:flex">
        <div className="border border-ink/30 px-2 pt-2 pb-1">
          <Fingerprint seed={suspect.name} inked className="h-20 w-16 text-ink" />
        </div>
        <span className="label mt-1 text-[0.6rem]">{t.field.print}</span>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label text-[0.6rem]">{label}</div>
      <div className="leading-snug">{children}</div>
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
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value=""
        onChange={(e) => e.target.value && onPick(e.target.value)}
        className="max-w-60 cursor-pointer appearance-none border border-ink/40 bg-transparent py-2 pr-8 pl-3 font-mono text-xs tracking-widest uppercase hover:border-ink"
      >
        <option value="">{label}</option>
        {evidence.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title[lang]}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 10 6" className="pointer-events-none absolute right-3 h-1.5 w-2.5" aria-hidden="true">
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </label>
  );
}

function LangToggle({ lang, onLang, className = "" }: { lang: Lang; onLang: (l: Lang) => void; className?: string }) {
  return (
    <button onClick={() => onLang(lang === "es" ? "en" : "es")} className={`label cursor-pointer underline-offset-4 hover:underline ${className}`}>
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
  const [opening, setOpening] = useState(false);

  /** The cover swings open like a book before the file is shown. */
  function open(then: () => void) {
    if (opening) return;
    setOpening(true);
    afterMotion(600, then);
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className={`w-full max-w-2xl ${opening ? "anim-folder-open" : "anim-drop"}`}>
        <div className="flex items-end justify-between">
          <div className="manila ml-4 rounded-t-md px-5 pt-2.5 pb-2 shadow-none">
            <span className="sticker text-[0.65rem]">
              {t.fileNo} 0522-SR
            </span>
          </div>
          <LangToggle lang={lang} onLang={onLang} className="on-desk mb-2" />
        </div>

        <article className="manila relative px-5 pt-7 pb-8 sm:px-10 sm:pt-9">
          <span className="stamp absolute top-6 right-5 rotate-[8deg] text-sm sm:right-10">{t.dateStamp}</span>
          <div className="label pr-24 sm:pr-28">{t.agency} · Santa Rita del Monte</div>
          <h1 className="mt-3 max-w-[80%] text-3xl leading-tight font-semibold sm:text-[2.6rem]">{c.title[lang]}</h1>

          <div className="sheet relative mt-7 rotate-[-0.6deg] px-5 py-6 sm:px-7">
            <PaperClip className="absolute -top-4 right-10 h-12 w-5" />
            <p className="text-[1.07rem] leading-relaxed">{c.briefing[lang]}</p>
          </div>

          <h2 className="label mt-8 mb-3">{t.suspects}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {c.suspects.map((s, i) => (
              <li
                key={s.id}
                className="sheet anim-deal flex items-center gap-3 px-3 py-3"
                style={{ "--tilt": `${(i - 1) * 0.7}deg`, "--delay": `${350 + i * 140}ms`, transform: `rotate(${(i - 1) * 0.7}deg)` } as React.CSSProperties}
              >
                <Fingerprint seed={s.name} className="h-12 w-10 shrink-0 text-ink" />
                <span className="min-w-0">
                  <span className="block text-sm leading-snug font-semibold">{s.name}</span>
                  <span className="label block text-[0.6rem] normal-case tracking-wide">{s.role[lang]}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            {canResume && (
              <button onClick={() => open(onResume)} className="ink-button">
                {t.resume}
              </button>
            )}
            {/* Starting over asks for confirmation first, so only a fresh start opens the cover. */}
            <button
              onClick={canResume ? onStart : () => open(onStart)}
              className={canResume ? "label cursor-pointer underline-offset-4 hover:underline" : "ink-button"}
            >
              {canResume ? t.restart : t.open}
            </button>
          </div>
        </article>
      </div>
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
  const paragraphs = c.epilogues[verdict][lang].split("\n\n");
  // Sheet lands, stamp comes down at STAMP_MS, the desk jolts as it hits, then the epilogue.
  const STAMP_MS = 300;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="anim-thud w-full max-w-xl" style={delay(STAMP_MS + 230)}>
        <article className="sheet anim-drop relative px-6 pt-8 pb-10 sm:px-10 sm:pt-10">
          <div className="flex items-start justify-between gap-4">
            <div className="label">
              {t.agency} · {t.fileNo} 0522-SR
            </div>
            <LangToggle lang={lang} onLang={onLang} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">{c.title[lang]}</h1>
          <div className="mt-8 mb-2 flex justify-center">
            <span className="stamp stamp-down px-5 py-2 text-2xl sm:text-3xl" style={delay(STAMP_MS)}>
              {t.verdict[verdict]}
            </span>
          </div>
          <div className="mt-8 space-y-4 text-lg leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i} className="anim-fade-up" style={delay(900 + i * 450)}>
                {p}
              </p>
            ))}
          </div>
          <button onClick={onRestart} className="ink-button anim-fade-up mt-10" style={delay(900 + paragraphs.length * 450)}>
            {t.playAgain}
          </button>
        </article>
      </div>
    </main>
  );
}
