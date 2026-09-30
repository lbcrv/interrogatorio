@AGENTS.md

## Project rules

- **No AI slop.** No emojis anywhere (UI, copy, README, commits). No purple gradients, glassmorphism, sparkle icons or "AI-powered" badges. Copy is plain and concrete. The look is a physical case file on a desk: walnut desk, manila folder with suspect tabs, papers that look like what they are (typed report, printed program, ruled statement, contact sheet, phone printout), index cards with code-drawn fingerprints, ink, one stamp red. Source Serif 4 + IBM Plex Mono, plus Covered By Your Grace only for short marker notes in red. No AI portraits.
- **The model plays characters; code runs the game.** Case truth, unlock rules, question budget and the verdict live in `src/content/` and `src/game/engine.ts`. Never move game logic into prompts.
- **Need-to-know prompts.** A suspect's `sheet` holds only what that person knows. Only the culprit's sheet contains the solution.
- **Costs $0.** Groq free tier only (`GROQ_API_KEY` in `.env.local`, never in chat or git). Rate limits are per Groq organization and shared with the owner's other projects, so keep prompts lean.
- **Bilingual.** Every player-facing string exists in `es` and `en`. Character sheets are Spanish; the model replies in the player's language.
- Case content is Spanish-first and set in a fictional Mesoamerican town. Keep regional detail (castillo, alfombras de aserrín, tamales) specific, not generic.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
