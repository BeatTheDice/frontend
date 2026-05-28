<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import type { Scene } from 'phaser';
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
type OverlayView = 'home' | 'leaderboard' | 'auth' | 'history';

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
    markActiveRunRolled,
    markActiveRunSubmitted,
    moveActiveRunToPendingScore,
    setActiveRun
} = useRunState();

const authMode = ref<AuthMode>('login');
const activeView = ref<OverlayView>('home');
const currentSceneKey = ref('MainMenu');
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
        return 'Backend wird geprueft';
    }

    return backendStatus.available ? 'Backend online' : 'Backend offline';
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

const heroStatusText = computed(() => {
    if (runState.pendingScore) {
        return authState.isAuthenticated
            ? 'Ein Score wartet auf das Speichern.'
            : 'Ein Score wartet auf Login oder Registrierung.';
    }

    if (runState.activeRun) {
        return 'Ein Run ist bereits im Browser gespeichert.';
    }

    return authState.isAuthenticated
        ? 'Du bist eingeloggt. History ist verfuegbar.'
        : 'Spielen geht anonym. Login brauchst du nur fuer gespeicherte Scores.';
});

const historyButtonVisible = computed(() => authState.isAuthenticated);
const homeLoginLabel = computed(() => authState.isAuthenticated ? 'Account' : 'Login');
const isHomeScene = computed(() => currentSceneKey.value === 'MainMenu');
const isEndScene = computed(() => ['GameOver', 'Winner'].includes(currentSceneKey.value));
const overlayVisible = computed(() => ['MainMenu', 'GameOver', 'Winner'].includes(currentSceneKey.value));
const overlayLayoutClass = computed(() => ({
    'overlay-home': isHomeScene.value,
    'overlay-end': isEndScene.value
}));
const menuPanelClass = computed(() => ({
    'menu-panel-home': isHomeScene.value,
    'menu-panel-end': isEndScene.value
}));
const pagePanelClass = computed(() => ({
    'page-panel-home': isHomeScene.value,
    'page-panel-end': isEndScene.value
}));

const panelTitle = computed(() => {
    switch (activeView.value) {
        case 'leaderboard':
            return 'Leaderboard';
        case 'auth':
            return authState.isAuthenticated ? 'Account' : 'Login';
        case 'history':
            return 'History';
        default:
            return 'Menu';
    }
});

const activeRunText = computed(() => {
    if (!runState.activeRun) {
        return '';
    }

    return `Aktiver Run seit ${formatDateTime(runState.activeRun.startedAt)}`;
});

const canLoadPreviousLeaderboardPage = computed(() => leaderboard.page > 1);
const canLoadNextLeaderboardPage = computed(() => leaderboard.page * leaderboard.pageSize < leaderboard.total);
const canLoadPreviousScorePage = computed(() => myScores.page > 1);
const canLoadNextScorePage = computed(() => myScores.items.length === myScores.pageSize);

const openView = (view: OverlayView) => {
    activeView.value = view;

    if (view === 'leaderboard' && !leaderboard.items.length && !leaderboard.loading) {
        void loadLeaderboard(leaderboard.page);
    }

    if (view === 'history' && authState.isAuthenticated) {
        void refreshPrivateViews();
    }
};

const goHome = () => {
    activeView.value = 'home';
};

const handleCurrentScene = (scene: Scene) => {
    currentSceneKey.value = scene.scene.key;

    if (!overlayVisible.value) {
        activeView.value = 'home';
    }
};

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
            bestScore.error = getErrorMessage(error, 'Bestscore konnte nicht geladen werden.', {
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

    if (!runState.activeRun.hasRolled) {
        clearActiveRun();
        feedbackMessage.value = 'Run ohne Wurf wurde verworfen.';
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
    activeView.value = 'home';
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

const handleRunRolled = () => {
    markActiveRunRolled();
};

const handleRunCompleted = (event: GameRunCompletedEvent) => {
    void submitCurrentRunScore(event);
};

onMounted(() => {
    EventBus.on(GAME_EVENTS.runStartRequested, handleRunStartRequested);
    EventBus.on(GAME_EVENTS.runRolled, handleRunRolled);
    EventBus.on(GAME_EVENTS.runCompleted, handleRunCompleted);
    void initialize();
});

onUnmounted(() => {
    EventBus.off(GAME_EVENTS.runStartRequested, handleRunStartRequested);
    EventBus.off(GAME_EVENTS.runRolled, handleRunRolled);
    EventBus.off(GAME_EVENTS.runCompleted, handleRunCompleted);
});
</script>

<template>
    <div class="app-shell">
        <div class="game-stage">
            <PhaserGame @current-active-scene="handleCurrentScene" />

            <div v-if="overlayVisible" class="overlay-shell" :class="overlayLayoutClass">
                <section class="menu-panel" :class="menuPanelClass">
                    <div class="menu-buttons">
                        <button class="game-button" type="button" @click="openView('leaderboard')">
                            Leaderboard
                        </button>
                        <button class="game-button" type="button" @click="openView('auth')">
                            {{ homeLoginLabel }}
                        </button>
                        <button
                            v-if="historyButtonVisible"
                            class="game-button"
                            type="button"
                            @click="openView('history')"
                        >
                            History
                        </button>
                    </div>
                </section>

                <section v-if="activeView !== 'home'" class="page-panel" :class="pagePanelClass">
                    <div class="page-meta">
                        <div class="panel-topline">
                            <span class="eyebrow">Beat The Dice</span>
                            <span class="status-pill" :class="backendStatus.available ? 'online' : 'offline'">
                                {{ backendBadgeLabel }}
                            </span>
                        </div>

                        <p class="panel-copy">{{ heroStatusText }}</p>

                        <p v-if="backendStatus.error" class="status-copy error-copy">{{ backendStatus.error }}</p>
                        <p v-else-if="feedbackMessage" class="status-copy">{{ feedbackMessage }}</p>
                        <p v-else-if="authMessage" class="status-copy success-copy">{{ authMessage }}</p>

                        <div v-if="pendingScoreSummary" class="notice-strip">
                            <span>
                                Pending Score: Level {{ pendingScoreSummary.completedLevels }},
                                {{ pendingScoreSummary.currentEnemyRemainingHp }} HP,
                                {{ pendingScoreSummary.duration }}
                            </span>
                            <button
                                v-if="authState.isAuthenticated"
                                class="mini-button"
                                :disabled="integrationState.syncing"
                                type="button"
                                @click="syncAfterAuthentication"
                            >
                                Speichern
                            </button>
                        </div>

                        <p v-else-if="activeRunText" class="subtle-copy">{{ activeRunText }}</p>
                    </div>

                    <div class="page-header">
                        <h2>{{ panelTitle }}</h2>
                        <button class="mini-button" type="button" @click="goHome">
                            Zurueck
                        </button>
                    </div>

                    <template v-if="activeView === 'leaderboard'">
                        <p v-if="leaderboard.loading" class="empty-copy">Leaderboard laedt...</p>
                        <p v-else-if="leaderboard.error" class="status-copy error-copy">{{ leaderboard.error }}</p>
                        <p v-else-if="leaderboard.items.length === 0" class="empty-copy">Noch keine Scores im Leaderboard.</p>

                        <ol v-else class="score-list">
                            <li v-for="entry in leaderboard.items" :key="`${entry.rank}-${entry.username}-${entry.achieved_at}`">
                                <div class="score-topline">
                                    <div>
                                        <span class="list-rank">#{{ entry.rank }}</span>
                                        <strong>{{ entry.username }}</strong>
                                    </div>
                                    <span>Level {{ entry.completed_levels }}</span>
                                </div>
                                <div class="list-meta">
                                    <span>{{ entry.current_enemy_remaining_hp }} HP uebrig</span>
                                    <span>{{ formatDateTime(entry.achieved_at) }}</span>
                                </div>
                            </li>
                        </ol>

                        <div class="pagination-row">
                            <button
                                class="mini-button"
                                :disabled="leaderboard.loading || !canLoadPreviousLeaderboardPage"
                                type="button"
                                @click="loadLeaderboard(leaderboard.page - 1)"
                            >
                                Zurueck
                            </button>
                            <span>Seite {{ leaderboard.page }}</span>
                            <button
                                class="mini-button"
                                :disabled="leaderboard.loading || !canLoadNextLeaderboardPage"
                                type="button"
                                @click="loadLeaderboard(leaderboard.page + 1)"
                            >
                                Weiter
                            </button>
                        </div>
                    </template>

                    <template v-else-if="activeView === 'auth'">
                        <div v-if="!authState.isAuthenticated" class="auth-tabs">
                            <button
                                class="mini-button"
                                :class="{ active: authMode === 'login' }"
                                type="button"
                                @click="authMode = 'login'"
                            >
                                Login
                            </button>
                            <button
                                class="mini-button"
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

                            <button class="game-button compact" :disabled="authState.isBusy || integrationState.syncing" type="submit">
                                {{ authMode === 'login' ? 'Einloggen' : 'Registrieren' }}
                            </button>
                        </form>

                        <div v-else class="account-card">
                            <p class="panel-copy">Dein Account ist verbunden. Pending Scores werden automatisch gespeichert, sobald sie abgeschickt werden koennen.</p>
                            <button class="game-button compact" type="button" @click="handleLogout">
                                Logout
                            </button>
                        </div>
                    </template>

                    <template v-else-if="activeView === 'history'">
                        <template v-if="authState.isAuthenticated">
                            <div class="bestscore-card">
                                <span class="eyebrow">Bestscore</span>
                                <p v-if="bestScore.loading" class="empty-copy">Bestscore laedt...</p>
                                <p v-else-if="bestScore.error" class="status-copy error-copy">{{ bestScore.error }}</p>
                                <div v-else-if="bestScore.data" class="score-summary">
                                    <strong>Level {{ bestScore.data.completed_levels }}</strong>
                                    <span>{{ bestScore.data.current_enemy_remaining_hp }} HP</span>
                                    <span>{{ formatDateTime(bestScore.data.achieved_at) }}</span>
                                </div>
                                <p v-else class="empty-copy">Noch kein Score gespeichert.</p>
                            </div>

                            <p v-if="myScores.loading" class="empty-copy">History laedt...</p>
                            <p v-else-if="myScores.error" class="status-copy error-copy">{{ myScores.error }}</p>
                            <p v-else-if="myScores.items.length === 0" class="empty-copy">Noch keine persoenlichen Scores vorhanden.</p>

                            <ol v-else class="score-list">
                                <li v-for="entry in myScores.items" :key="`${entry.created_at}-${entry.duration_ms}`">
                                    <div class="score-topline">
                                        <strong>Level {{ entry.completed_levels }}</strong>
                                        <span>{{ entry.current_enemy_remaining_hp }} HP</span>
                                    </div>
                                    <div class="list-meta">
                                        <span>Dauer {{ formatDuration(entry.duration_ms) }}</span>
                                        <span>{{ formatDateTime(entry.created_at) }}</span>
                                    </div>
                                </li>
                            </ol>

                            <div class="pagination-row">
                                <button
                                    class="mini-button"
                                    :disabled="myScores.loading || !canLoadPreviousScorePage"
                                    type="button"
                                    @click="loadMyScores(myScores.page - 1)"
                                >
                                    Zurueck
                                </button>
                                <span>Seite {{ myScores.page }}</span>
                                <button
                                    class="mini-button"
                                    :disabled="myScores.loading || !canLoadNextScorePage"
                                    type="button"
                                    @click="loadMyScores(myScores.page + 1)"
                                >
                                    Weiter
                                </button>
                            </div>
                        </template>

                        <p v-else class="empty-copy">History ist nur nach dem Login verfuegbar.</p>
                    </template>
                </section>
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
        radial-gradient(circle at top, rgba(255, 164, 54, 0.18), transparent 30%),
        linear-gradient(180deg, #1f120b 0%, #090505 100%);
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

.overlay-shell {
    position: absolute;
    inset: 0;
    padding: 24px;
    pointer-events: none;
}

.menu-panel {
    position: absolute;
    top: 24px;
    left: 24px;
    pointer-events: auto;
}

.menu-panel-home {
    top: 24px;
    left: 24px;
    margin-bottom: 0;
}

.menu-panel-end {
    top: 24px;
    left: 24px;
}

.page-panel {
    position: absolute;
    top: 24px;
    right: 24px;
    width: min(420px, calc(100% - 280px));
    max-height: calc(100% - 48px);
    padding: 18px;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(17, 24, 39, 0.9), rgba(12, 17, 29, 0.82));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(10px);
    pointer-events: auto;
    overflow: auto;
}

.page-panel-home {
    top: 24px;
    right: 24px;
}

.page-panel-end {
    top: 24px;
    right: 24px;
}

.panel-topline,
.pagination-row,
.auth-tabs,
.page-header,
.score-topline,
.score-summary,
.page-meta {
    display: flex;
    gap: 12px;
}

.panel-topline,
.pagination-row,
.page-header,
.score-topline,
.score-summary {
    justify-content: space-between;
    align-items: center;
}

.eyebrow,
.game-button,
.mini-button,
.status-pill,
.list-rank,
h2 {
    font-family: 'funblob', 'Trebuchet MS', sans-serif;
}

.eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.9rem;
    color: #ffb75e;
}

.panel-copy,
.empty-copy,
.status-copy,
.list-meta,
.subtle-copy,
label span,
.pagination-row span,
.notice-strip {
    font-family: 'Segoe UI', sans-serif;
}

.panel-copy,
.empty-copy,
.list-meta,
.subtle-copy,
.notice-strip {
    color: rgba(255, 247, 234, 0.8);
}

.status-pill {
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

.menu-buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
}

.game-button,
.mini-button {
    border: none;
    cursor: pointer;
    color: #ffffff;
    background: #1f2937;
    transition: transform 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.game-button:hover:not(:disabled),
.mini-button:hover:not(:disabled) {
    transform: translateY(-1px);
    color: #ffdd75;
}

.game-button:disabled,
.mini-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.game-button {
    align-self: flex-start;
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 34px;
    line-height: 1;
    text-shadow:
        -2px -2px 0 #000,
        2px -2px 0 #000,
        -2px 2px 0 #000,
        2px 2px 0 #000,
        0 0 8px rgba(0, 0, 0, 0.35);
}

.game-button.compact {
    font-size: 28px;
}

.mini-button {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 22px;
    text-shadow:
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;
}

.mini-button.active {
    color: #ffdd75;
}

.status-copy {
    margin: 10px 0 0;
    color: #fff7ea;
}

.error-copy {
    color: #ffd2c1;
}

.success-copy {
    color: #c8ffbc;
}

.notice-strip,
.subtle-copy {
    margin-top: 14px;
}

.page-meta {
    flex-direction: column;
    margin-bottom: 18px;
}

.notice-strip {
    display: grid;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
}

h2 {
    margin: 0;
    font-size: 40px;
    color: #ffb75e;
    text-shadow:
        -2px -2px 0 #000,
        2px -2px 0 #000,
        -2px 2px 0 #000,
        2px 2px 0 #000;
}

.auth-form,
.account-card,
.bestscore-card {
    display: grid;
    gap: 12px;
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

.score-list {
    margin: 16px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 10px;
}

.score-list li,
.bestscore-card,
.account-card {
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
}

.score-topline,
.score-summary {
    flex-wrap: wrap;
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
    margin-top: 8px;
}

.pagination-row {
    margin-top: 16px;
}

@media (max-width: 1180px) {
    .app-shell {
        padding: 14px;
    }

    .game-stage {
        width: min(100%, 1100px);
    }

    .overlay-shell {
        padding: 16px;
    }
}

@media (max-width: 860px) {
    .app-shell {
        align-items: flex-start;
    }

    .game-stage {
        width: min(100%, 960px);
        height: auto;
        overflow: visible;
    }

    .overlay-shell {
        position: static;
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
        padding: 14px 0 0;
        pointer-events: auto;
    }

    .menu-panel,
    .page-panel {
        position: static;
        width: auto;
        max-height: none;
    }

    .menu-panel-home,
    .menu-panel-end,
    .page-panel-home,
    .page-panel-end {
        top: auto;
        right: auto;
        left: auto;
        margin-bottom: 0;
    }

    .page-panel {
        backdrop-filter: blur(10px);
    }
}

@media (max-width: 720px) {
    .app-shell {
        padding: 10px;
    }

    .page-panel {
        padding: 14px;
        border-radius: 18px;
    }

    .panel-topline,
    .page-header,
    .pagination-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .game-button {
        width: 100%;
        text-align: left;
        font-size: 30px;
    }
}
</style>