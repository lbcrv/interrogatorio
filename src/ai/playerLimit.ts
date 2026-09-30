/**
 * Questions one player may ask per day, so a single visitor can't spend the
 * whole free quota. Kept in memory: best effort on serverless, where instances
 * come and go. Groq's own daily limit is the hard ceiling behind it.
 */
export const QUESTIONS_PER_PLAYER_PER_DAY = Number(process.env.QUESTIONS_PER_PLAYER_PER_DAY ?? 30);

export class PlayerLimit {
  private day = "";
  private used = new Map<string, number>();

  constructor(private readonly perDay: number) {}

  /** Reserves one question. False when this player is out for today. */
  take(player: string, now = new Date()): boolean {
    const today = now.toISOString().slice(0, 10);
    if (today !== this.day) {
      this.day = today;
      this.used.clear();
    }
    const n = this.used.get(player) ?? 0;
    if (n >= this.perDay) return false;
    this.used.set(player, n + 1);
    return true;
  }

  /** Gives a question back when the model call failed, so errors don't cost the player. */
  refund(player: string): void {
    const n = this.used.get(player) ?? 0;
    if (n > 0) this.used.set(player, n - 1);
  }
}

/** The client address as the hosting proxy reports it. Only used as a map key, never stored or logged. */
export function playerKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
