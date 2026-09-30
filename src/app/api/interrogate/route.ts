import { z } from "zod";
import { interrogate, QuotaExhaustedError } from "@/ai/interrogate";
import { santaRita } from "@/content/santa-rita";
import { MAX_QUESTION_LENGTH, replay, validateTurn } from "@/game/engine";

const turnInput = z.object({
  suspectId: z.string().max(40),
  kind: z.enum(["ask", "present"]),
  evidenceId: z.string().max(40).optional(),
  text: z.string().max(MAX_QUESTION_LENGTH),
});

const body = z.object({
  lang: z.enum(["es", "en"]),
  history: z.array(turnInput.extend({ reply: z.string().max(2000) })).max(santaRita.questionBudget),
  next: turnInput,
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad-request" }, { status: 400 });
  const { lang, history, next } = parsed.data;

  let reason: string | null;
  try {
    reason = validateTurn(santaRita, replay(santaRita, history), next);
  } catch {
    reason = "invalid-history";
  }
  if (reason) return Response.json({ error: reason }, { status: 422 });

  try {
    const { reply, rejected } = await interrogate(santaRita, lang, history, next);
    if (rejected > 0) console.warn(`[guard] rejected ${rejected} draft(s) for ${next.suspectId}`);
    return Response.json({ reply });
  } catch (err) {
    if (err instanceof QuotaExhaustedError) return Response.json({ error: "closed" }, { status: 503 });
    console.error(err);
    return Response.json({ error: "model-error" }, { status: 502 });
  }
}
