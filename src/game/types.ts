export type Lang = "es" | "en";

/** Text shown to the player, in both languages. */
export type Localized = Record<Lang, string>;

export interface Evidence {
  id: string;
  title: Localized;
  body: Localized;
  /** In the dossier from the start; otherwise unlocked by a rule. */
  initial: boolean;
}

export interface Suspect {
  id: string;
  name: string;
  age: number;
  role: Localized;
  /** Public dossier card the player reads before questioning. */
  summary: Localized;
  /**
   * Character sheet sent to the model, written in Spanish. Contains only what
   * this person knows. Innocent suspects never see the solution.
   */
  sheet: string;
  /** How they talk. Also Spanish; the model adapts it when playing in English. */
  voice: string;
}

/** Showing `evidenceId` to `suspectId` forces an admission and may unlock new evidence. */
export interface UnlockRule {
  id: string;
  suspectId: string;
  evidenceId: string;
  /** What the suspect now concedes, injected into their instructions. Spanish. */
  admission: string;
  unlocks?: string;
}

export type Verdict = "solved" | "weak" | "wrong";

export interface CaseFile {
  id: string;
  title: Localized;
  briefing: Localized;
  questionBudget: number;
  /** Shared by every suspect's instructions: place, date, public facts. Spanish. */
  world: string;
  suspects: Suspect[];
  evidence: Evidence[];
  rules: UnlockRule[];
  solution: {
    culpritId: string;
    /** Each group is one pillar of the case (means, motive, opportunity). The accusation must cite one item from every group. */
    proof: string[][];
    maxCitations: number;
  };
  epilogues: Record<Verdict, Localized>;
  /**
   * Phrases that must never appear in a given suspect's reply, whatever the
   * player tries. Checked in code after generation.
   */
  forbidden: Record<string, RegExp[]>;
}

export type TurnKind = "ask" | "present";

export interface TurnInput {
  suspectId: string;
  kind: TurnKind;
  evidenceId?: string;
  text: string;
}

export interface Turn extends TurnInput {
  reply: string;
}

export interface GameState {
  questionsUsed: number;
  unlocked: string[];
  /** Ids of rules that have fired. */
  admissions: string[];
}
