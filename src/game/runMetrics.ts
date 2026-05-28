import type { LevelEngine } from './classes/LevelEngine';
import type { GameRunCompletedEvent, RunEndReason } from './backend-events';

const createRunCompletedEvent = (
    levelEngine: LevelEngine,
    reason: RunEndReason,
    completedLevels: number,
    currentEnemyRemainingHp: number
): GameRunCompletedEvent => ({
    completedLevels: Math.max(0, completedLevels),
    currentEnemyRemainingHp: Math.max(0, currentEnemyRemainingHp),
    reason,
    endedAtMs: Date.now()
});

export const createInProgressRunSnapshot = (
    levelEngine: LevelEngine,
    reason: Exclude<RunEndReason, 'victory'> = 'player-exit'
): GameRunCompletedEvent => createRunCompletedEvent(
    levelEngine,
    reason,
    Math.max(levelEngine.currentLevel - 1, 0),
    levelEngine.getCurrentEnemyHitPoints()
);

export const createVictoryRunSnapshot = (levelEngine: LevelEngine): GameRunCompletedEvent => createRunCompletedEvent(
    levelEngine,
    'victory',
    levelEngine.currentLevel,
    0
);
