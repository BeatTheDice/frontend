export const GAME_EVENTS = {
    runStartRequested: 'backend:run-start-requested',
    runRolled: 'backend:run-rolled',
    runCompleted: 'backend:run-completed'
} as const;

export type RunEndReason = 'game-over' | 'player-exit' | 'victory';

export interface GameRunCompletedEvent {
    completedLevels: number;
    currentEnemyRemainingHp: number;
    reason: RunEndReason;
    endedAtMs: number;
}
