import type { CaseFile, Evidence, GameState, TurnInput, UnlockRule, Verdict } from "./types";

export const MAX_QUESTION_LENGTH = 400;

export function initialState(): GameState {
  return { questionsUsed: 0, unlocked: [], admissions: [] };
}

export function availableEvidence(c: CaseFile, s: GameState): Evidence[] {
  return c.evidence.filter((e) => e.initial || s.unlocked.includes(e.id));
}

export function questionsLeft(c: CaseFile, s: GameState): number {
  return c.questionBudget - s.questionsUsed;
}

/** Returns a reason the turn is illegal, or null if it can be played. */
export function validateTurn(c: CaseFile, s: GameState, t: TurnInput): string | null {
  if (questionsLeft(c, s) <= 0) return "no-questions-left";
  if (!c.suspects.some((x) => x.id === t.suspectId)) return "unknown-suspect";
  const text = t.text.trim();
  if (text.length > MAX_QUESTION_LENGTH) return "text-too-long";
  if (t.kind === "ask") {
    if (text.length === 0) return "empty-question";
    if (t.evidenceId) return "ask-with-evidence";
  } else {
    if (!t.evidenceId) return "missing-evidence";
    if (!availableEvidence(c, s).some((e) => e.id === t.evidenceId)) return "evidence-not-available";
  }
  return null;
}

export function ruleFor(c: CaseFile, s: GameState, t: TurnInput): UnlockRule | null {
  if (t.kind !== "present") return null;
  return (
    c.rules.find(
      (r) => r.suspectId === t.suspectId && r.evidenceId === t.evidenceId && !s.admissions.includes(r.id),
    ) ?? null
  );
}

/** Applies a legal turn. Throws on an illegal one, so callers validate first. */
export function applyTurn(
  c: CaseFile,
  s: GameState,
  t: TurnInput,
): { state: GameState; fired: UnlockRule | null } {
  const reason = validateTurn(c, s, t);
  if (reason) throw new Error(`Illegal turn: ${reason}`);
  const fired = ruleFor(c, s, t);
  const state: GameState = {
    questionsUsed: s.questionsUsed + 1,
    unlocked: fired?.unlocks ? [...s.unlocked, fired.unlocks] : s.unlocked,
    admissions: fired ? [...s.admissions, fired.id] : s.admissions,
  };
  return { state, fired };
}

/** Rebuilds state from the turn log. The server never trusts client state, only this. */
export function replay(c: CaseFile, turns: TurnInput[]): GameState {
  return turns.reduce((s, t) => applyTurn(c, s, t).state, initialState());
}

export function evaluateAccusation(c: CaseFile, s: GameState, suspectId: string, cited: string[]): Verdict {
  if (suspectId !== c.solution.culpritId) return "wrong";
  const have = new Set(availableEvidence(c, s).map((e) => e.id));
  const valid = [...new Set(cited)].filter((id) => have.has(id)).slice(0, c.solution.maxCitations);
  const proven = c.solution.proof.every((group) => group.some((id) => valid.includes(id)));
  return proven ? "solved" : "weak";
}
