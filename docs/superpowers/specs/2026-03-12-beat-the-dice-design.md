# Beat the Dice — Game Design Spec

**Date:** 2026-03-12  
**Status:** Approved by user

---

## Goal

Build a round-based browser dice game with risk/reward decision-making. The player collects dice over multiple levels, fights enemies and bosses, and must adapt their strategy to boss modifiers that counter their build.

---

## Tech Stack

- **Phaser 3** (Matter.js physics) — dice animation & physics rendering
- **Vue 3 + TypeScript** — all UI overlays (HUD, reward screen, game over)
- **Vite** — bundler
- **EventBus** — Phaser ↔ Vue communication (already in template)
- **No backend** — browser-only, no persistence between sessions

---

## Architecture

### Layers

```
Vue (UI Layer)
  ├── HUD.vue              — rolls remaining, current sum, level target / enemy HP bar
  ├── DiceCollection.vue   — displays player's current dice set with type + color
  ├── RewardScreen.vue     — overlay: 3 random dice to pick from after each level
  ├── BossIntro.vue        — overlay: shows boss rule before boss level starts
  └── GameOverScreen.vue   — victory / defeat, run stats, restart button

EventBus (Phaser ↔ Vue communication)

Phaser (Render / Physics Layer)
  ├── scenes/GameScene.ts  — Matter.js physics dice rolls, animations
  └── scenes/BossScene.ts  — boss variant with modifier applied

TypeScript Game Logic (pure TS, no framework)
  ├── dice/DiceRegistry.ts — all dice type definitions as data
  ├── dice/DiceRoller.ts   — rolling + boss modifier application
  ├── RunState.ts          — live game state (dice, level, HP, progress)
  └── LevelConfig.ts       — all level definitions (target, enemy, boss rule)
```

---

## File Structure

```
src/
  game/
    scenes/
      Boot.ts              (existing)
      Preloader.ts         (existing)
      MainMenu.ts          (existing)
      GameScene.ts         (replaces Game.ts — physics dice roll scene, handles normal + boss)
      GameOver.ts          (existing — retired as Phaser scene, replaced by GameOverScreen.vue)
    dice/
      DiceRegistry.ts      (all DiceDefinition objects)
      DiceRoller.ts        (roll logic + boss modifier application)
    RunState.ts            (singleton RunState, updated each roll)
    LevelConfig.ts         (array of LevelConfig objects)
    EventBus.ts            (existing)
    main.ts                (existing, add Matter physics)
  components/
    HUD.vue
    DiceCollection.vue
    RewardScreen.vue
    BossIntro.vue
    GameOverScreen.vue
  App.vue                  (orchestrates overlay visibility via gameState ref)
  main.ts                  (existing)
```

> Note: No separate `BossScene.ts` — boss levels run in `GameScene.ts` with `activeBossModifier` set in `RunState`. This avoids duplicating scene logic.

---

## Core Data Models

### DiceDefinition

```ts
interface DiceDefinition {
  id: string
  name: string
  color: string           // hex, used for Phaser rendering
  faces: number[]         // e.g. [1,2,3,4,5,6]
  weights?: number[]      // optional probability weights per face
  description: string
  rarity: 'common' | 'uncommon' | 'rare'
}
```

**Adding a new die = adding one object to DiceRegistry.ts. No other code changes needed.**

#### Initial dice types

| ID | Name | Faces | Notes |
|---|---|---|---|
| `standard` | Standardwürfel | [1,2,3,4,5,6] | Balanced, avg 3.5 |
| `risk` | Risikowürfel | [0,1,2,3,4,5,6,7,8,9,10] | High variance, avg 5 |
| `loaded` | Gezinkter Würfel | [3,4,4,5,5,6] | No low values, stable |

---

### BossModifier

```ts
interface BossModifier {
  id: string
  description: string
  apply: (rolls: number[], dice: DiceDefinition[]) => number[]
}
```

#### Initial boss modifiers

| ID | Description | Effect |
|---|---|---|
| `no-highest` | Höchste Zahl zählt nicht | Removes max value from rolls |
| `even-only` | Nur gerade Zahlen zählen | Odd rolls → 0 |
| `ones-penalty` | Jede 1 zieht 2 Punkte ab | rolls.map(v => v === 1 ? -2 : v) |
| `no-risk` | Risikowürfel gesperrt | Risk dice faces → 0 |
| `pairs-only` | Nur Paare geben Schaden | Non-paired values → 0 |

---

### LevelConfig

```ts
interface LevelConfig {
  id: number
  type: 'score' | 'enemy'
  target: number           // points to reach or enemy HP
  rollsAllowed: number     // default: 20
  isBoss: boolean
  bossModifier?: BossModifier
  enemyName?: string
}
```

## Level Progression (3 Acts of 5 Levels)

| Level | Act | Type | Target | Boss Rule |
|---|---|---|---|---|
| 1 | 1 | score | 120 | — |
| 2 | 1 | enemy | 100 HP | — |
| 3 | 1 | score | 150 | — |
| 4 | 1 | enemy | 130 HP | — |
| 5 (Boss) | 1 | enemy | 200 HP | no-highest |
| 6 | 2 | score | 180 | — |
| 7 | 2 | enemy | 160 HP | — |
| 8 | 2 | score | 200 | — |
| 9 | 2 | enemy | 180 HP | — |
| 10 (Boss) | 2 | enemy | 350 HP | even-only |
| 11 | 3 | score | 220 | — |
| 12 | 3 | enemy | 200 HP | — |
| 13 | 3 | score | 250 | — |
| 14 | 3 | enemy | 230 HP | — |
| 15 (Boss) | 3 | enemy | 500 HP | pairs-only |
| 16+ | Endless | enemy | prev+50/level | random modifier every 5 |

Victory is only reachable by clearing level 15. In endless mode there is no victory — the run continues until the player fails a level.

---

### RunState

```ts
interface RunState {
  playerDice: DiceDefinition[]
  currentLevelId: number
  rollsRemaining: number
  currentProgress: number       // accumulated toward target: score dealt or damage dealt (always counts UP)
  activeBossModifier?: BossModifier
}
```

**Initialization:** `playerDice` starts as 4 copies of the `standard` die (faces: `[1,2,3,4,5,6]`). At the start of each level, `rollsRemaining` resets to `LevelConfig.rollsAllowed` (default: `20`) and `currentProgress` resets to `0`.

**Dice Growth:** The reward after each level adds exactly **1 new die** to the player's set. Level 1 → 4 dice, Level 2 → 5 dice, Level 3 → 6 dice, and so on. The reward screen shows 3 candidates; the player picks one; that one is added.

Lives as a singleton inside Phaser. Vue reads it only via EventBus events.

---

## EventBus Interface

### Phaser → Vue

```ts
EventBus.emit('roll-result', {
  raw: number[],            // dice values before modifier
  modified: number[],       // after boss modifier (same as raw if no boss)
  total: number,            // sum of modified values
  rollsRemaining: number,
  currentProgress: number,  // accumulated score/damage so far (counts UP toward target)
  target: number,           // level target (for progress bar calculation)
  levelType: 'score' | 'enemy'   // tells HUD whether to show score or HP bar
})

EventBus.emit('level-complete', {
  levelId: number,
  isBoss: boolean
})

EventBus.emit('level-failed')

EventBus.emit('boss-activated', {
  modifierDescription: string   // human-readable rule text for BossIntro overlay
})

EventBus.emit('dice-collection-updated', {
  dice: DiceDefinition[]        // full current set, triggers DiceCollection.vue re-render
})

EventBus.emit('game-over', {
  victory: boolean,
  stats: {
    levelsCleared: number,
    totalProgress: number,      // total accumulated score/damage across all levels
    finalDice: DiceDefinition[]
  }
})
```

### Vue → Phaser

```ts
EventBus.emit('start-roll')
EventBus.emit('reward-chosen', { diceId: string })
EventBus.emit('boss-intro-dismissed')    // player dismissed BossIntro overlay → Phaser starts rolling
EventBus.emit('start-next-level')
EventBus.emit('restart-run')             // Phaser must: clear physics scene, reset RunState to initial
                                         // (4 standard dice, level 1, progress 0), transition to GameScene
```

---

## Game Flow (State Machine)

```
MAIN_MENU
  → [start-roll emitted by Vue]
  → ROLLING          — Phaser animates dice with Matter.js physics
  → ROLL_RESULT      — result displayed 1-2s in HUD
  → ROLLING          — repeat until rolls exhausted or target reached
  → LEVEL_FAILED     — if rolls = 0 and target not met
      → GameScene emits 'level-failed' → Vue shows GameOverScreen (defeat)
      → [restart-run] → GameScene handles restart: physics clear, RunState reset, level 1
  → LEVEL_COMPLETE   — if target reached (even on the last roll)
      → REWARD_SCREEN — 3 random dice shown (Vue overlay)
      → [reward-chosen] → dice added to RunState → 'dice-collection-updated' emitted
      → [start-next-level] → next LevelConfig loaded
      → if isBoss && levelId === 15 → GameScene emits 'game-over' (victory) → Vue shows GameOverScreen
      → if isBoss && levelId !== 15 → treat as level-complete, continue
      → else → ROLLING
  → BOSS level:
      → GameScene emits 'boss-activated' before first roll
      → Vue shows BossIntro overlay
      → [boss-intro-dismissed] → Phaser starts rolling
      → modifier applied to every roll result
      → otherwise same flow as normal level
  → GAME_OVER (defeat or victory):
      → GameScene remains active (does not transition to another scene)
      → GameScene stops accepting 'start-roll' events
      → GameScene listens for 'restart-run' to reset and restart
```

---

## Reward System

- After every completed level (including bosses), show 3 randomly selected `DiceDefinition` objects from the registry
- Prefer dice not yet owned; if fewer than 3 unowned dice remain in the registry, fill remaining slots with dice the player already owns (shown with a "duplicate" badge)
- Player clicks one → `reward-chosen` event → die added to `RunState.playerDice`; `dice-collection-updated` emitted
- No skip option (every level makes the player stronger)

---

## Physics Dice Rendering (Phaser / Matter.js)

- Each die in the player's set is a Matter.js rectangle body
- On roll: bodies are given random velocity + angular momentum and dropped onto the scene floor
- After settling (~1s), each die displays its face value as a centered text
- Die color matches `DiceDefinition.color` → player can visually identify their dice set
- Boss-modified values that are nullified (→ 0) are rendered in grey; values that are removed entirely are not rendered. No strikethrough text (not natively supported in Phaser 3 Text objects)

## DiceRoller Behavior

- `DiceRoller.roll(dice: DiceDefinition[])` returns one random face value per die
- Face selection: if `weights` is defined, use weighted random (inverse transform sampling); otherwise uniform random
- `DiceRoller.applyModifier(rolls, dice, modifier)` applies the `BossModifier.apply` function and returns modified array
- **Pairs-only safeguard:** if the active modifier is `pairs-only` and the player has fewer than 2 dice, the modifier is automatically skipped (treated as no modifier) to prevent an unwinnable state

---

## Endless Mode

- After level 15 (Boss 3 defeated), instead of Game Over screen: "Endless Mode activated!"
- Level configs are generated procedurally: target += 50 vs previous level, boss every 5 levels with a random modifier
- HUD shows "Wave N" (not "Level N") for endless levels
- No victory condition in endless mode — run ends only on defeat

---

## Out of Scope (v1)

- Backend / leaderboard
- Sound effects / music
- Dice upgrade system (only new dice as rewards, no stat upgrades in v1)
- Mobile / touch support
- Localization
