import { apiFetch } from "@/modules/http/services/api";
import {
    CompletePasswordResetPayload,
    CompletePasswordResetResponse,
    CompleteTenantAdminOnboardingPayload,
    CompleteTenantAdminOnboardingResponse,
    GenericSuccessResponse,
    LoginPayload,
    LoginResponse,
    LogoutAllResponse,
    LogoutResponse,
    RequestPasswordResetPayload,
    RefreshResponse,
    ResolvePasswordResetPayload,
    ResolvePasswordResetResponse,
    ResolveTenantAdminOnboardingPayload,
    ResolveTenantAdminOnboardingResponse,
} from "@/types/auth.types";
import { User } from "@/types/user.types";

export const authService = {
    login: async(payload: LoginPayload): Promise<LoginResponse> =>{
        return apiFetch<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
            skipAuthRefresh: true,
        })
    },
    refresh: async(): Promise<RefreshResponse> => {
        return apiFetch<RefreshResponse>("/auth/refresh", {
            method: "POST",
            skipAuthRefresh: true,
        });
    },
    logout: async(): Promise<LogoutResponse> => {
        return apiFetch<LogoutResponse>("/auth/logout", {
            method: "POST",
            skipAuthRefresh: true,
        });
    },
    logoutAll: async(token: string): Promise<LogoutAllResponse> => {
        return apiFetch<LogoutAllResponse>("/auth/logout-all", {
            method: "POST",
            token,
            skipAuthRefresh: true,
        });
    },
    getAuthenticatedUser: async(token: string):Promise<User>=>{
        return apiFetch<User>("/auth/me",{
            method:"GET",
            token
        })
    },
    requestPasswordReset: async(
        payload: RequestPasswordResetPayload,
    ): Promise<GenericSuccessResponse> => {
        return apiFetch<GenericSuccessResponse>("/auth/password/forgot", {
            method: "POST",
            body: JSON.stringify(payload),
            skipAuthRefresh: true,
        });
    },
    resolvePasswordReset: async(
        payload: ResolvePasswordResetPayload,
    ): Promise<ResolvePasswordResetResponse> => {
        return apiFetch<ResolvePasswordResetResponse>("/auth/password/reset/resolve", {
            method: "POST",
            body: JSON.stringify(payload),
            skipAuthRefresh: true,
        });
    },
    completePasswordReset: async(
        payload: CompletePasswordResetPayload,
    ): Promise<CompletePasswordResetResponse> => {
        return apiFetch<CompletePasswordResetResponse>("/auth/password/reset/complete", {
            method: "POST",
            body: JSON.stringify(payload),
            skipAuthRefresh: true,
        });
    },
    resolveTenantAdminOnboarding: async(
        payload: ResolveTenantAdminOnboardingPayload,
    ): Promise<ResolveTenantAdminOnboardingResponse> => {
        return apiFetch<ResolveTenantAdminOnboardingResponse>(
            "/auth/tenant-admin/onboarding/resolve",
            {
                method: "POST",
                body: JSON.stringify(payload),
                skipAuthRefresh: true,
            },
        );
    },
    completeTenantAdminOnboarding: async(
        payload: CompleteTenantAdminOnboardingPayload,
    ): Promise<CompleteTenantAdminOnboardingResponse> => {
        return apiFetch<CompleteTenantAdminOnboardingResponse>(
            "/auth/tenant-admin/onboarding/complete",
            {
                method: "POST",
                body: JSON.stringify(payload),
                skipAuthRefresh: true,
            },
        );
    },
}
