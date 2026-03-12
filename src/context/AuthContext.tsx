"use client";

import { authService } from "@/modules/auth/services/auth.service";
import { LoginPayload } from "@/types/auth.types";
import { User } from "@/types/user.types";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginPayload) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const login = async ({ email, password }: LoginPayload) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setToken(response.access_token);
            localStorage.setItem(TOKEN_KEY, response.access_token);

            const me = await authService.getAuthenticatedUser(response.access_token);
            setUser(me);
        } finally {
            setIsLoading(false);
        }
    }

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
    }

    const refreshUser = useCallback(async () => {
        if (!token) return;

        const me = await authService.getAuthenticatedUser(token);
        setUser(me);
    }, [token]);
    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedToken = localStorage.getItem(TOKEN_KEY);

                if (!savedToken) {
                    setIsLoading(false);
                    return;
                }

                setToken(savedToken);

                const me = await authService.getAuthenticatedUser(savedToken);
                setUser(me);
            } catch (error) {
                console.error("Error restaurando sesión:", error);
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            logout,
            refreshUser,
        }),
        [user, token, isLoading, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }

    return context;
}

