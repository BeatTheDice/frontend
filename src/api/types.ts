export interface AuthCredentials {
    username: string;
    password: string;
}

export interface AuthLoginRequest extends AuthCredentials {}

export interface RegisterRequest extends AuthCredentials {}

export interface AuthLoginResponse {
    access_token: string;
    token_type?: string;
}

export interface RegisterResponse {
    id: string;
    username: string;
}

export interface RunStartResponse {
    run_id: string;
    claim_token: string;
    started_at: string;
}

export interface RunClaimRequest {
    claim_token: string;
}

export interface RunClaimResponse {
    run_id: string;
    claimed: boolean;
}

export interface ScoreSubmitRequest {
    claim_token: string;
    completed_levels: number;
    current_enemy_remaining_hp: number;
    duration_ms: number;
}

export interface ScoreSubmitResponse {
    accepted: boolean;
    is_personal_best: boolean;
}

export interface LeaderboardItem {
    rank: number;
    username: string;
    completed_levels: number;
    current_enemy_remaining_hp: number;
    achieved_at: string;
}

export interface LeaderboardResponse {
    page: number;
    page_size: number;
    total: number;
    items: LeaderboardItem[];
}

export interface PersonalScoreItem {
    completed_levels: number;
    current_enemy_remaining_hp: number;
    duration_ms: number;
    created_at: string;
}

export interface MyScoresResponse {
    page: number;
    page_size: number;
    items: PersonalScoreItem[];
}

export interface BestScoreData {
    completed_levels: number;
    current_enemy_remaining_hp: number;
    achieved_at: string;
}

export interface BestScoreResponse {
    best_score: BestScoreData | null;
}

export type HealthResponse = Record<string, unknown>;

export interface ValidationErrorItem {
    loc: Array<string | number>;
    msg: string;
    type: string;
    input?: unknown;
    ctx?: Record<string, unknown>;
}

export interface HttpValidationError {
    detail?: ValidationErrorItem[];
}

export interface ApiErrorPayload {
    detail?: ValidationErrorItem[] | string;
    message?: string;
    [key: string]: unknown;
}

export interface PaginationParams {
    page?: number;
    page_size?: number;
}
