export interface LoginPayload {
    email: string;
    password: string;
    captcha_token?: string;
}

export interface RequestPasswordResetPayload {
    email: string;
}

export interface ResolvePasswordResetPayload {
    token: string;
}

export interface CompletePasswordResetPayload {
    token: string;
    password: string;
}

export interface ResolveTenantAdminOnboardingPayload {
    token: string;
}

export interface CompleteTenantAdminOnboardingPayload {
    token: string;
    name: string;
    password: string;
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

export interface GenericSuccessResponse {
    success: true;
}

export interface ResolvePasswordResetResponse {
    email: string;
    name: string;
    expires_at: string;
}

export interface CompletePasswordResetResponse {
    success: true;
    email: string;
}

export interface ResolveTenantAdminOnboardingResponse {
    email: string;
    name: string;
    tenant: {
        id: string;
        name: string;
        slug: string;
    };
    expires_at: string;
    email_verified_at: string;
}

export interface CompleteTenantAdminOnboardingResponse {
    success: true;
    email: string;
}

export interface CompleteTenantDashboardTourResponse {
    success: true;
    completed_at: string | null;
}
