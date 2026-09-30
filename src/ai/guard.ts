import type { CaseFile, Lang } from "@/game/types";

/** Tells that the character has stepped out of the fiction. Checked for every suspect. */
const BROKE_CHARACTER: RegExp[] = [
  /\bmodelo de lenguaje\b/i,
  /\binteligencia artificial\b/i,
  /\bcomo (una )?IA\b/,
  /\bmis instrucciones\b/i,
  /\blanguage model\b/i,
  /\bas an AI\b/i,
  /\bmy instructions\b/i,
  /\bsystem prompt\b/i,
];

export type GuardResult = { ok: true } | { ok: false; reason: "broke-character" | "forbidden" };

export function checkReply(c: CaseFile, suspectId: string, reply: string): GuardResult {
  if (BROKE_CHARACTER.some((re) => re.test(reply))) return { ok: false, reason: "broke-character" };
  if ((c.forbidden[suspectId] ?? []).some((re) => re.test(reply))) return { ok: false, reason: "forbidden" };
  return { ok: true };
}

/** What the player sees if the model fails the guard twice. Silence is in character for anyone in that room. */
export const SILENCE: Record<Lang, string> = {
  es: "(Se queda callado un momento y mira hacia la ventana.) No tengo nada más que decirle sobre eso.",
  en: "(A long pause, eyes on the window.) I have nothing more to tell you about that.",
};

/** Normalizes model output: trims, drops markdown emphasis and surrounding quotes. */
export function cleanReply(text: string): string {
  return text
    .replace(/\*+/g, "")
    .trim()
    .replace(/^["“]([\s\S]*)["”]$/, "$1")
    .trim();
}
