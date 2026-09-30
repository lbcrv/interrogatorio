"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import type { Evidence, Lang } from "@/game/types";
import { delay } from "./motion";
import { PHOTO_SCENES, PhotoFrame } from "./PhotoScenes";
import { play } from "./sound";
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

/** A point on the page, as Motion reports drag positions. */
export interface PagePoint {
  x: number;
  y: number;
}

/**
 * One slip in the evidence pile. It is dealt onto the desk, opens on click,
 * and can be dragged onto the folder to put it in front of the suspect.
 */
export function DocSlip({
  evidence,
  lang,
  fresh,
  dealDelay,
  draggable,
  onOpen,
  onDragMove,
  onDrop,
}: {
  evidence: Evidence;
  lang: Lang;
  fresh: boolean;
  /** When this slip lands on the desk, in ms; slips are dealt one after another. */
  dealDelay: number;
  draggable: boolean;
  onOpen: (from: DOMRect) => void;
  /** Null when the drag ends. */
  onDragMove: (at: PagePoint | null) => void;
  onDrop: (at: PagePoint) => void;
}) {
  const t = strings[lang];
  const tilt = tiltFor(evidence.id);
  // A drag ends with a click on the same button; that click must not open the document.
  const dragged = useRef(false);
  return (
    <motion.button
      onClick={(e) => {
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onOpen(e.currentTarget.getBoundingClientRect());
      }}
      drag={draggable}
      dragSnapToOrigin
      dragElastic={1}
      onDragStart={() => {
        dragged.current = true;
        play("paper");
      }}
      onDrag={(_, info) => onDragMove(info.point)}
      onDragEnd={(_, info) => {
        onDragMove(null);
        onDrop(info.point);
        // Released away from the slip, the browser sends no click; clear the flag after any click would have run.
        window.setTimeout(() => (dragged.current = false), 0);
      }}
      initial={{ opacity: 0, x: -70, y: -40, rotate: tilt - 12 }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: tilt, transition: { duration: 0.46, ease: [0.2, 0.8, 0.3, 1], delay: dealDelay / 1000 } }}
      whileHover={{ y: -2 }}
      whileDrag={{ scale: 1.06, rotate: tilt + 4, zIndex: 40, boxShadow: "0 22px 34px -12px rgba(0,0,0,0.65)", cursor: "grabbing" }}
      className={`sheet group relative flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left ${draggable ? "touch-none" : ""}`}
    >
      {evidence.kind === "photos" && (
        <span className="mt-0.5 h-8 w-10 shrink-0 overflow-hidden border-[3px] border-white bg-[#3a3632] shadow-sm">
          {PHOTO_SCENES[evidence.id] && <PhotoFrame frame={PHOTO_SCENES[evidence.id][0]} n={1} showNumber={false} />}
        </span>
      )}
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
    </motion.button>
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
      return <Photos id={evidence.id} body={body} lang={lang} />;
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

function Photos({ id, body, lang }: { id: string; body: string; lang: Lang }) {
  const t = strings[lang];
  const frames = PHOTO_SCENES[id] ?? [];
  return (
    <div>
      <div className="bg-[#1f1c19] px-2 py-1.5 shadow-inner">
        <Sprockets />
        <div className="grid grid-cols-3 gap-1.5 py-1.5">
          {frames.map((frame, i) => (
            <div key={i} className="aspect-[4/3]">
              <PhotoFrame frame={frame} n={i + 1} />
            </div>
          ))}
        </div>
        <Sprockets />
        <p className="pb-0.5 font-mono text-[0.6rem] tracking-widest text-[#8d877d] uppercase">{t.contactSheet}</p>
      </div>
      {/* Typed captions under the strip, one per frame. */}
      <ol className="mt-2 grid grid-cols-3 gap-1.5 font-mono text-[0.68rem] leading-snug text-ink-soft">
        {frames.map((frame, i) => (
          <li key={i}>
            {i + 1}. {frame.caption[lang]}
          </li>
        ))}
      </ol>
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
