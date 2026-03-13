"use client";

import { useAuth } from "@/context/AuthContext";
import { useTenantSettings } from "@/context/TenantSettingsContext";
import { defaultTenantSettings } from "@/modules/settings/config/default-tenant-settings";
import ConfirmActionModal from "@/modules/ui/ConfirmActionModal";
import type {
  TenantBrandingSettings,
  TenantThemeSettings,
  UpdateTenantSettingsPayload,
} from "@/types/tenant-settings.types";
import { LoaderCircle, Paintbrush, RotateCcw, Sparkles, Upload } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const themeColorFields: Array<{
  key: keyof TenantThemeSettings;
  label: string;
}> = [
  { key: "appBg", label: "Fondo app" },
  { key: "shellBg", label: "Fondo shell" },
  { key: "sidebarBgStart", label: "Sidebar inicio" },
  { key: "sidebarBgEnd", label: "Sidebar fin" },
  { key: "sidebarActiveBg", label: "Sidebar activo (fondo)" },
  { key: "sidebarActiveText", label: "Sidebar activo (texto)" },
  { key: "navbarBg", label: "Navbar fondo" },
  { key: "navbarBorder", label: "Navbar borde" },
  { key: "iconButtonBg", label: "Icono fondo" },
  { key: "iconButtonBorder", label: "Icono borde" },
  { key: "iconButtonText", label: "Icono texto" },
  { key: "cardBg", label: "Cards fondo" },
  { key: "cardBorder", label: "Cards borde" },
  { key: "textPrimary", label: "Texto principal" },
  { key: "textMuted", label: "Texto secundario" },
  { key: "primaryAccent", label: "Color primario" },
  { key: "primaryAccentText", label: "Texto primario" },
];

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,.svg,.ico,image/*";

const DEFAULT_APP_NAME = defaultTenantSettings.branding.appName;
const DEFAULT_WINDOW_TITLE = defaultTenantSettings.branding.windowTitle;
const DEFAULT_LOGO_URL = defaultTenantSettings.branding.logoUrl;
const DEFAULT_FAVICON_URL = defaultTenantSettings.branding.faviconUrl;

type BrandingDraftState = {
  appName: string;
  windowTitle: string;
};

function normalizeBrandingDraft(draft: BrandingDraftState): BrandingDraftState {
  return {
    appName: draft.appName.trim() || DEFAULT_APP_NAME,
    windowTitle: draft.windowTitle.trim() || DEFAULT_WINDOW_TITLE,
  };
}

export default function TenantSettingsPanel() {
  const { user } = useAuth();
  const {
    settings,
    canEditTenantSettings,
    isLoadingSettings,
    isSavingSettings,
    errorMessage,
    saveSettings,
    uploadBrandingAsset,
  } = useTenantSettings();

  const [themeDraft, setThemeDraft] = useState<TenantThemeSettings>(settings.theme);
  const [brandingDraft, setBrandingDraft] = useState<BrandingDraftState>({
    appName: settings.branding.appName,
    windowTitle: settings.branding.windowTitle,
  });

  const [logoPreview, setLogoPreview] = useState(settings.branding.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState(settings.branding.faviconUrl);

  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingFaviconFile, setPendingFaviconFile] = useState<File | null>(null);

  const [useDefaultLogo, setUseDefaultLogo] = useState(false);
  const [useDefaultFavicon, setUseDefaultFavicon] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  const tempLogoUrlRef = useRef<string | null>(null);
  const tempFaviconUrlRef = useRef<string | null>(null);

  const persistenceScopeLabel =
    user?.role === "SUPER_ADMIN"
      ? "la plataforma global de Wegox"
      : "tu tenant";

  const revokeTempLogoUrl = useCallback(() => {
    if (!tempLogoUrlRef.current) return;
    URL.revokeObjectURL(tempLogoUrlRef.current);
    tempLogoUrlRef.current = null;
  }, []);

  const revokeTempFaviconUrl = useCallback(() => {
    if (!tempFaviconUrlRef.current) return;
    URL.revokeObjectURL(tempFaviconUrlRef.current);
    tempFaviconUrlRef.current = null;
  }, []);

  const syncDraftFromSettings = useCallback(() => {
    setThemeDraft(settings.theme);
    setBrandingDraft({
      appName: settings.branding.appName,
      windowTitle: settings.branding.windowTitle,
    });

    revokeTempLogoUrl();
    revokeTempFaviconUrl();

    setLogoPreview(settings.branding.logoUrl);
    setFaviconPreview(settings.branding.faviconUrl);

    setPendingLogoFile(null);
    setPendingFaviconFile(null);
    setUseDefaultLogo(false);
    setUseDefaultFavicon(false);
  }, [
    revokeTempFaviconUrl,
    revokeTempLogoUrl,
    settings.branding.appName,
    settings.branding.faviconUrl,
    settings.branding.logoUrl,
    settings.branding.windowTitle,
    settings.theme,
  ]);

  useEffect(() => {
    syncDraftFromSettings();
  }, [syncDraftFromSettings]);

  useEffect(() => {
    return () => {
      revokeTempLogoUrl();
      revokeTempFaviconUrl();
    };
  }, [revokeTempFaviconUrl, revokeTempLogoUrl]);

  const normalizedBrandingDraft = useMemo(
    () => normalizeBrandingDraft(brandingDraft),
    [brandingDraft],
  );

  const hasThemeChanges = useMemo(
    () =>
      themeColorFields.some(
        ({ key }) => themeDraft[key] !== settings.theme[key],
      ),
    [themeDraft, settings.theme],
  );

  const hasBrandingTextChanges =
    normalizedBrandingDraft.appName !== settings.branding.appName ||
    normalizedBrandingDraft.windowTitle !== settings.branding.windowTitle;

  const hasDefaultAssetChanges =
    (useDefaultLogo && settings.branding.logoUrl !== DEFAULT_LOGO_URL) ||
    (useDefaultFavicon && settings.branding.faviconUrl !== DEFAULT_FAVICON_URL);

  const hasPendingAssetUploads = !!pendingLogoFile || !!pendingFaviconFile;

  const hasUnsavedChanges =
    hasThemeChanges ||
    hasBrandingTextChanges ||
    hasDefaultAssetChanges ||
    hasPendingAssetUploads;

  const pendingSummary = useMemo(() => {
    const items: string[] = [];
    if (hasThemeChanges) items.push("paleta de colores");
    if (hasBrandingTextChanges) items.push("branding textual");
    if (hasDefaultAssetChanges) items.push("assets por defecto");
    if (hasPendingAssetUploads) items.push("imagenes nuevas");

    if (items.length === 0) return "No hay cambios pendientes.";
    return `Se aplicaran cambios en: ${items.join(", ")}.`;
  }, [
    hasBrandingTextChanges,
    hasDefaultAssetChanges,
    hasPendingAssetUploads,
    hasThemeChanges,
  ]);

  if (!canEditTenantSettings) {
    return (
      <section className="rounded-[28px] border border-[#e4e4e8] bg-[var(--card-bg)] p-6">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Settings</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Solo tenant admin y super admin pueden editar la apariencia del panel.
        </p>
      </section>
    );
  }

  const handleThemeColorChange = (
    key: keyof TenantThemeSettings,
    value: string,
  ) => {
    setThemeDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAssetUpload = (
    assetType: "logo" | "favicon",
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    if (assetType === "logo") {
      revokeTempLogoUrl();
      tempLogoUrlRef.current = objectUrl;
      setLogoPreview(objectUrl);
      setPendingLogoFile(file);
      setUseDefaultLogo(false);
      return;
    }

    revokeTempFaviconUrl();
    tempFaviconUrlRef.current = objectUrl;
    setFaviconPreview(objectUrl);
    setPendingFaviconFile(file);
    setUseDefaultFavicon(false);
  };

  const handleUseDefaultAsset = (assetType: "logo" | "favicon") => {
    if (assetType === "logo") {
      revokeTempLogoUrl();
      setPendingLogoFile(null);
      setUseDefaultLogo(true);
      setLogoPreview(DEFAULT_LOGO_URL);
      return;
    }

    revokeTempFaviconUrl();
    setPendingFaviconFile(null);
    setUseDefaultFavicon(true);
    setFaviconPreview(DEFAULT_FAVICON_URL);
  };

  const handleLoadDefaultsDraft = () => {
    setThemeDraft(defaultTenantSettings.theme);
    setBrandingDraft({
      appName: DEFAULT_APP_NAME,
      windowTitle: DEFAULT_WINDOW_TITLE,
    });
    handleUseDefaultAsset("logo");
    handleUseDefaultAsset("favicon");
  };

  const handleDiscardDraft = () => {
    syncDraftFromSettings();
  };

  const handleConfirmApply = async () => {
    if (!hasUnsavedChanges) {
      setIsConfirmModalOpen(false);
      return;
    }

    setIsApplyingChanges(true);
    try {
      const payload: UpdateTenantSettingsPayload = {};

      if (hasThemeChanges) {
        payload.theme = { ...themeDraft };
      }

      const brandingPatch: Partial<TenantBrandingSettings> = {};

      if (hasBrandingTextChanges) {
        brandingPatch.appName = normalizedBrandingDraft.appName;
        brandingPatch.windowTitle = normalizedBrandingDraft.windowTitle;
      }

      if (useDefaultLogo && settings.branding.logoUrl !== DEFAULT_LOGO_URL) {
        brandingPatch.logoUrl = DEFAULT_LOGO_URL;
      }

      if (useDefaultFavicon && settings.branding.faviconUrl !== DEFAULT_FAVICON_URL) {
        brandingPatch.faviconUrl = DEFAULT_FAVICON_URL;
      }

      if (Object.keys(brandingPatch).length > 0) {
        payload.branding = brandingPatch;
      }

      if (payload.theme || payload.branding) {
        await saveSettings(payload);
      }

      if (pendingLogoFile) {
        await uploadBrandingAsset("logo", pendingLogoFile);
      }

      if (pendingFaviconFile) {
        await uploadBrandingAsset("favicon", pendingFaviconFile);
      }

      setIsConfirmModalOpen(false);
    } catch {
      // Error is handled by context through errorMessage.
    } finally {
      setIsApplyingChanges(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[0_18px_40px_rgba(22,31,57,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f2e2b4] bg-[#fff6dd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9c6a00]">
              <Sparkles className="h-3.5 w-3.5" />
              Tenant personalization
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              Panel Settings
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Editas un borrador local. Solo se guarda al confirmar para {persistenceScopeLabel}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(isLoadingSettings || isSavingSettings || isApplyingChanges) && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs text-[#5a6171]">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                {isLoadingSettings ? "Cargando..." : "Guardando..."}
              </span>
            )}
            <button
              type="button"
              onClick={handleLoadDefaultsDraft}
              disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d8dae1] bg-white px-4 py-2.5 text-sm font-medium text-[#434a59] disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Cargar defaults
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              disabled={!hasUnsavedChanges || isLoadingSettings || isSavingSettings || isApplyingChanges}
              className="rounded-xl border border-[#d8dae1] bg-white px-4 py-2.5 text-sm font-medium text-[#434a59] disabled:opacity-60"
            >
              Descartar borrador
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={!hasUnsavedChanges || isLoadingSettings || isSavingSettings || isApplyingChanges}
              className="rounded-xl bg-[var(--primary-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-accent-text)] disabled:opacity-60"
            >
              Confirmar cambios
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-[var(--text-muted)]">{pendingSummary}</p>
      </div>

      {errorMessage && (
        <p className="rounded-2xl border border-[#f3c9c9] bg-[#fff4f4] px-4 py-3 text-sm text-[#ab3d3d]">
          {errorMessage}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
          <div className="mb-4 flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-[var(--text-muted)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Paleta global (CSS variables)
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {themeColorFields.map((field) => (
              <label
                key={field.key}
                className="rounded-2xl border border-[var(--card-border)] bg-white p-3"
              >
                <span className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                  {field.label}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeDraft[field.key]}
                    onChange={(event) =>
                      handleThemeColorChange(field.key, event.target.value)
                    }
                    className="h-9 w-11 cursor-pointer rounded-md border border-[var(--card-border)]"
                    disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                  />
                  <input
                    type="text"
                    value={themeDraft[field.key]}
                    readOnly
                    className="min-w-0 flex-1 rounded-xl border border-[var(--card-border)] bg-[#f8fafc] px-3 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Branding</h3>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[var(--text-muted)]">Nombre de app</span>
                <input
                  value={brandingDraft.appName}
                  onChange={(event) =>
                    setBrandingDraft((prev) => ({ ...prev, appName: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)]"
                  placeholder="Mi Tenant App"
                  disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[var(--text-muted)]">Title ventana</span>
                <input
                  value={brandingDraft.windowTitle}
                  onChange={(event) =>
                    setBrandingDraft((prev) => ({ ...prev, windowTitle: event.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)]"
                  placeholder="Mi Tenant - Admin"
                  disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Assets</h3>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">Logo</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[#f8fafc] p-2">
                    <img
                      src={logoPreview || DEFAULT_LOGO_URL}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#414857]">
                    <Upload className="h-3.5 w-3.5" />
                    Subir logo
                    <input
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(event) => handleAssetUpload("logo", event)}
                      disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUseDefaultAsset("logo")}
                    disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                    className="rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#414857]"
                  >
                    Usar default
                  </button>
                </div>
                {(pendingLogoFile || useDefaultLogo) && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {pendingLogoFile
                      ? "Logo pendiente de guardar."
                      : "Se aplicara el logo por defecto al confirmar."}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4">
                <p className="text-sm font-medium text-[var(--text-primary)]">Favicon</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-xl border border-[var(--card-border)] bg-[#f8fafc] p-2">
                    <img
                      src={faviconPreview || DEFAULT_FAVICON_URL}
                      alt="Favicon preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#414857]">
                    <Upload className="h-3.5 w-3.5" />
                    Subir favicon
                    <input
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(event) => handleAssetUpload("favicon", event)}
                      disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUseDefaultAsset("favicon")}
                    disabled={isLoadingSettings || isSavingSettings || isApplyingChanges}
                    className="rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#414857]"
                  >
                    Usar default
                  </button>
                </div>
                {(pendingFaviconFile || useDefaultFavicon) && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {pendingFaviconFile
                      ? "Favicon pendiente de guardar."
                      : "Se aplicara el favicon por defecto al confirmar."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Preview rapido</h3>
            <div
              className="mt-3 rounded-2xl border border-[var(--card-border)] p-4"
              style={{ backgroundColor: themeDraft.appBg }}
            >
              <div className="rounded-xl p-3" style={{ backgroundColor: themeDraft.shellBg }}>
                <div
                  className="rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: themeDraft.sidebarActiveBg,
                    color: themeDraft.sidebarActiveText,
                  }}
                >
                  {normalizedBrandingDraft.appName || "App Name"}
                </div>
                <p
                  className="mt-3 text-sm"
                  style={{ color: themeDraft.textPrimary }}
                >
                  {normalizedBrandingDraft.windowTitle || "Window title"}
                </p>
                <p className="text-xs" style={{ color: themeDraft.textMuted }}>
                  Vista previa local. Se aplica globalmente al confirmar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        title="Confirmar cambios de settings"
        description={`${pendingSummary} Esta accion actualizara la configuracion visual del panel.`}
        checkboxLabel="Confirmo que deseo aplicar estos cambios de apariencia."
        confirmText="Aplicar cambios"
        isConfirming={isApplyingChanges || isSavingSettings}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          void handleConfirmApply();
        }}
      />
    </section>
  );
}
