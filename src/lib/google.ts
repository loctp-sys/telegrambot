import { GOOGLE_CONFIG } from '@/config/constants';

// ==================== TYPE DEFINITIONS ====================

export interface LoanOffer {
    id: string;           // Col A - STT
    name: string;         // Col B - Ten_Vay
    type: string;         // Col C - Loai (WEB, H5, CIC)
    affLink: string;      // Col D - Link_Aff
    status: string;       // Col E - Trang_Thai (Active, Inactive)
    description: string;  // Col F - Mo_Ta
}

export interface ScheduledPost {
    date: string;         // Col A - Ngay_Du_Kien
    time: string;         // Col B - Gio_Gui
    content: string;      // Col C - Noi_Dung_Caption
    buttonLink: string;   // Col D - Link_Nut_Bam
    imageLink: string;    // Col E - Link_Anh
    status: string;       // Col F - Trang_Thai (Pending, Done)
    exactTime: string;    // Col G - Gio_Dang
}

export interface ConfigItem {
    key: string;          // Col A
    value: string;        // Col B
}

export interface SheetData {
    range: string;
    values: any[][];
}

// ==================== GOOGLE API INITIALIZATION ====================

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
                callback: '',
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

// ==================== GENERIC SHEET OPERATIONS ====================

/**
 * Read data from Google Sheets (generic)
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
 * Write data to Google Sheets (generic)
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
 * Append data to Google Sheets (generic)
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

// ==================== SPECIFIC DATA OPERATIONS ====================

/**
 * Read loan offers from DATA_KHOANVAY sheet
 */
export const readLoansData = async (sheetName: string): Promise<LoanOffer[]> => {
    try {
        const data = await readSheet(`${sheetName}!A:F`);

        if (data.length <= 1) return []; // No data or only header

        // Skip header row (index 0), map from row 2 onwards
        return data.slice(1).map((row) => ({
            id: row[0] || '',
            name: row[1] || '',
            type: row[2] || '',
            affLink: row[3] || '',
            status: row[4] || '',
            description: row[5] || '',
        }));
    } catch (error) {
        console.error('Error reading loans data:', error);
        return [];
    }
};

/**
 * Read scheduled posts from AUTO_POST sheet
 */
export const readScheduleData = async (sheetName: string): Promise<ScheduledPost[]> => {
    try {
        const data = await readSheet(`${sheetName}!A:G`);

        if (data.length <= 1) return [];

        return data.slice(1).map((row) => ({
            date: row[0] || '',
            time: row[1] || '',
            content: row[2] || '',
            buttonLink: row[3] || '',
            imageLink: row[4] || '',
            status: row[5] || '',
            exactTime: row[6] || '',
        }));
    } catch (error) {
        console.error('Error reading schedule data:', error);
        return [];
    }
};

/**
 * Read config from CONFIG sheet
 */
export const readConfigData = async (sheetName: string): Promise<ConfigItem[]> => {
    try {
        const data = await readSheet(`${sheetName}!A:B`);

        if (data.length <= 1) return [];

        return data.slice(1).map((row) => ({
            key: row[0] || '',
            value: row[1] || '',
        }));
    } catch (error) {
        console.error('Error reading config data:', error);
        return [];
    }
};

/**
 * Write config data to CONFIG sheet
 */
export const writeConfigData = async (sheetName: string, configs: ConfigItem[]): Promise<void> => {
    try {
        const values = configs.map(config => [config.key, config.value]);
        await writeSheet(`${sheetName}!A2:B`, values);
    } catch (error) {
        console.error('Error writing config data:', error);
        throw error;
    }
};

/**
 * Add new loan offer to DATA_KHOANVAY sheet
 */
export const addLoanOffer = async (sheetName: string, loan: Omit<LoanOffer, 'id'>): Promise<void> => {
    try {
        // Get current data to determine next ID
        const currentData = await readLoansData(sheetName);
        const nextId = (currentData.length + 1).toString();

        const newRow = [
            nextId,
            loan.name,
            loan.type,
            loan.affLink,
            loan.status,
            loan.description,
        ];

        await appendSheet(`${sheetName}!A:F`, [newRow]);
    } catch (error) {
        console.error('Error adding loan offer:', error);
        throw error;
    }
};

/**
 * Add new scheduled post to AUTO_POST sheet
 */
export const addScheduledPost = async (sheetName: string, post: ScheduledPost): Promise<void> => {
    try {
        const newRow = [
            post.date,
            post.time,
            post.content,
            post.buttonLink,
            post.imageLink,
            post.status,
            post.exactTime,
        ];

        await appendSheet(`${sheetName}!A:G`, [newRow]);
    } catch (error) {
        console.error('Error adding scheduled post:', error);
        throw error;
    }
};
