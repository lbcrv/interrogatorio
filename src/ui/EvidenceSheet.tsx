"use client";

import { useEffect } from "react";
import type { Evidence, Lang } from "@/game/types";

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-title"
    >
      <article
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto border border-rule bg-paper px-6 py-7 shadow-xl sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="evidence-title" className="text-xl font-semibold leading-snug">
          {evidence.title[lang]}
        </h2>
        <p className="mt-4 whitespace-pre-line leading-relaxed">{evidence.body[lang]}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {presentLabel && (
            <button
              onClick={onPresent}
              autoFocus
              className="cursor-pointer bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-paper"
            >
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
