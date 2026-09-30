import { groq } from "@ai-sdk/groq";
import { APICallError, generateText, RetryError } from "ai";
import { applyTurn, replay } from "@/game/engine";
import type { CaseFile, Lang, Turn, TurnInput } from "@/game/types";
import { checkReply, cleanReply, SILENCE } from "./guard";
import { buildInstructions, buildMessages } from "./prompt";

export const MODEL_ID = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

/** The free tier ran out for today. The UI shows this as the archive being closed. */
export class QuotaExhaustedError extends Error {}

/** The per-minute token limit is full; it clears within about a minute. */
export class BusyError extends Error {}

/** Groq asks to wait this long or less when only the per-minute limit is hit. */
const PER_MINUTE_WAIT_S = 90;

export interface InterrogationResult {
  reply: string;
  /** How many drafts the guard rejected before this reply (0 on a clean first answer). */
  rejected: number;
}

/**
 * Plays one turn: replays the log to rebuild trusted state, asks the model for
 * the suspect's reply, and screens it before it reaches the player.
 * Throws if the turn is illegal.
 */
export async function interrogate(c: CaseFile, lang: Lang, history: Turn[], next: TurnInput): Promise<InterrogationResult> {
  const state = replay(c, history);
  const { fired } = applyTurn(c, state, next);
  const suspect = c.suspects.find((s) => s.id === next.suspectId)!;

  const instructions = buildInstructions(c, suspect, state, lang, fired);
  const messages = buildMessages(c, history, next);

  let rejected = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const retryNote =
      attempt === 0
        ? ""
        : "\n\n# Note\nYour previous draft broke character or said something this person would never say out loud. Answer again, in character.";
    const reply = cleanReply(await complete(instructions + retryNote, messages));
    if (checkReply(c, suspect.id, reply).ok) return { reply, rejected };
    rejected++;
  }
  return { reply: SILENCE[lang], rejected };
}

/**
 * A suspect answering a question needs no chain of thought. Thinking models get
 * it switched off or kept low, which saves tokens and keeps replies short.
 */
function reasoningOptions(model: string) {
  if (model.startsWith("openai/gpt-oss")) return { groq: { reasoningEffort: "low", reasoningFormat: "hidden" } };
  if (model.startsWith("qwen/")) return { groq: { reasoningEffort: "none" } };
  return undefined;
}

async function complete(instructions: string, messages: ReturnType<typeof buildMessages>): Promise<string> {
  try {
    const { text } = await generateText({
      model: groq(MODEL_ID),
      instructions,
      messages,
      maxOutputTokens: 700,
      maxRetries: 1,
      providerOptions: reasoningOptions(MODEL_ID),
    });
    return text;
  } catch (err) {
    const cause = RetryError.isInstance(err) ? err.lastError : err;
    if (APICallError.isInstance(cause) && cause.statusCode === 429) {
      const wait = Number(cause.responseHeaders?.["retry-after"]);
      throw Number.isFinite(wait) && wait <= PER_MINUTE_WAIT_S ? new BusyError() : new QuotaExhaustedError();
    }
    throw err;
  }
}
