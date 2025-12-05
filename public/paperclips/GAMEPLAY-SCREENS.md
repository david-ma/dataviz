# Universal Paperclips – Screen Appearance Checklist

Goal: When playing from a fresh start, verify that HAL screens appear/disappear in the right phases with the right unlocks, and retire business-era panels when Phase 2 (space) begins and HypnoDrones trigger.

## Phase 1 (Business)
- Expected: Phase Indicator (BIZ), Production Monitor, Market Dynamics, Stock/Investment panels (if enabled), Numeric Matrix (trust/processors/memory/ops/creativity), Strategic Modeling (after yomi), Quantum Computing (after qChips active).
- Entry criteria: Game start; trust unlocks; marketing unlocks; projects for strategy/quantum.
- Disappear/Hide: None yet.
- Checks:
  - Panels only render when their underlying globals exist/unlock.
  - Values update without recreating SVG roots.

## Transition to Phase 2 (Space/Manufacturing)
- Trigger: Nanoscale wire → drone projects; harvester/wire drones available; humanFlag/project35 progression toward HypnoDrones.
- Expected changes:
  - Money-centric panels can hide or deprioritize (Market Dynamics/Stock/Investment) once Phase 2 is dominant.
  - Phase Indicator switches to MFG/SPACE label.
  - Drone Operations screen appears when harvesterLevel or wireDroneLevel > 0 (or DEV_MODE).
  - Drone Globe screen appears in sync with drone ops (or DEV_MODE).
- Checks:
  - Business panels do not keep reappearing after being hidden once Phase 2 is primary.
  - Drone panels initialize once and update with changing counts.

## HypnoDrones Event
- Trigger: humanFlag === 0 or project35.flag === 1.
- Expected:
  - HypnoDrones screen shows (full overlay in prod; normal size in dev).
  - Other panels can stay but should not obscure the overlay in prod mode.
- Checks:
  - Hypno overlay hides when flags reset; doesn’t consume pointer events in prod.

## QA Runbook (fresh save)
1) Start new game, confirm only business panels are absent until unlocks.
2) Buy marketing/trust: Phase Indicator (BIZ) shows; Numeric Matrix appears when trust>0; Market Dynamics after marketing>0; Strategic Modeling after yomi>0; Quantum after qChips active.
3) Advance to drones: build first harvester/wire drone → Drone Operations and Drone Globe appear; money panels may be hidden.
4) Trigger HypnoDrones: project35.flag === 1 or humanFlag === 0 → Hypno overlay appears; verify other screens do not cover it.
5) Regression: Toggle DEV_MODE to force screens on/off and ensure hide/show logic is stable (no duplicate SVG roots).

## Notes
- Back-side culling and spin/drag behaviors apply to Drone Globe; verify visibility updates on rotate/drag.
- Color compliance: Use SCREEN-COLORS palette; avoid neon outside investment P/L.
- Reference docs: `STATUS.md` (milestones), `implementation-plan.md` (roadmap), `HAL-SCREENS-REFERENCE.md` (patterns), `SCREEN-COLORS.md` (palette), `kiro-notes.md` (links/resources).

