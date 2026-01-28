/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_GOOGLE_API_KEY: string
    readonly VITE_SPREADSHEET_ID: string
    readonly VITE_TELEGRAM_BOT_TOKEN: string
    readonly VITE_TELEGRAM_CHAT_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
export { }
