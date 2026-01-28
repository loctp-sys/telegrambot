// Google Sheets Configuration
export const GOOGLE_CONFIG = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    spreadsheetId: import.meta.env.VITE_SPREADSHEET_ID || '',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
};

// Telegram Configuration
export const TELEGRAM_CONFIG = {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
};

// Sheet Names
export const SHEET_NAMES = {
    OFFERS: 'Offers',
    SCHEDULE: 'Schedule',
    ANALYTICS: 'Analytics',
};

// App Configuration
export const APP_CONFIG = {
    name: 'Fintech Dashboard',
    version: '1.0.0',
    description: 'Hệ thống quản lý tài chính và kho vay',
};
