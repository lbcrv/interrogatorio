"use client";

import { animate } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { Evidence, Lang } from "@/game/types";
import { DocBody, PaperClip, tiltFor } from "./Doc";
import { reducedMotion } from "./motion";
import { play } from "./sound";
import { strings } from "./strings";

const EASE = [0.2, 0.8, 0.3, 1] as const;

export function EvidenceSheet({
  lang,
  evidence,
  from,
  presentLabel,
  closeLabel,
  onPresent,
  onClose,
}: {
  lang: Lang;
  evidence: Evidence;
  /** Where the slip sat in the pile. The document grows out of it and goes back to it. */
  from: DOMRect | null;
  presentLabel: string | null;
  closeLabel: string;
  onPresent: () => void;
  onClose: () => void;
}) {
  const t = strings[lang];
  const sheet = useRef<HTMLElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const tilt = tiltFor(evidence.id);
  const zoom = from !== null;

  /** Offset and scale that put the open document exactly over the slip. */
  const overSlip = useCallback(() => {
    const to = sheet.current!.getBoundingClientRect();
    return {
      x: from!.left + from!.width / 2 - (to.left + to.width / 2),
      y: from!.top + from!.height / 2 - (to.top + to.height / 2),
      scale: from!.width / to.width,
    };
  }, [from]);

  useLayoutEffect(() => {
    if (!zoom || reducedMotion()) return;
    const s = overSlip();
    animate(
      sheet.current!,
      { x: [s.x, 0], y: [s.y, 0], scale: [s.scale, 1], rotate: [tilt, tilt / 2], opacity: [0.6, 1] },
      { duration: 0.38, ease: EASE },
    );
  }, [zoom, overSlip, tilt]);

  const close = useCallback(() => {
    play("paper");
    if (!zoom || reducedMotion()) return onClose();
    const s = overSlip();
    animate(backdrop.current!, { opacity: 0 }, { duration: 0.25 });
    void animate(sheet.current!, { x: s.x, y: s.y, scale: s.scale, rotate: tilt, opacity: 0 }, { duration: 0.28, ease: "easeIn" }).then(onClose);
  }, [zoom, overSlip, tilt, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const lined = evidence.kind === "statement";

  return (
    <div
      ref={backdrop}
      className="anim-backdrop fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-title"
    >
      <article
        ref={sheet}
        className={`${lined ? "lined pl-16 sm:pl-[4.25rem]" : "sheet px-6 sm:px-9"} ${zoom ? "" : "anim-lift"} relative max-h-[88vh] w-full max-w-xl overflow-y-auto py-7 pr-6 shadow-2xl sm:pr-9`}
        style={{ "--tilt": `${tilt / 2}deg`, transform: `rotate(${tilt / 2}deg)` } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <PaperClip className="absolute -top-3 right-8 h-12 w-5" />
        <div className="flex items-baseline justify-between gap-4 pr-8">
          <span className="label">
            {t.agency} · 0522-SR
          </span>
          <span className="label">{t.kind[evidence.kind]}</span>
        </div>
        {/* On ruled paper every block keeps to the 1.75rem line grid. */}
        <h2 id="evidence-title" className={`text-xl font-semibold ${lined ? "my-7 leading-7" : "mt-3 mb-5 leading-snug"}`}>
          {evidence.title[lang]}
        </h2>
        <DocBody evidence={evidence} lang={lang} />
        <div className="mt-8 flex flex-wrap items-center gap-5">
          {presentLabel && (
            <button onClick={onPresent} autoFocus className="ink-button">
              {presentLabel}
            </button>
          )}
          <button onClick={close} className="label cursor-pointer underline-offset-4 hover:underline">
            {closeLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
