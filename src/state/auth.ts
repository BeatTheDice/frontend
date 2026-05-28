import { reactive, readonly } from 'vue';
import { apiClient, configureApiClient } from '../api/client';
import type { AuthCredentials, RegisterResponse } from '../api/types';

const ACCESS_TOKEN_STORAGE_KEY = 'beat-the-dice.access-token';

interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean;
    isBusy: boolean;
}

const loadStoredToken = (): string | null => {
    const token = globalThis.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    return token?.trim() ? token : null;
};

const state = reactive<AuthState>({
    accessToken: loadStoredToken(),
    isAuthenticated: Boolean(loadStoredToken()),
    isBusy: false
});

const persistToken = (token: string | null) => {
    state.accessToken = token;
    state.isAuthenticated = Boolean(token);

    if (token) {
        globalThis.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
        return;
    }

    globalThis.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const logout = ({ silent = false }: { silent?: boolean } = {}) => {
    persistToken(null);

    if (!silent) {
        state.isBusy = false;
    }
};

configureApiClient({
    getAccessToken: () => state.accessToken,
    onUnauthorized: () => {
        logout({ silent: true });
    }
});

const login = async (credentials: AuthCredentials) => {
    state.isBusy = true;

    try {
        const response = await apiClient.login(credentials);
        persistToken(response.access_token);
        return response;
    } finally {
        state.isBusy = false;
    }
};

const register = async (credentials: AuthCredentials): Promise<RegisterResponse> => {
    state.isBusy = true;

    try {
        return await apiClient.register(credentials);
    } finally {
        state.isBusy = false;
    }
};

const registerAndLogin = async (credentials: AuthCredentials) => {
    const registration = await register(credentials);
    await login(credentials);
    return registration;
};

export const authStore = readonly(state);

export const useAuthState = () => ({
    authState: authStore,
    login,
    register,
    registerAndLogin,
    logout
});
