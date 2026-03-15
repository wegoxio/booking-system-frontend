export interface LoginPayload {
    email: string;
    password: string;
    captcha_token?: string;
}

export interface AuthAccessTokenResponse {
    access_token: string;
}

export type LoginResponse = AuthAccessTokenResponse;
export type RefreshResponse = AuthAccessTokenResponse;

export interface LogoutResponse {
    success: true;
}

export interface LogoutAllResponse {
    success: true;
    revoked_sessions: number;
}
