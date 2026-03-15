import { apiFetch } from "@/modules/http/services/api";
import {
    LoginPayload,
    LoginResponse,
    LogoutAllResponse,
    LogoutResponse,
    RefreshResponse,
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
    }
}
