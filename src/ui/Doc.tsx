import type { Evidence, Lang } from "@/game/types";
import { delay } from "./motion";
import { strings } from "./strings";

/** Deterministic slight tilt so the pile looks handled, not generated. */
export function tiltFor(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.35;
}

export function PaperClip({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 44" className={className} aria-hidden="true">
      <path
        d="M11 14v19a4.5 4.5 0 0 1-9 0V8a6 6 0 0 1 12 0v25"
        fill="none"
        stroke="#7c7a74"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** One slip in the evidence pile. */
export function DocSlip({
  evidence,
  lang,
  fresh,
  dealDelay,
  onOpen,
}: {
  evidence: Evidence;
  lang: Lang;
  fresh: boolean;
  /** When this slip lands on the desk, in ms; slips are dealt one after another. */
  dealDelay: number;
  onOpen: () => void;
}) {
  const t = strings[lang];
  const tilt = tiltFor(evidence.id);
  return (
    <button
      onClick={onOpen}
      style={{ "--tilt": `${tilt}deg`, "--delay": `${dealDelay}ms`, transform: `rotate(${tilt}deg)` } as React.CSSProperties}
      className="sheet anim-deal group relative flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-[translate] hover:-translate-y-0.5"
    >
      {evidence.kind === "photos" && <span className="mt-0.5 size-8 shrink-0 border-[3px] border-white bg-[#3a3632] shadow-sm" />}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="label text-[0.62rem]">{t.kind[evidence.kind]}</span>
          {fresh && (
            <span className="hand anim-write -rotate-3 text-base" style={delay(dealDelay + 450)}>
              {t.newEvidence.toLowerCase()}
            </span>
          )}
        </span>
        <span className="block text-sm leading-snug group-hover:text-stamp">{evidence.title[lang]}</span>
      </span>
      {fresh && <PaperClip className="absolute -top-3 right-5 h-10 w-4" />}
    </button>
  );
}

/** The full document, drawn as the kind of paper it is. */
export function DocBody({ evidence, lang }: { evidence: Evidence; lang: Lang }) {
  const body = evidence.body[lang];
  switch (evidence.kind) {
    case "program":
      return <Program body={body} />;
    case "statement":
      // Sits on the ruled lines of the sheet, so it keeps the sheet's line height.
      return <p className="font-serif text-[1.02rem] leading-7 italic">{body}</p>;
    case "photos":
      return <Photos body={body} lang={lang} />;
    case "messages":
      return <Messages body={body} />;
    case "report":
      return <Report body={body} />;
  }
}

/** "21:30. Text", or a range like "20:00 a 00:30 Text" / "20:00 to 00:30 Text". */
const TIMED = /^(\d{1,2}:\d{2}(?:\s+(?:a|to)\s+\d{1,2}:\d{2})?)\.?\s+(.*)$/;

function Report({ body }: { body: string }) {
  return (
    <div className="space-y-2 font-mono text-[0.84rem] leading-relaxed">
      {body.split("\n").map((line, i) => {
        const m = line.match(TIMED);
        return m ? (
          <p key={i} className="grid grid-cols-[3.5rem_1fr]">
            <span className="text-ink-soft tabular-nums">{m[1]}</span>
            <span>{m[2]}</span>
          </p>
        ) : (
          <p key={i}>{line}</p>
        );
      })}
    </div>
  );
}

function Program({ body }: { body: string }) {
  return (
    <div className="border-4 border-double border-ink px-4 py-5 text-center sm:px-8">
      <p className="label tracking-[0.3em]">Santa Rita del Monte</p>
      <div className="mt-4 space-y-6">
        {body.split("\n\n").map((day, i) => {
          const [date, ...rows] = day.split("\n");
          return (
            <section key={i}>
              <h3 className="font-serif text-2xl font-bold tracking-wide uppercase">{date}</h3>
              <div className="mx-auto mt-3 grid max-w-md grid-cols-[7rem_1fr] gap-x-4 gap-y-1.5 text-left text-sm">
                {rows.map((row, j) => {
                  const m = row.match(TIMED);
                  return (
                    <p key={j} className="contents">
                      <span className="font-mono text-[0.8rem] tabular-nums">{m?.[1]}</span>
                      <span>{m?.[2] ?? row}</span>
                    </p>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Photos({ body, lang }: { body: string; lang: Lang }) {
  const t = strings[lang];
  return (
    <div>
      <div className="bg-[#1f1c19] px-2 py-1.5 shadow-inner">
        <Sprockets />
        <div className="grid grid-cols-3 gap-1.5 py-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="relative aspect-[4/3]"
              style={{
                background: `radial-gradient(ellipse at ${35 + i * 15}% ${45 + i * 5}%, #6b655c, #2e2a26 70%), #2e2a26`,
              }}
            >
              <span className="absolute bottom-1 left-1 bg-paper px-1 font-mono text-[0.6rem] leading-tight font-medium text-ink">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
        <Sprockets />
        <p className="pb-0.5 font-mono text-[0.6rem] tracking-widest text-[#8d877d] uppercase">{t.contactSheet}</p>
      </div>
      <p className="mt-4 leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  );
}

function Sprockets() {
  return (
    <div className="flex justify-between px-1" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i} className="h-1.5 w-2.5 rounded-[1px] bg-[#8d877d]/50" />
      ))}
    </div>
  );
}

const MESSAGE = /^(\d{1,2}:\d{2})\s+([^:]+):\s*(.*)$/;

function Messages({ body }: { body: string }) {
  return (
    <div className="mx-auto max-w-sm border-y-2 border-dashed border-rule py-3 font-mono text-[0.8rem] leading-relaxed">
      {body.split("\n").map((line, i) => {
        const m = line.match(MESSAGE);
        if (!m) return <p key={i}>{line}</p>;
        return (
          <p key={i} className="grid grid-cols-[3.2rem_1fr] py-0.5">
            <span className="text-ink-soft tabular-nums">{m[1]}</span>
            <span>
              <span className="font-medium">{m[2]}:</span> {m[3]}
            </span>
          </p>
        );
      })}
    </div>
  );
}
