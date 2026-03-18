"use client";

import { authService } from "@/modules/auth/services/auth.service";
import {
  clearSessionTokens,
  getAccessToken,
  onAccessTokenChange,
  setAccessToken,
  syncCsrfTokenFromCookie,
} from "@/modules/auth/services/auth-session.service";
import { refreshAccessTokenWithStoredRefreshToken } from "@/modules/http/services/api";
import { LoginPayload } from "@/types/auth.types";
import { User } from "@/types/user.types";
import { toast } from "react-hot-toast";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllSessions: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const hasInitializedRef = useRef(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // No bloqueamos logout local si backend no responde.
    } finally {
      clearSessionTokens();
      setUser(null);
      setIsLoggingOut(false);
      toast.success("Sesion cerrada.");
    }
  }, []);

  const logoutAllSessions = useCallback(async () => {
    const activeToken = getAccessToken();
    if (!activeToken) {
      await logout();
      return;
    }

    setIsLoggingOut(true);
    try {
      await authService.logoutAll(activeToken);
      clearSessionTokens();
      setUser(null);
      toast.success("Todas las sesiones fueron cerradas.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cerrar todas las sesiones.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  const login = useCallback(async ({ email, password, captcha_token }: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password, captcha_token });
      setAccessToken(response.access_token);
      syncCsrfTokenFromCookie();

      const me = await authService.getAuthenticatedUser(response.access_token);
      setUser(me);
      toast.success(`Bienvenido, ${me.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesion.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = getAccessToken();
    if (!activeToken) return;

    const me = await authService.getAuthenticatedUser(activeToken);
    setUser(me);
  }, []);

  useEffect(() => {
    const unsubscribe = onAccessTokenChange((nextToken) => {
      setToken(nextToken);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshedAccessToken =
          await refreshAccessTokenWithStoredRefreshToken();

        if (!refreshedAccessToken) {
          setUser(null);
          setIsLoading(false);
          hasInitializedRef.current = true;
          return;
        }

        const me = await authService.getAuthenticatedUser(refreshedAccessToken);
        setUser(me);
      } catch (error) {
        console.error("Error restaurando sesion:", error);
        clearSessionTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
        hasInitializedRef.current = true;
      }
    };

    void restoreSession();
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (isLoading || isLoggingOut) return;
    if (!token && user) {
      setUser(null);
      toast.error("Sesion expirada. Inicia sesion nuevamente.");
    }
  }, [isLoading, isLoggingOut, token, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      logoutAllSessions,
      refreshUser,
    }),
    [user, token, isLoading, login, logout, logoutAllSessions, refreshUser],
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
