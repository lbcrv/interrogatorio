import { describe, expect, it } from "vitest";
import { PlayerLimit, playerKey } from "./playerLimit";

const day1 = new Date("2026-09-30T12:00:00Z");
const day2 = new Date("2026-10-01T00:01:00Z");

describe("PlayerLimit", () => {
  it("stops a player at the daily cap without affecting others", () => {
    const limit = new PlayerLimit(2);
    expect(limit.take("a", day1)).toBe(true);
    expect(limit.take("a", day1)).toBe(true);
    expect(limit.take("a", day1)).toBe(false);
    expect(limit.take("b", day1)).toBe(true);
  });

  it("starts over the next day", () => {
    const limit = new PlayerLimit(1);
    expect(limit.take("a", day1)).toBe(true);
    expect(limit.take("a", day1)).toBe(false);
    expect(limit.take("a", day2)).toBe(true);
  });

  it("gives back a question the model failed to answer", () => {
    const limit = new PlayerLimit(1);
    expect(limit.take("a", day1)).toBe(true);
    limit.refund("a");
    expect(limit.take("a", day1)).toBe(true);
  });
});

describe("playerKey", () => {
  it("uses the first forwarded address", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } });
    expect(playerKey(req)).toBe("203.0.113.7");
  });

  it("falls back when there is no proxy header", () => {
    expect(playerKey(new Request("http://x"))).toBe("local");
  });
});
