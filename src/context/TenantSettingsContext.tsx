"use client";

import { useAuth } from "@/context/AuthContext";
import { defaultTenantSettings } from "@/modules/settings/config/default-tenant-settings";
import {
  tenantSettingsService,
  type TenantSettingsAssetType,
} from "@/modules/settings/services/tenant-settings.service";
import type {
  TenantBrandingSettings,
  TenantSettings,
  TenantSettingsRecord,
  TenantThemeSettings,
  UpdateTenantSettingsPayload,
} from "@/types/tenant-settings.types";
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

type TenantSettingsContextType = {
  settings: TenantSettings;
  canEditTenantSettings: boolean;
  isLoadingSettings: boolean;
  isSavingSettings: boolean;
  errorMessage: string;
  refreshSettings: () => Promise<void>;
  saveSettings: (payload: UpdateTenantSettingsPayload) => Promise<void>;
  updateTheme: (patch: Partial<TenantThemeSettings>) => Promise<void>;
  updateBranding: (patch: Partial<TenantBrandingSettings>) => Promise<void>;
  uploadBrandingAsset: (
    assetType: TenantSettingsAssetType,
    file: File,
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
};

const TenantSettingsContext = createContext<TenantSettingsContextType | undefined>(undefined);

function mergeWithDefaults(input: unknown): TenantSettings {
  if (!input || typeof input !== "object") {
    return defaultTenantSettings;
  }

  const parsed = input as Partial<TenantSettings>;
  return {
    theme: {
      ...defaultTenantSettings.theme,
      ...(parsed.theme ?? {}),
    },
    branding: {
      ...defaultTenantSettings.branding,
      ...(parsed.branding ?? {}),
    },
  };
}

function toTenantSettings(record: TenantSettingsRecord): TenantSettings {
  return mergeWithDefaults({
    theme: record.theme,
    branding: record.branding,
  });
}

function setFavicon(url: string) {
  const fallbackFavicon = "/favicon.ico";
  const nextUrl = url.trim() || fallbackFavicon;
  let faviconElement = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

  if (!faviconElement) {
    faviconElement = document.createElement("link");
    faviconElement.rel = "icon";
    document.head.appendChild(faviconElement);
  }

  faviconElement.href = nextUrl;
}

function applyThemeVariables(theme: TenantThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty("--app-bg", theme.appBg);
  root.style.setProperty("--shell-bg", theme.shellBg);
  root.style.setProperty("--sidebar-bg-start", theme.sidebarBgStart);
  root.style.setProperty("--sidebar-bg-end", theme.sidebarBgEnd);
  root.style.setProperty("--sidebar-text", theme.sidebarText);
  root.style.setProperty("--sidebar-active-bg", theme.sidebarActiveBg);
  root.style.setProperty("--sidebar-active-text", theme.sidebarActiveText);
  root.style.setProperty("--navbar-bg", theme.navbarBg);
  root.style.setProperty("--navbar-border", theme.navbarBorder);
  root.style.setProperty("--icon-button-bg", theme.iconButtonBg);
  root.style.setProperty("--icon-button-border", theme.iconButtonBorder);
  root.style.setProperty("--icon-button-text", theme.iconButtonText);
  root.style.setProperty("--card-bg", theme.cardBg);
  root.style.setProperty("--card-border", theme.cardBorder);
  root.style.setProperty("--text-primary", theme.textPrimary);
  root.style.setProperty("--text-muted", theme.textMuted);
  root.style.setProperty("--primary-accent", theme.primaryAccent);
  root.style.setProperty("--primary-accent-text", theme.primaryAccentText);
}

type PersistTarget =
  | {
      mode: "mine";
    }
  | {
      mode: "platform";
    };

export function TenantSettingsProvider({ children }: { children: ReactNode }) {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const [settings, setSettings] = useState<TenantSettings>(defaultTenantSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestIdRef = useRef(0);

  const canEditTenantSettings =
    user?.role === "TENANT_ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    applyThemeVariables(settings.theme);
    document.title = settings.branding.windowTitle.trim() || defaultTenantSettings.branding.windowTitle;
    setFavicon(settings.branding.faviconUrl);
  }, [settings]);

  const resolvePersistTarget = useCallback((): PersistTarget | null => {
    if (!user) return null;

    if (user.role === "TENANT_ADMIN") {
      return user.tenant_id ? { mode: "mine" } : null;
    }

    if (user.role === "SUPER_ADMIN") {
      return { mode: "platform" };
    }

    return null;
  }, [user]);

  const loadSettings = useCallback(async () => {
    if (isAuthLoading) return;

    if (!token || !canEditTenantSettings) {
      setSettings(defaultTenantSettings);
      return;
    }

    const target = resolvePersistTarget();
    if (!target) {
      setSettings(defaultTenantSettings);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoadingSettings(true);
    setErrorMessage("");

    try {
      const record =
        target.mode === "mine"
          ? await tenantSettingsService.findMine(token)
          : await tenantSettingsService.findPlatform(token);

      if (requestId !== requestIdRef.current) return;
      setSettings(toTenantSettings(record));
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los tenant settings.";
      setErrorMessage(message);
      setSettings(defaultTenantSettings);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingSettings(false);
      }
    }
  }, [isAuthLoading, token, canEditTenantSettings, resolvePersistTarget]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const persistPatch = useCallback(
    async (payload: UpdateTenantSettingsPayload, optimisticSettings: TenantSettings) => {
      if (!token) {
        throw new Error("No hay token de autenticacion.");
      }

      const target = resolvePersistTarget();
      if (!target) {
        throw new Error(
          user?.role === "SUPER_ADMIN"
            ? "No se encontro contexto de plataforma para SUPER_ADMIN."
            : "No hay tenant asociado para editar settings.",
        );
      }

      const previousSettings = settings;
      setSettings(optimisticSettings);
      setIsSavingSettings(true);
      setErrorMessage("");

      try {
        const updatedRecord =
          target.mode === "mine"
            ? await tenantSettingsService.updateMine(payload, token)
            : await tenantSettingsService.updatePlatform(payload, token);
        setSettings(toTenantSettings(updatedRecord));
      } catch (error) {
        setSettings(previousSettings);
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron guardar los tenant settings.";
        setErrorMessage(message);
        throw error;
      } finally {
        setIsSavingSettings(false);
      }
    },
    [resolvePersistTarget, settings, token, user?.role],
  );

  const updateTheme = useCallback(
    async (patch: Partial<TenantThemeSettings>) => {
      const optimisticSettings: TenantSettings = {
        ...settings,
        theme: {
          ...settings.theme,
          ...patch,
        },
      };
      await persistPatch({ theme: patch }, optimisticSettings);
    },
    [settings, persistPatch],
  );

  const updateBranding = useCallback(
    async (patch: Partial<TenantBrandingSettings>) => {
      const optimisticSettings: TenantSettings = {
        ...settings,
        branding: {
          ...settings.branding,
          ...patch,
        },
      };
      await persistPatch({ branding: patch }, optimisticSettings);
    },
    [settings, persistPatch],
  );

  const uploadBrandingAsset = useCallback(
    async (assetType: TenantSettingsAssetType, file: File) => {
      if (!token) {
        throw new Error("No hay token de autenticacion.");
      }

      const target = resolvePersistTarget();
      if (!target) {
        throw new Error(
          user?.role === "SUPER_ADMIN"
            ? "No se encontro contexto de plataforma para SUPER_ADMIN."
            : "No hay tenant asociado para subir assets.",
        );
      }

      setIsSavingSettings(true);
      setErrorMessage("");
      try {
        const updatedRecord =
          target.mode === "mine"
            ? await tenantSettingsService.uploadMineAsset(assetType, file, token)
            : await tenantSettingsService.uploadPlatformAsset(
                assetType,
                file,
                token,
              );

        setSettings(toTenantSettings(updatedRecord));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo subir el archivo.";
        setErrorMessage(message);
        throw error;
      } finally {
        setIsSavingSettings(false);
      }
    },
    [resolvePersistTarget, token, user?.role],
  );

  const resetSettings = useCallback(async () => {
    const optimisticSettings = mergeWithDefaults(defaultTenantSettings);
    await persistPatch(
      {
        theme: { ...defaultTenantSettings.theme },
        branding: { ...defaultTenantSettings.branding },
      },
      optimisticSettings,
    );
  }, [persistPatch]);

  const saveSettings = useCallback(
    async (payload: UpdateTenantSettingsPayload) => {
      const optimisticSettings = mergeWithDefaults({
        theme: {
          ...settings.theme,
          ...(payload.theme ?? {}),
        },
        branding: {
          ...settings.branding,
          ...(payload.branding ?? {}),
        },
      });

      await persistPatch(payload, optimisticSettings);
    },
    [persistPatch, settings],
  );

  const value = useMemo(
    () => ({
      settings,
      canEditTenantSettings,
      isLoadingSettings,
      isSavingSettings,
      errorMessage,
      refreshSettings: loadSettings,
      saveSettings,
      updateTheme,
      updateBranding,
      uploadBrandingAsset,
      resetSettings,
    }),
    [
      settings,
      canEditTenantSettings,
      isLoadingSettings,
      isSavingSettings,
      errorMessage,
      loadSettings,
      saveSettings,
      updateTheme,
      updateBranding,
      uploadBrandingAsset,
      resetSettings,
    ],
  );

  return <TenantSettingsContext.Provider value={value}>{children}</TenantSettingsContext.Provider>;
}

export function useTenantSettings() {
  const context = useContext(TenantSettingsContext);

  if (!context) {
    throw new Error("useTenantSettings debe usarse dentro de TenantSettingsProvider");
  }

  return context;
}
