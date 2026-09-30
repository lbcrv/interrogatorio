"use client";

import { useEffect } from "react";
import type { Evidence, Lang } from "@/game/types";
import { DocBody, PaperClip, tiltFor } from "./Doc";
import { strings } from "./strings";

export function EvidenceSheet({
  lang,
  evidence,
  presentLabel,
  closeLabel,
  onPresent,
  onClose,
}: {
  lang: Lang;
  evidence: Evidence;
  presentLabel: string | null;
  closeLabel: string;
  onPresent: () => void;
  onClose: () => void;
}) {
  const t = strings[lang];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lined = evidence.kind === "statement";

  return (
    <div
      className="anim-backdrop fixed inset-0 z-30 flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-title"
    >
      <article
        className={`${lined ? "lined pl-16 sm:pl-[4.25rem]" : "sheet px-6 sm:px-9"} anim-lift relative max-h-[88vh] w-full max-w-xl overflow-y-auto py-7 pr-6 shadow-2xl sm:pr-9`}
        style={{ "--tilt": `${tiltFor(evidence.id) / 2}deg`, transform: `rotate(${tiltFor(evidence.id) / 2}deg)` } as React.CSSProperties}
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
          <button onClick={onClose} className="label cursor-pointer underline-offset-4 hover:underline">
            {closeLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
