import { describe, expect, it } from "vitest";
import { santaRita as c } from "@/content/santa-rita";
import {
  applyTurn,
  availableEvidence,
  evaluateAccusation,
  initialState,
  questionsLeft,
  replay,
  validateTurn,
} from "./engine";
import type { TurnInput } from "./types";

const ask = (suspectId: string, text = "¿Dónde estaba anoche?"): TurnInput => ({ suspectId, kind: "ask", text });
const present = (suspectId: string, evidenceId: string, text = ""): TurnInput => ({
  suspectId,
  kind: "present",
  evidenceId,
  text,
});

describe("case data", () => {
  it("references only evidence and suspects that exist", () => {
    const evidence = new Set(c.evidence.map((e) => e.id));
    const suspects = new Set(c.suspects.map((s) => s.id));
    for (const r of c.rules) {
      expect(suspects.has(r.suspectId)).toBe(true);
      expect(evidence.has(r.evidenceId)).toBe(true);
      if (r.unlocks) expect(evidence.has(r.unlocks)).toBe(true);
    }
    for (const id of c.solution.proof.flat()) expect(evidence.has(id)).toBe(true);
    expect(suspects.has(c.solution.culpritId)).toBe(true);
  });

  it("can be solved within the question budget", () => {
    const path = [present("lucia", "chayo"), present("neto", "chayo"), present("aurelio", "fotos-lucia")];
    const s = replay(c, path);
    expect(questionsLeft(c, s)).toBeGreaterThan(0);
    expect(evaluateAccusation(c, s, "aurelio", ["informe", "declaracion-aurelio", "mensajes-neto"])).toBe("solved");
  });

  it("keeps the solution out of innocent suspects' sheets", () => {
    for (const s of c.suspects.filter((x) => x.id !== c.solution.culpritId)) {
      expect(s.sheet).not.toMatch(/anda, envuelta|paliacate|escondiste la corona/i);
    }
  });
});

describe("turns", () => {
  it("spends one question per turn", () => {
    const s = replay(c, [ask("neto"), ask("lucia")]);
    expect(s.questionsUsed).toBe(2);
  });

  it("rejects evidence the player has not unlocked", () => {
    expect(validateTurn(c, initialState(), present("aurelio", "fotos-lucia"))).toBe("evidence-not-available");
  });

  it("unlocks evidence when the right item is shown to the right person", () => {
    const { state, fired } = applyTurn(c, initialState(), present("lucia", "chayo"));
    expect(fired?.id).toBe("lucia-volvio");
    expect(availableEvidence(c, state).map((e) => e.id)).toContain("fotos-lucia");
  });

  it("does nothing special when the evidence means nothing to that suspect", () => {
    const { state, fired } = applyTurn(c, initialState(), present("lucia", "programa"));
    expect(fired).toBeNull();
    expect(state.unlocked).toEqual([]);
  });

  it("fires each rule only once", () => {
    const s = replay(c, [present("neto", "chayo")]);
    const { fired, state } = applyTurn(c, s, present("neto", "chayo"));
    expect(fired).toBeNull();
    expect(state.unlocked).toEqual(["mensajes-neto"]);
  });

  it("stops at the question budget", () => {
    const turns = Array.from({ length: c.questionBudget }, () => ask("neto"));
    const s = replay(c, turns);
    expect(validateTurn(c, s, ask("neto"))).toBe("no-questions-left");
  });

  it("rejects empty and oversized questions", () => {
    expect(validateTurn(c, initialState(), ask("neto", "   "))).toBe("empty-question");
    expect(validateTurn(c, initialState(), ask("neto", "a".repeat(401)))).toBe("text-too-long");
  });

  it("throws when replaying a forged log", () => {
    expect(() => replay(c, [present("aurelio", "declaracion-aurelio")])).toThrow(/evidence-not-available/);
  });
});

describe("accusation", () => {
  const solvedState = replay(c, [present("lucia", "chayo"), present("aurelio", "fotos-lucia")]);

  it("is wrong for an innocent suspect, whatever the evidence", () => {
    expect(evaluateAccusation(c, solvedState, "neto", ["informe", "declaracion-aurelio", "chayo"])).toBe("wrong");
  });

  it("is weak without a motive", () => {
    expect(evaluateAccusation(c, solvedState, "aurelio", ["informe", "chayo", "fotos-escena"])).toBe("weak");
  });

  it("ignores citations of locked evidence", () => {
    const early = initialState();
    expect(evaluateAccusation(c, early, "aurelio", ["informe", "declaracion-aurelio", "chayo"])).toBe("weak");
  });

  it("only counts the first maxCitations items", () => {
    expect(
      evaluateAccusation(c, solvedState, "aurelio", ["programa", "fotos-escena", "chayo", "informe", "declaracion-aurelio"]),
    ).toBe("weak");
  });

  it("is solved with means, motive and opportunity", () => {
    expect(evaluateAccusation(c, solvedState, "aurelio", ["informe", "declaracion-aurelio", "chayo"])).toBe("solved");
  });
});
