## NameBlame Mode Flow (Simplified Sequential Version)

This document describes the updated, simplified flow for NameBlame mode where each question is shown only once and a single blame leads directly to a reveal phase before moving to the next question.

### High-Level Steps
1. User enables NameBlame mode on the intro screen.
2. User creates players (minimum 3, e.g. p1, p2, p3).
3. User starts the game → loading screen with stacking card animation displays while questions are prepared.
4. Game randomly picks (or derives) the starting player for the first question.
5. Active player (e.g. p1) sees Question Q1 and selects another player to blame (e.g. p2). Self‑blame is disallowed.
6. Immediately after selection, the UI transitions into the reveal phase (formerly called "blamed"). Player selection buttons disappear. A message shows: "p1 blamed p2 for: <question text>".
7. Device is handed to the blamed player (p2). They read the question aloud and may optionally answer/respond socially.
8. Blamed player taps the single button ("Next Blame") – this advances the game to the next question (Q2) and sets the active player to the blamed player (p2).
9. The new active player (p2) now repeats the process: sees Q2, selects a new target (e.g. p3) → reveal → Next Blame → Q3 with p3 active, etc.

### Key Principles
- Each question is shown exactly once.
- Exactly one blame action per question (no multi-round accumulation on the same question).
- Turn order becomes a chain: the blamed player becomes the next active player.
- No player may blame themselves.
- A player cannot be blamed twice for the same question (enforced implicitly by one-blame-per-question rule).
- Logging should capture each blame with: questionId, question text, blamer, target, sequence index, timestamp.

### State Model
We retain two phases:
- `selecting` – active player choosing a target.
- `reveal` (renamed from prior `blamed`) – shows who was blamed; only one continuation button is visible.

### Transition Diagram
selecting --(blame chosen)--> reveal --(Next Blame)--> selecting (next question, new active player)

### Turn Advancement Logic
After a blame:
1. Set phase to `reveal`.
2. Record blame event in log.
3. Store the "next active player" = blamed player.
On "Next Blame":
1. Advance question index.
2. Set current player = stored next active player.
3. Reset transient blame state; phase = `selecting` for new question.

### Logging Structure (suggested)
```ts
interface BlameLogEntry {
  type: 'blame';
  questionId: string;
  question: string;
  from: string; // blamer
  to: string;   // blamed
  sequence: number; // starts at 1 and increments per question
  timestamp: string; // ISO
}
```

### UI Copy Additions
Intro / Info Modal (NameBlame explanation):
> In NameBlame mode each question is shown once. The active player selects who to blame. The blamed player reads the question aloud and then becomes the next active player for the next question.

Reveal Phase Panel:
> <Blamer> blamed <Target> for: "<Question>". Hand the device to <Target> so they can read it aloud. When done, tap Next Blame to continue.

### Open Enhancements (Future)
- Analytics summary of blame chain.
- Option to randomize next active player instead of blamed player.
- Per-player blame count visualization mid-game.

---
Document version: 2025-09-07