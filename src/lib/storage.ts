/**
 * LocalStorage utility for authentication data
 */

const AUTH_STORAGE_KEY = 'fintech_google_auth';

export interface StoredAuth {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    user: {
        email: string;
        name: string;
        picture?: string;
    };
}

/**
 * Save authentication data to localStorage
 */
export const saveAuth = (auth: StoredAuth): void => {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        console.log('✅ Auth data saved to localStorage');
    } catch (error) {
        console.error('Error saving auth to localStorage:', error);
    }
};

/**
 * Load authentication data from localStorage
 */
export const loadAuth = (): StoredAuth | null => {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return null;

        const auth: StoredAuth = JSON.parse(stored);

        // Check if token is expired
        if (auth.expiresAt && Date.now() >= auth.expiresAt) {
            console.log('⚠️ Stored token is expired');
            clearAuth();
            return null;
        }

        console.log('✅ Auth data loaded from localStorage');
        return auth;
    } catch (error) {
        console.error('Error loading auth from localStorage:', error);
        return null;
    }
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuth = (): void => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        console.log('✅ Auth data cleared from localStorage');
    } catch (error) {
        console.error('Error clearing auth from localStorage:', error);
    }
};

/**
 * Check if token is near expiration (within 5 minutes)
 */
export const isTokenNearExpiration = (expiresAt: number): boolean => {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= expiresAt - fiveMinutes;
};
