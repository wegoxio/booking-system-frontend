import { apiFetch } from "@/modules/http/services/api";
import { LoginPayload, LoginResponse } from "@/types/auth.types";
import { User } from "@/types/user.types";

export const authService = {
    login: async(payload: LoginPayload): Promise<LoginResponse> =>{
        return apiFetch<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },
    getAuthenticatedUser: async(token: string):Promise<User>=>{
        return apiFetch<User>("/auth/me",{
            method:"GET",
            token
        })
    }
}