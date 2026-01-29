import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveAuth, loadAuth, clearAuth, isTokenNearExpiration, type StoredAuth } from '@/lib/storage';
import { initGoogleAPI, initGoogleIdentity, signIn as googleSignIn, signOut as googleSignOut } from '@/lib/google';

interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
}

interface AuthState {
    user: GoogleUser | null;
    accessToken: string | null;
    expiresAt: number | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: () => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Initialize Google APIs and restore session
    useEffect(() => {
        const initialize = async () => {
            try {
                // Initialize Google APIs
                await Promise.all([initGoogleAPI(), initGoogleIdentity()]);

                // Try to restore session from localStorage
                const stored = loadAuth();
                if (stored) {
                    setState({
                        user: stored.user,
                        accessToken: stored.accessToken,
                        expiresAt: stored.expiresAt,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Set the token in gapi client
                    if ((window as any).gapi?.client) {
                        (window as any).gapi.client.setToken({
                            access_token: stored.accessToken,
                        });
                    }

                    console.log('✅ Session restored from localStorage');
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initialize();
    }, []);

    // Auto-refresh token before expiration
    useEffect(() => {
        if (!state.expiresAt || !state.isAuthenticated) return;

        const checkAndRefresh = async () => {
            if (isTokenNearExpiration(state.expiresAt!)) {
                console.log('🔄 Token near expiration, refreshing...');
                await refreshToken();
            }
        };

        // Check immediately
        checkAndRefresh();

        // Check every 5 minutes
        const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [state.expiresAt, state.isAuthenticated]);

    const login = async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            // Perform Google Sign-In
            await googleSignIn();

            // Get token from gapi client
            const tokenClient = (window as any).gapi?.client?.getToken();
            if (!tokenClient) {
                throw new Error('Failed to get token from Google');
            }

            // Get user info from Google Identity
            const googleUser = (window as any).google?.accounts?.id;

            // Calculate expiration (1 hour from now)
            const expiresAt = Date.now() + 3600 * 1000;

            // For now, we'll use the email from gapi
            // In a real implementation, you'd decode the ID token
            const user: GoogleUser = {
                email: 'user@example.com', // This should come from decoded ID token
                name: 'User',
                picture: undefined,
            };

            const authData: StoredAuth = {
                accessToken: tokenClient.access_token,
                expiresAt,
                user,
            };

            // Save to localStorage
            saveAuth(authData);

            // Update state
            setState({
                user,
                accessToken: tokenClient.access_token,
                expiresAt,
                isAuthenticated: true,
                isLoading: false,
            });

            // Dispatch custom event for other components
            window.dispatchEvent(new Event('google-signin'));

            console.log('✅ Login successful');
        } catch (error) {
            console.error('Login error:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = () => {
        try {
            // Sign out from Google
            googleSignOut();

            // Clear localStorage
            clearAuth();

            // Reset state
            setState({
                user: null,
                accessToken: null,
                expiresAt: null,
                isAuthenticated: false,
                isLoading: false,
            });

            console.log('✅ Logout successful');

            // Reload page to reset all state
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const refreshToken = async () => {
        try {
            console.log('🔄 Refreshing access token...');

            // For Google OAuth in browser, we need to re-authenticate
            // This is a limitation of browser-based OAuth
            // In a real implementation with a backend, you'd use the refresh token here

            // For now, we'll just prompt the user to sign in again silently
            // This uses Google's "prompt: none" to try silent re-auth

            const tokenClient = (window as any).gapi?.client?.getToken();
            if (tokenClient) {
                const expiresAt = Date.now() + 3600 * 1000;

                const authData: StoredAuth = {
                    accessToken: tokenClient.access_token,
                    expiresAt,
                    user: state.user!,
                };

                saveAuth(authData);

                setState(prev => ({
                    ...prev,
                    accessToken: tokenClient.access_token,
                    expiresAt,
                }));

                console.log('✅ Token refreshed successfully');
            } else {
                console.warn('⚠️ Unable to refresh token, user may need to re-login');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            // If refresh fails, log the user out
            logout();
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
