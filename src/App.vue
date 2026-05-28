<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import PhaserGame from './PhaserGame.vue';
import { apiClient, isApiError } from './api/client';
import type {
    AuthCredentials,
    BestScoreData,
    LeaderboardItem,
    PersonalScoreItem,
    ScoreSubmitRequest
} from './api/types';
import { EventBus } from './game/EventBus';
import { GAME_EVENTS, type GameRunCompletedEvent } from './game/backend-events';
import { useAuthState } from './state/auth';
import { useRunState, type RunScoreMetrics } from './state/run';
import { formatDateTime, formatDuration } from './utils/formatters';

type AuthMode = 'login' | 'register';

interface BackendStatus {
    checking: boolean;
    available: boolean;
    error: string;
}

interface LeaderboardState {
    loading: boolean;
    error: string;
    page: number;
    pageSize: number;
    total: number;
    items: LeaderboardItem[];
}

interface PersonalScoresState {
    loading: boolean;
    error: string;
    page: number;
    pageSize: number;
    items: PersonalScoreItem[];
}

interface BestScoreState {
    loading: boolean;
    error: string;
    data: BestScoreData | null;
}

const { authState, login, registerAndLogin, logout } = useAuthState();
const {
    runState,
    clearActiveRun,
    clearPendingScore,
    getActiveRunDurationMs,
    markActiveRunClaimed,
    markActiveRunSubmitted,
    moveActiveRunToPendingScore,
    setActiveRun
} = useRunState();

const authMode = ref<AuthMode>('login');
const credentials = reactive<AuthCredentials>({
    username: '',
    password: ''
});

const authMessage = ref('');
const feedbackMessage = ref('');

const backendStatus = reactive<BackendStatus>({
    checking: false,
    available: false,
    error: ''
});

const integrationState = reactive({
    startingRun: false,
    syncing: false,
    submitting: false
});

const leaderboard = reactive<LeaderboardState>({
    loading: false,
    error: '',
    page: 1,
    pageSize: 10,
    total: 0,
    items: []
});

const myScores = reactive<PersonalScoresState>({
    loading: false,
    error: '',
    page: 1,
    pageSize: 6,
    items: []
});

const bestScore = reactive<BestScoreState>({
    loading: false,
    error: '',
    data: null
});

const backendBadgeLabel = computed(() => {
    if (backendStatus.checking) {
        return 'Pruefe Backend';
    }

    return backendStatus.available ? 'Backend online' : 'Backend offline';
});

const activeRunShortId = computed(() => {
    if (!runState.activeRun) {
        return 'Kein aktiver Run';
    }

    return `${runState.activeRun.runId.slice(0, 8)}...`;
});

const activeRunStatus = computed(() => {
    if (!runState.activeRun) {
        return 'kein Run';
    }

    if (runState.activeRun.submitted) {
        return 'gespeichert';
    }

    if (runState.activeRun.claimed) {
        return 'geclaimt';
    }

    return authState.isAuthenticated ? 'offen' : 'anonym';
});

const pendingScoreSummary = computed(() => {
    if (!runState.pendingScore) {
        return null;
    }

    return {
        completedLevels: runState.pendingScore.completedLevels,
        currentEnemyRemainingHp: runState.pendingScore.currentEnemyRemainingHp,
        duration: formatDuration(runState.pendingScore.durationMs),
        createdAt: formatDateTime(runState.pendingScore.createdAt)
    };
});

const canLoadPreviousLeaderboardPage = computed(() => leaderboard.page > 1);
const canLoadNextLeaderboardPage = computed(() => leaderboard.page * leaderboard.pageSize < leaderboard.total);
const canLoadPreviousScorePage = computed(() => myScores.page > 1);
const canLoadNextScorePage = computed(() => myScores.items.length === myScores.pageSize);

const getErrorMessage = (
    error: unknown,
    fallback: string,
    overrides: Partial<Record<number, string>> = {}
) => {
    if (isApiError(error)) {
        if (error.status && overrides[error.status]) {
            return overrides[error.status] as string;
        }

        return error.message || fallback;
    }

    return fallback;
};

const resetPrivateViews = () => {
    myScores.loading = false;
    myScores.error = '';
    myScores.page = 1;
    myScores.items = [];
    bestScore.loading = false;
    bestScore.error = '';
    bestScore.data = null;
};

const checkBackendHealth = async () => {
    backendStatus.checking = true;
    backendStatus.error = '';

    try {
        await apiClient.health();
        backendStatus.available = true;
    } catch (error) {
        backendStatus.available = false;
        backendStatus.error = getErrorMessage(error, 'Backend nicht erreichbar.');
    } finally {
        backendStatus.checking = false;
    }
};

const loadLeaderboard = async (page = leaderboard.page) => {
    leaderboard.loading = true;
    leaderboard.error = '';

    try {
        const response = await apiClient.getLeaderboard({
            page,
            page_size: leaderboard.pageSize
        });

        leaderboard.page = response.page;
        leaderboard.total = response.total;
        leaderboard.items = response.items;
    } catch (error) {
        leaderboard.error = getErrorMessage(error, 'Leaderboard konnte nicht geladen werden.');
    } finally {
        leaderboard.loading = false;
    }
};

const loadMyScores = async (page = myScores.page) => {
    if (!authState.isAuthenticated) {
        resetPrivateViews();
        return;
    }

    myScores.loading = true;
    myScores.error = '';

    try {
        const response = await apiClient.getMyScores({
            page,
            page_size: myScores.pageSize
        });

        myScores.page = response.page;
        myScores.items = response.items;
    } catch (error) {
        myScores.error = getErrorMessage(error, 'Persoenliche Scores konnten nicht geladen werden.', {
            401: 'Bitte erneut einloggen.'
        });
    } finally {
        myScores.loading = false;
    }
};

const loadBestScore = async () => {
    if (!authState.isAuthenticated) {
        bestScore.data = null;
        bestScore.error = '';
        return;
    }

    bestScore.loading = true;
    bestScore.error = '';

    try {
        const response = await apiClient.getMyBestScore();
        bestScore.data = response.best_score;
    } catch (error) {
        if (isApiError(error) && error.status === 404) {
            bestScore.data = null;
            bestScore.error = '';
        } else {
            bestScore.data = null;
            bestScore.error = getErrorMessage(error, 'Bestsore konnte nicht geladen werden.', {
                401: 'Bitte erneut einloggen.'
            });
        }
    } finally {
        bestScore.loading = false;
    }
};

const refreshPrivateViews = async () => {
    if (!authState.isAuthenticated) {
        resetPrivateViews();
        return;
    }

    await Promise.all([
        loadMyScores(myScores.page),
        loadBestScore()
    ]);
};

const tryClaimActiveRun = async ({ showSuccessMessage = false } = {}) => {
    if (!authState.isAuthenticated || !runState.activeRun) {
        return false;
    }

    try {
        const response = await apiClient.claimRun(runState.activeRun.runId, {
            claim_token: runState.activeRun.claimToken
        });

        if (response.claimed) {
            markActiveRunClaimed();

            if (showSuccessMessage) {
                feedbackMessage.value = 'Run wurde deinem Account zugeordnet.';
            }
        }

        return response.claimed;
    } catch (error) {
        if (showSuccessMessage) {
            feedbackMessage.value = getErrorMessage(error, 'Run konnte nicht geclaimt werden.', {
                401: 'Bitte erneut einloggen.'
            });
        }

        return false;
    }
};

const submitStoredPendingScore = async () => {
    if (!authState.isAuthenticated || !runState.pendingScore) {
        return false;
    }

    integrationState.syncing = true;

    try {
        const response = await apiClient.submitScore(runState.pendingScore.runId, {
            claim_token: runState.pendingScore.claimToken,
            completed_levels: runState.pendingScore.completedLevels,
            current_enemy_remaining_hp: runState.pendingScore.currentEnemyRemainingHp,
            duration_ms: runState.pendingScore.durationMs
        });

        clearPendingScore();
        feedbackMessage.value = response.is_personal_best
            ? 'Score gespeichert. Neuer Personal Best!'
            : 'Score gespeichert.';

        await Promise.all([
            loadLeaderboard(leaderboard.page),
            refreshPrivateViews()
        ]);

        return true;
    } catch (error) {
        feedbackMessage.value = getErrorMessage(error, 'Score konnte nicht gespeichert werden.', {
            401: 'Bitte erneut einloggen.',
            404: 'Run wurde nicht gefunden.'
        });

        return false;
    } finally {
        integrationState.syncing = false;
    }
};

const startRun = async () => {
    if (integrationState.startingRun) {
        return;
    }

    integrationState.startingRun = true;

    try {
        const response = await apiClient.startRun();
        setActiveRun(response);

        if (authState.isAuthenticated) {
            await tryClaimActiveRun();
        }
    } catch (error) {
        clearActiveRun();
        feedbackMessage.value = getErrorMessage(error, 'Run konnte nicht gestartet werden.');
    } finally {
        integrationState.startingRun = false;
    }
};

const buildScorePayload = (metrics: RunScoreMetrics, endedAtMs: number): ScoreSubmitRequest | null => {
    if (!runState.activeRun) {
        return null;
    }

    return {
        claim_token: runState.activeRun.claimToken,
        completed_levels: metrics.completedLevels,
        current_enemy_remaining_hp: metrics.currentEnemyRemainingHp,
        duration_ms: getActiveRunDurationMs(endedAtMs)
    };
};

const submitCurrentRunScore = async (event: GameRunCompletedEvent) => {
    if (!runState.activeRun) {
        feedbackMessage.value = 'Dieser Run konnte nicht gespeichert werden, weil keine Run-Daten im Browser vorliegen.';
        return false;
    }

    const payload = buildScorePayload({
        completedLevels: event.completedLevels,
        currentEnemyRemainingHp: event.currentEnemyRemainingHp
    }, event.endedAtMs);

    if (!payload) {
        feedbackMessage.value = 'Score konnte nicht gespeichert werden.';
        return false;
    }

    if (!authState.isAuthenticated) {
        moveActiveRunToPendingScore({
            completedLevels: event.completedLevels,
            currentEnemyRemainingHp: event.currentEnemyRemainingHp
        }, event.endedAtMs);
        feedbackMessage.value = 'Einloggen oder registrieren, um Score zu speichern.';
        return false;
    }

    integrationState.submitting = true;

    try {
        if (!runState.activeRun.claimed) {
            await tryClaimActiveRun();
        }

        const response = await apiClient.submitScore(runState.activeRun.runId, payload);

        markActiveRunSubmitted();
        clearActiveRun();
        clearPendingScore();
        feedbackMessage.value = response.is_personal_best
            ? 'Score gespeichert. Neuer Personal Best!'
            : 'Score gespeichert.';

        await Promise.all([
            loadLeaderboard(leaderboard.page),
            refreshPrivateViews()
        ]);

        return true;
    } catch (error) {
        feedbackMessage.value = getErrorMessage(error, 'Score konnte nicht gespeichert werden.', {
            401: 'Bitte erneut einloggen.',
            404: 'Run wurde nicht gefunden.'
        });

        return false;
    } finally {
        integrationState.submitting = false;
    }
};

const syncAfterAuthentication = async () => {
    if (!authState.isAuthenticated) {
        return;
    }

    if (runState.pendingScore) {
        await submitStoredPendingScore();
        return;
    }

    if (runState.activeRun && !runState.activeRun.claimed) {
        await tryClaimActiveRun({ showSuccessMessage: true });
    }

    await Promise.all([
        loadLeaderboard(leaderboard.page),
        refreshPrivateViews()
    ]);
};

const submitAuthForm = async () => {
    authMessage.value = '';

    if (!credentials.username.length || !credentials.password.length) {
        authMessage.value = 'Bitte Username und Passwort eingeben.';
        return;
    }

    try {
        if (authMode.value === 'login') {
            await login({
                username: credentials.username,
                password: credentials.password
            });
            authMessage.value = 'Login erfolgreich.';
        } else {
            const registration = await registerAndLogin({
                username: credentials.username,
                password: credentials.password
            });
            authMessage.value = `Registrierung erfolgreich. Willkommen ${registration.username}.`;
        }

        credentials.password = '';
        await syncAfterAuthentication();
    } catch (error) {
        authMessage.value = getErrorMessage(
            error,
            authMode.value === 'login' ? 'Login fehlgeschlagen.' : 'Registrierung fehlgeschlagen.',
            {
                401: 'Bitte erneut einloggen.',
                409: 'Username ist bereits vergeben.'
            }
        );
    }
};

const handleLogout = () => {
    logout();
    resetPrivateViews();
    authMessage.value = '';
    feedbackMessage.value = 'Du bist ausgeloggt.';
};

const initialize = async () => {
    if (runState.pendingScore && !authState.isAuthenticated) {
        feedbackMessage.value = 'Einloggen oder registrieren, um Score zu speichern.';
    }

    await Promise.all([
        checkBackendHealth(),
        loadLeaderboard(leaderboard.page)
    ]);

    if (authState.isAuthenticated) {
        await syncAfterAuthentication();
    }
};

const handleRunStartRequested = () => {
    void startRun();
};

const handleRunCompleted = (event: GameRunCompletedEvent) => {
    void submitCurrentRunScore(event);
};

onMounted(() => {
    EventBus.on(GAME_EVENTS.runStartRequested, handleRunStartRequested);
    EventBus.on(GAME_EVENTS.runCompleted, handleRunCompleted);
    void initialize();
});

onUnmounted(() => {
    EventBus.off(GAME_EVENTS.runStartRequested, handleRunStartRequested);
    EventBus.off(GAME_EVENTS.runCompleted, handleRunCompleted);
});
</script>

<template>
    <div class="app-shell">
        <div class="game-stage">
            <PhaserGame />

            <div class="overlay-grid">
                <div class="hud-column">
                    <section class="panel hero-panel">
                        <div class="panel-topline">
                            <span class="eyebrow">Beat The Dice</span>
                            <span class="status-pill" :class="backendStatus.available ? 'online' : 'offline'">
                                {{ backendBadgeLabel }}
                            </span>
                        </div>

                        <h1>Backend verbunden</h1>
                        <p class="panel-copy">
                            Runs starten anonym. Zum Speichern, Claimen und fuer persoenliche Statistiken brauchst du einen Login.
                        </p>

                        <p v-if="backendStatus.error" class="message error-message">
                            {{ backendStatus.error }}
                        </p>
                        <p v-if="feedbackMessage" class="message info-message">
                            {{ feedbackMessage }}
                        </p>
                        <p v-if="authMessage" class="message success-message">
                            {{ authMessage }}
                        </p>

                        <div class="auth-tabs" v-if="!authState.isAuthenticated">
                            <button
                                class="tab-button"
                                :class="{ active: authMode === 'login' }"
                                type="button"
                                @click="authMode = 'login'"
                            >
                                Login
                            </button>
                            <button
                                class="tab-button"
                                :class="{ active: authMode === 'register' }"
                                type="button"
                                @click="authMode = 'register'"
                            >
                                Registrierung
                            </button>
                        </div>

                        <form v-if="!authState.isAuthenticated" class="auth-form" @submit.prevent="submitAuthForm">
                            <label>
                                <span>Username</span>
                                <input
                                    v-model="credentials.username"
                                    autocomplete="username"
                                    placeholder="z. B. DiceKnight"
                                    type="text"
                                >
                            </label>

                            <label>
                                <span>Passwort</span>
                                <input
                                    v-model="credentials.password"
                                    autocomplete="current-password"
                                    minlength="8"
                                    placeholder="Mindestens 8 Zeichen"
                                    type="password"
                                >
                            </label>

                            <button class="cta-button" :disabled="authState.isBusy || integrationState.syncing" type="submit">
                                {{ authMode === 'login' ? 'Einloggen' : 'Registrieren und einloggen' }}
                            </button>
                        </form>

                        <div v-else class="auth-summary">
                            <p>Geschuetzte Endpunkte verwenden deinen gespeicherten Access Token automatisch.</p>
                            <button class="secondary-button" type="button" @click="handleLogout">
                                Logout
                            </button>
                        </div>

                        <p class="security-note">
                            Prototyp-Hinweis: Das Access Token liegt in <strong>localStorage</strong>. In Production waeren
                            httpOnly-Cookies sicherer.
                        </p>
                    </section>

                    <section class="panel">
                        <div class="section-heading">
                            <span class="eyebrow">Run State</span>
                            <strong>{{ activeRunStatus }}</strong>
                        </div>

                        <div v-if="runState.activeRun" class="metric-grid">
                            <div>
                                <span class="metric-label">Run</span>
                                <strong>{{ activeRunShortId }}</strong>
                            </div>
                            <div>
                                <span class="metric-label">Gestartet</span>
                                <strong>{{ formatDateTime(runState.activeRun.startedAt) }}</strong>
                            </div>
                        </div>
                        <p v-else class="empty-copy">Noch kein aktiver Run im Browser gespeichert.</p>

                        <div v-if="pendingScoreSummary" class="pending-card">
                            <div class="section-heading compact">
                                <span class="eyebrow">Pending Score</span>
                                <strong>lokal gehalten</strong>
                            </div>

                            <div class="metric-grid dense">
                                <div>
                                    <span class="metric-label">Level</span>
                                    <strong>{{ pendingScoreSummary.completedLevels }}</strong>
                                </div>
                                <div>
                                    <span class="metric-label">Rest-HP</span>
                                    <strong>{{ pendingScoreSummary.currentEnemyRemainingHp }}</strong>
                                </div>
                                <div>
                                    <span class="metric-label">Dauer</span>
                                    <strong>{{ pendingScoreSummary.duration }}</strong>
                                </div>
                                <div>
                                    <span class="metric-label">Erfasst</span>
                                    <strong>{{ pendingScoreSummary.createdAt }}</strong>
                                </div>
                            </div>

                            <p class="empty-copy">Einloggen oder registrieren, um diesen Score an das Backend zu senden.</p>

                            <button
                                v-if="authState.isAuthenticated"
                                class="secondary-button"
                                :disabled="integrationState.syncing"
                                type="button"
                                @click="syncAfterAuthentication"
                            >
                                Jetzt speichern
                            </button>
                        </div>
                    </section>
                </div>

                <div class="hud-column spacer-column"></div>

                <div class="hud-column">
                    <section class="panel">
                        <div class="section-heading">
                            <span class="eyebrow">Leaderboard</span>
                            <strong>{{ leaderboard.total }} Eintraege</strong>
                        </div>

                        <p v-if="leaderboard.loading" class="empty-copy">Leaderboard laedt...</p>
                        <p v-else-if="leaderboard.error" class="message error-message">{{ leaderboard.error }}</p>
                        <p v-else-if="leaderboard.items.length === 0" class="empty-copy">Noch keine Scores im Leaderboard.</p>

                        <ol v-else class="score-list leaderboard-list">
                            <li v-for="entry in leaderboard.items" :key="`${entry.rank}-${entry.username}-${entry.achieved_at}`">
                                <div>
                                    <span class="list-rank">#{{ entry.rank }}</span>
                                    <strong>{{ entry.username }}</strong>
                                </div>
                                <div class="list-meta">
                                    <span>Level {{ entry.completed_levels }}</span>
                                    <span>{{ entry.current_enemy_remaining_hp }} HP uebrig</span>
                                    <span>{{ formatDateTime(entry.achieved_at) }}</span>
                                </div>
                            </li>
                        </ol>

                        <div class="pagination-row">
                            <button
                                class="secondary-button"
                                :disabled="leaderboard.loading || !canLoadPreviousLeaderboardPage"
                                type="button"
                                @click="loadLeaderboard(leaderboard.page - 1)"
                            >
                                Zurueck
                            </button>

                            <span>Seite {{ leaderboard.page }}</span>

                            <button
                                class="secondary-button"
                                :disabled="leaderboard.loading || !canLoadNextLeaderboardPage"
                                type="button"
                                @click="loadLeaderboard(leaderboard.page + 1)"
                            >
                                Weiter
                            </button>
                        </div>
                    </section>

                    <section class="panel">
                        <div class="section-heading">
                            <span class="eyebrow">Persoenliche Stats</span>
                            <strong v-if="authState.isAuthenticated">geschuetzt</strong>
                            <strong v-else>Login noetig</strong>
                        </div>

                        <template v-if="authState.isAuthenticated">
                            <div class="bestscore-card">
                                <span class="metric-label">Bestsore</span>
                                <p v-if="bestScore.loading" class="empty-copy">Bestscore laedt...</p>
                                <p v-else-if="bestScore.error" class="message error-message">{{ bestScore.error }}</p>
                                <div v-else-if="bestScore.data" class="metric-grid dense">
                                    <div>
                                        <span class="metric-label">Level</span>
                                        <strong>{{ bestScore.data.completed_levels }}</strong>
                                    </div>
                                    <div>
                                        <span class="metric-label">Rest-HP</span>
                                        <strong>{{ bestScore.data.current_enemy_remaining_hp }}</strong>
                                    </div>
                                    <div class="full-width">
                                        <span class="metric-label">Erreicht</span>
                                        <strong>{{ formatDateTime(bestScore.data.achieved_at) }}</strong>
                                    </div>
                                </div>
                                <p v-else class="empty-copy">Noch kein Score gespeichert.</p>
                            </div>

                            <p v-if="myScores.loading" class="empty-copy">Persoenliche Scores laden...</p>
                            <p v-else-if="myScores.error" class="message error-message">{{ myScores.error }}</p>
                            <p v-else-if="myScores.items.length === 0" class="empty-copy">Noch keine persoenlichen Scores vorhanden.</p>

                            <ol v-else class="score-list">
                                <li v-for="entry in myScores.items" :key="`${entry.created_at}-${entry.duration_ms}`">
                                    <div>
                                        <strong>Level {{ entry.completed_levels }}</strong>
                                        <span class="inline-pill">{{ entry.current_enemy_remaining_hp }} HP uebrig</span>
                                    </div>
                                    <div class="list-meta">
                                        <span>Dauer {{ formatDuration(entry.duration_ms) }}</span>
                                        <span>{{ formatDateTime(entry.created_at) }}</span>
                                    </div>
                                </li>
                            </ol>

                            <div class="pagination-row">
                                <button
                                    class="secondary-button"
                                    :disabled="myScores.loading || !canLoadPreviousScorePage"
                                    type="button"
                                    @click="loadMyScores(myScores.page - 1)"
                                >
                                    Zurueck
                                </button>

                                <span>Seite {{ myScores.page }}</span>

                                <button
                                    class="secondary-button"
                                    :disabled="myScores.loading || !canLoadNextScorePage"
                                    type="button"
                                    @click="loadMyScores(myScores.page + 1)"
                                >
                                    Weiter
                                </button>
                            </div>
                        </template>

                        <p v-else class="empty-copy">
                            Login oder Registrierung aktivieren `GET /me/scores` und `GET /me/best-score`.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.app-shell {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    background:
        radial-gradient(circle at top, rgba(255, 164, 54, 0.2), transparent 32%),
        linear-gradient(180deg, #20110a 0%, #090505 100%);
}

.game-stage {
    position: relative;
    width: min(100vw - 40px, calc(100vh * 1.5), 1536px);
    aspect-ratio: 3 / 2;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 200, 120, 0.18);
}

.game-stage :deep(#game-container),
.game-stage :deep(canvas) {
    width: 100%;
    height: 100%;
}

.overlay-grid {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: minmax(300px, 360px) 1fr minmax(320px, 380px);
    gap: 18px;
    padding: 20px;
    pointer-events: none;
}

.hud-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
    pointer-events: auto;
}

.spacer-column {
    pointer-events: none;
}

.panel {
    padding: 18px;
    border-radius: 24px;
    backdrop-filter: blur(14px);
    background: linear-gradient(180deg, rgba(15, 18, 26, 0.82), rgba(15, 18, 26, 0.66));
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff7ea;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.hero-panel {
    background: linear-gradient(180deg, rgba(47, 27, 16, 0.88), rgba(18, 13, 12, 0.78));
}

.panel-topline,
.section-heading,
.pagination-row,
.metric-grid,
.auth-tabs {
    display: flex;
    gap: 12px;
}

.panel-topline,
.section-heading,
.pagination-row {
    justify-content: space-between;
    align-items: center;
}

.section-heading.compact {
    margin-bottom: 12px;
}

.eyebrow,
h1,
.cta-button,
.secondary-button,
.tab-button,
.status-pill,
.inline-pill,
.list-rank {
    font-family: 'funblob', 'Trebuchet MS', sans-serif;
}

h1 {
    margin: 10px 0 8px;
    font-size: clamp(2rem, 2vw + 1rem, 2.8rem);
    line-height: 1;
    color: #ffd08b;
}

.panel-copy,
.empty-copy,
.message,
label span,
.list-meta,
.metric-label,
.security-note,
.auth-summary p,
.pagination-row span {
    font-family: 'Segoe UI', sans-serif;
}

.panel-copy,
.security-note,
.empty-copy,
.list-meta,
.metric-label {
    color: rgba(255, 247, 234, 0.76);
}

.eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.9rem;
    color: #ffb75e;
}

.status-pill,
.inline-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
}

.status-pill.online {
    color: #c8ffbc;
    background: rgba(52, 117, 37, 0.45);
}

.status-pill.offline {
    color: #ffd2c1;
    background: rgba(133, 37, 37, 0.45);
}

.message {
    margin: 10px 0 0;
    padding: 10px 12px;
    border-radius: 14px;
    font-size: 0.95rem;
}

.info-message {
    background: rgba(37, 94, 133, 0.28);
}

.success-message {
    background: rgba(47, 133, 37, 0.24);
}

.error-message {
    background: rgba(133, 37, 37, 0.3);
}

.auth-tabs {
    margin-top: 16px;
}

.auth-form {
    display: grid;
    gap: 12px;
    margin-top: 16px;
}

label {
    display: grid;
    gap: 6px;
}

input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(7, 9, 15, 0.78);
    color: #fffdf8;
    box-sizing: border-box;
}

input::placeholder {
    color: rgba(255, 247, 234, 0.45);
}

.cta-button,
.secondary-button,
.tab-button {
    border: 0;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

.cta-button:disabled,
.secondary-button:disabled,
.tab-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.cta-button:hover:not(:disabled),
.secondary-button:hover:not(:disabled),
.tab-button:hover:not(:disabled) {
    transform: translateY(-1px);
}

.cta-button {
    padding: 12px 16px;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffbf69, #f2821f);
    color: #2d1403;
    font-size: 1rem;
}

.secondary-button,
.tab-button {
    padding: 10px 14px;
    border-radius: 14px;
    background: rgba(7, 9, 15, 0.74);
    color: #fffdf8;
}

.tab-button.active {
    background: rgba(140, 74, 19, 0.86);
    color: #fff4dc;
}

.auth-summary {
    display: grid;
    gap: 12px;
    margin-top: 16px;
}

.security-note {
    margin: 16px 0 0;
    font-size: 0.85rem;
}

.metric-grid {
    margin-top: 14px;
    flex-wrap: wrap;
}

.metric-grid > div {
    min-width: 120px;
    flex: 1 1 45%;
    display: grid;
    gap: 4px;
}

.metric-grid.dense > div {
    flex-basis: 44%;
}

.full-width {
    flex-basis: 100%;
}

.metric-label {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.pending-card,
.bestscore-card {
    margin-top: 16px;
    padding: 14px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.05);
}

.score-list {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 10px;
}

.score-list li {
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    display: grid;
    gap: 8px;
}

.leaderboard-list {
    counter-reset: leaderboard;
}

.list-rank {
    margin-right: 10px;
    color: #ffbf69;
}

.list-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.9rem;
}

.inline-pill {
    margin-left: 10px;
    font-size: 0.78rem;
}

.pagination-row {
    margin-top: 16px;
}

@media (max-width: 1180px) {
    .app-shell {
        padding: 14px;
        align-items: flex-start;
    }

    .game-stage {
        width: min(100%, 960px);
        height: auto;
        overflow: visible;
    }

    .overlay-grid {
        position: static;
        grid-template-columns: 1fr;
        padding: 14px 0 0;
        pointer-events: auto;
    }

    .spacer-column {
        display: none;
    }

    .hud-column {
        pointer-events: auto;
    }
}

@media (max-width: 720px) {
    .app-shell {
        padding: 10px;
    }

    .panel {
        padding: 14px;
        border-radius: 18px;
    }

    .panel-topline,
    .section-heading,
    .pagination-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .metric-grid > div,
    .metric-grid.dense > div {
        flex-basis: 100%;
    }

    .auth-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}
</style>
