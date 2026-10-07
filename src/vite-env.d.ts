/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PLATFORM_API_URL: string;
    readonly VITE_SIGN_UP_ENDPOINT_PATH: string;
    readonly VITE_SIGN_IN_ENDPOINT_PATH: string;
    readonly VITE_FORGOT_PASSWORD_ENDPOINT_PATH: string;
    readonly VITE_RESET_PASSWORD_ENDPOINT_PATH: string;
    readonly VITE_USERS_ENDPOINT_PATH: string;
    readonly VITE_INVOICES_ENDPOINT_PATH: string;
    readonly VITE_AUCTIONS_ENDPOINT_PATH: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
