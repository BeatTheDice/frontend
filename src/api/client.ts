import type {
    AuthLoginRequest,
    AuthLoginResponse,
    BestScoreResponse,
    HealthResponse,
    LeaderboardResponse,
    MyScoresResponse,
    PaginationParams,
    RegisterRequest,
    RegisterResponse,
    RunClaimRequest,
    RunClaimResponse,
    RunStartResponse,
    ScoreSubmitRequest,
    ScoreSubmitResponse
} from './types';

interface ApiClientConfig {
    getAccessToken?: () => string | null;
    onUnauthorized?: () => void;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    skipAuth?: boolean;
}

const defaultMessages: Record<number, string> = {
    400: 'Die Anfrage konnte nicht verarbeitet werden.',
    401: 'Bitte erneut einloggen.',
    403: 'Zugriff verweigert.',
    404: 'Die angeforderte Ressource wurde nicht gefunden.',
    409: 'Username ist bereits vergeben.',
    500: 'Beim Backend ist ein Fehler aufgetreten.'
};

let clientConfig: ApiClientConfig = {};

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
const apiBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export class ApiError extends Error {
    readonly status: number | null;
    readonly code: string;
    readonly body?: unknown;

    constructor(message: string, status: number | null, code: string, body?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.body = body;
    }
}

export const configureApiClient = (config: ApiClientConfig) => {
    clientConfig = config;
};

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const ensureBaseUrl = (): string => {
    if (!apiBaseUrl) {
        throw new ApiError('VITE_API_BASE_URL ist nicht gesetzt.', null, 'CONFIG_ERROR');
    }

    return apiBaseUrl;
};

const resolveUrl = (path: string): string => {
    const baseUrl = ensureBaseUrl();

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const getErrorMessage = (status: number, body: unknown): string => {
    if (body && typeof body === 'object') {
        const message = Reflect.get(body, 'message');
        if (typeof message === 'string' && message.trim()) {
            return message;
        }

        const detail = Reflect.get(body, 'detail');
        if (typeof detail === 'string' && detail.trim()) {
            return detail;
        }
    }

    return defaultMessages[status] ?? 'Die Anfrage ist fehlgeschlagen.';
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text || null;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    if (!options.skipAuth) {
        const accessToken = clientConfig.getAccessToken?.();
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
    }

    try {
        const response = await fetch(resolveUrl(path), {
            ...options,
            headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body)
        });

        const responseBody = await parseResponseBody(response);

        if (!response.ok) {
            if (response.status === 401) {
                clientConfig.onUnauthorized?.();
            }

            throw new ApiError(
                getErrorMessage(response.status, responseBody),
                response.status,
                `HTTP_${response.status}`,
                responseBody
            );
        }

        return responseBody as T;
    } catch (error) {
        if (isApiError(error)) {
            throw error;
        }

        throw new ApiError('Backend nicht erreichbar.', null, 'NETWORK_ERROR');
    }
};

export const apiClient = {
    register(payload: RegisterRequest) {
        return request<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: payload,
            skipAuth: true
        });
    },

    login(payload: AuthLoginRequest) {
        return request<AuthLoginResponse>('/auth/login', {
            method: 'POST',
            body: payload,
            skipAuth: true
        });
    },

    startRun() {
        return request<RunStartResponse>('/runs/start', {
            method: 'POST',
            skipAuth: true
        });
    },

    claimRun(runId: string, payload: RunClaimRequest) {
        return request<RunClaimResponse>(`/runs/${runId}/claim`, {
            method: 'POST',
            body: payload
        });
    },

    submitScore(runId: string, payload: ScoreSubmitRequest) {
        return request<ScoreSubmitResponse>(`/runs/${runId}/score`, {
            method: 'POST',
            body: payload
        });
    },

    getLeaderboard(params: PaginationParams = {}) {
        const searchParams = new URLSearchParams();
        if (params.page) {
            searchParams.set('page', String(params.page));
        }
        if (params.page_size) {
            searchParams.set('page_size', String(params.page_size));
        }

        const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
        return request<LeaderboardResponse>(`/leaderboard${suffix}`, { method: 'GET', skipAuth: true });
    },

    getMyScores(params: PaginationParams = {}) {
        const searchParams = new URLSearchParams();
        if (params.page) {
            searchParams.set('page', String(params.page));
        }
        if (params.page_size) {
            searchParams.set('page_size', String(params.page_size));
        }

        const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
        return request<MyScoresResponse>(`/me/scores${suffix}`, { method: 'GET' });
    },

    getMyBestScore() {
        return request<BestScoreResponse>('/me/best-score', { method: 'GET' });
    },

    health() {
        return request<HealthResponse>('/health', { method: 'GET', skipAuth: true });
    }
};
