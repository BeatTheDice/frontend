import { reactive, readonly } from 'vue';
import type { RunStartResponse } from '../api/types';

const ACTIVE_RUN_STORAGE_KEY = 'beat-the-dice.active-run';
const PENDING_SCORE_STORAGE_KEY = 'beat-the-dice.pending-score';

export interface RunScoreMetrics {
    completedLevels: number;
    currentEnemyRemainingHp: number;
}

export interface ActiveRunRecord {
    runId: string;
    claimToken: string;
    startedAt: string;
    startedAtMs: number;
    claimed: boolean;
    submitted: boolean;
}

export interface PendingScoreRecord extends RunScoreMetrics {
    runId: string;
    claimToken: string;
    durationMs: number;
    createdAt: string;
}

interface RunState {
    activeRun: ActiveRunRecord | null;
    pendingScore: PendingScoreRecord | null;
    isStartingRun: boolean;
    isClaimingRun: boolean;
    isSubmittingScore: boolean;
}

const loadJson = <T>(storageKey: string): T | null => {
    const rawValue = globalThis.localStorage.getItem(storageKey);
    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue) as T;
    } catch {
        globalThis.localStorage.removeItem(storageKey);
        return null;
    }
};

const persistJson = (storageKey: string, value: unknown) => {
    if (value === null) {
        globalThis.localStorage.removeItem(storageKey);
        return;
    }

    globalThis.localStorage.setItem(storageKey, JSON.stringify(value));
};

const state = reactive<RunState>({
    activeRun: loadJson<ActiveRunRecord>(ACTIVE_RUN_STORAGE_KEY),
    pendingScore: loadJson<PendingScoreRecord>(PENDING_SCORE_STORAGE_KEY),
    isStartingRun: false,
    isClaimingRun: false,
    isSubmittingScore: false
});

const setActiveRun = (response: RunStartResponse) => {
    const startedAtMs = Number.isFinite(Date.parse(response.started_at))
        ? Date.parse(response.started_at)
        : Date.now();

    state.activeRun = {
        runId: response.run_id,
        claimToken: response.claim_token,
        startedAt: response.started_at,
        startedAtMs,
        claimed: false,
        submitted: false
    };

    persistJson(ACTIVE_RUN_STORAGE_KEY, state.activeRun);
    return state.activeRun;
};

const clearActiveRun = () => {
    state.activeRun = null;
    persistJson(ACTIVE_RUN_STORAGE_KEY, null);
};

const markActiveRunClaimed = () => {
    if (!state.activeRun) {
        return;
    }

    state.activeRun.claimed = true;
    persistJson(ACTIVE_RUN_STORAGE_KEY, state.activeRun);
};

const markActiveRunSubmitted = () => {
    if (!state.activeRun) {
        return;
    }

    state.activeRun.submitted = true;
    persistJson(ACTIVE_RUN_STORAGE_KEY, state.activeRun);
};

const getActiveRunDurationMs = (endedAtMs = Date.now()) => {
    if (!state.activeRun) {
        return 0;
    }

    return Math.max(1, endedAtMs - state.activeRun.startedAtMs);
};

const moveActiveRunToPendingScore = (metrics: RunScoreMetrics, endedAtMs = Date.now()) => {
    if (!state.activeRun) {
        return null;
    }

    state.pendingScore = {
        runId: state.activeRun.runId,
        claimToken: state.activeRun.claimToken,
        completedLevels: metrics.completedLevels,
        currentEnemyRemainingHp: metrics.currentEnemyRemainingHp,
        durationMs: getActiveRunDurationMs(endedAtMs),
        createdAt: new Date(endedAtMs).toISOString()
    };

    persistJson(PENDING_SCORE_STORAGE_KEY, state.pendingScore);
    clearActiveRun();
    return state.pendingScore;
};

const clearPendingScore = () => {
    state.pendingScore = null;
    persistJson(PENDING_SCORE_STORAGE_KEY, null);
};

export const runStore = readonly(state);

export const useRunState = () => ({
    runState: runStore,
    setActiveRun,
    clearActiveRun,
    markActiveRunClaimed,
    markActiveRunSubmitted,
    moveActiveRunToPendingScore,
    clearPendingScore,
    getActiveRunDurationMs
});
