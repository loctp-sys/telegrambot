import { GOOGLE_CONFIG } from '@/config/constants';

// Type definitions
export interface SheetData {
    range: string;
    values: any[][];
}

// Google API client instance
let gapiInited = false;
let gisInited = false;
let tokenClient: any;

/**
 * Initialize Google API client
 */
export const initGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (gapiInited) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            (window as any).gapi.load('client', async () => {
                try {
                    await (window as any).gapi.client.init({
                        apiKey: GOOGLE_CONFIG.apiKey,
                        discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
                    });
                    gapiInited = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

/**
 * Initialize Google Identity Services
 */
export const initGoogleIdentity = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (gisInited) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CONFIG.clientId,
                scope: GOOGLE_CONFIG.scopes,
                callback: '', // Will be set during sign-in
            });
            gisInited = true;
            resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

/**
 * Sign in to Google
 */
export const signIn = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            tokenClient.callback = async (response: any) => {
                if (response.error) {
                    reject(response);
                    return;
                }
                resolve();
            };

            if ((window as any).gapi.client.getToken() === null) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                tokenClient.requestAccessToken({ prompt: '' });
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Sign out from Google
 */
export const signOut = (): void => {
    const token = (window as any).gapi.client.getToken();
    if (token !== null) {
        (window as any).google.accounts.oauth2.revoke(token.access_token);
        (window as any).gapi.client.setToken('');
    }
};

/**
 * Check if user is signed in
 */
export const isSignedIn = (): boolean => {
    return (window as any).gapi?.client?.getToken() !== null;
};

/**
 * Read data from Google Sheets
 */
export const readSheet = async (range: string): Promise<any[][]> => {
    try {
        const response = await (window as any).gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.spreadsheetId,
            range: range,
        });
        return response.result.values || [];
    } catch (error) {
        console.error('Error reading sheet:', error);
        throw error;
    }
};

/**
 * Write data to Google Sheets
 */
export const writeSheet = async (range: string, values: any[][]): Promise<void> => {
    try {
        await (window as any).gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_CONFIG.spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
    } catch (error) {
        console.error('Error writing to sheet:', error);
        throw error;
    }
};

/**
 * Append data to Google Sheets
 */
export const appendSheet = async (range: string, values: any[][]): Promise<void> => {
    try {
        await (window as any).gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
        });
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
};
