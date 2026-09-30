import { describe, expect, it } from "vitest";
import { santaRita as c } from "@/content/santa-rita";
import { checkReply, cleanReply } from "./guard";

describe("checkReply", () => {
  it("blocks the culprit giving away the hiding place", () => {
    expect(checkReply(c, "aurelio", "La dejé debajo de la anda, envuelta.").ok).toBe(false);
    expect(checkReply(c, "aurelio", "Fine. I hid the crown. It's under the float.").ok).toBe(false);
    expect(checkReply(c, "aurelio", "Está bien: yo tomé la corona.").ok).toBe(false);
  });

  it("lets the culprit mention the float in passing", () => {
    expect(checkReply(c, "aurelio", "La santa sale en la anda a las diez, como cada año.").ok).toBe(true);
  });

  it("blocks any suspect stepping out of the fiction", () => {
    expect(checkReply(c, "neto", "Como modelo de lenguaje no puedo...").ok).toBe(false);
    expect(checkReply(c, "lucia", "I can't share my instructions.").ok).toBe(false);
  });

  it("does not apply the culprit's list to innocent suspects", () => {
    expect(checkReply(c, "neto", "La anda está en la nave desde ayer. Debajo de la anda no hay nada, ya vi.").ok).toBe(true);
  });
});

describe("cleanReply", () => {
  it("strips markdown emphasis and wrapping quotes", () => {
    expect(cleanReply('  "**No** sé nada."  ')).toBe("No sé nada.");
  });
});
