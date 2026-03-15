"use client";

import { useTenantSettings } from "@/context/TenantSettingsContext";
import { defaultTenantSettings } from "@/modules/settings/config/default-tenant-settings";
import {
  getTenantAssetMaxSizeLabel,
  TENANT_SETTINGS_IMAGE_ACCEPT,
  validateTenantSettingsAssetFile,
} from "@/modules/settings/services/tenant-settings.service";
import {
  createThemeVariables,
  normalizeThemeSettings,
} from "@/modules/settings/utils/theme-colors";
import ConfirmActionModal from "@/modules/ui/ConfirmActionModal";
import type {
  TenantThemeSettings,
  UpdateTenantSettingsPayload,
} from "@/types/tenant-settings.types";
import {
  AlertTriangle,
  ChevronDown,
  ImageIcon,
  LoaderCircle,
  Palette,
  RotateCcw,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";
import {
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type EditableThemeKey =
  | "primary"
  | "secondary"
  | "tertiary"
  | "textPrimary"
  | "textSecondary";

type PanelSectionKey = "palette" | "branding" | "assets";

const editableThemeFields: Array<{
  key: EditableThemeKey;
  label: string;
  description: string;
}> = [
  {
    key: "primary",
    label: "Accent principal",
    description: "Botones, CTAs y acciones importantes.",
  },
  {
    key: "secondary",
    label: "Canvas del panel",
    description: "Base del dashboard, cards y fondos suaves.",
  },
  {
    key: "tertiary",
    label: "Sidebar / chrome",
    description: "Estructura visual y contraste oscuro.",
  },
  {
    key: "textPrimary",
    label: "Texto principal",
    description: "Titulos y lectura principal.",
  },
  {
    key: "textSecondary",
    label: "Texto de soporte",
    description: "Labels, metadata y contexto.",
  },
];

const settingsDemoChartData = [
  { label: "Ene", revenue: 540, bookings: 430, cancelled: 120 },
  { label: "Feb", revenue: 690, bookings: 510, cancelled: 140 },
  { label: "Mar", revenue: 620, bookings: 570, cancelled: 110 },
  { label: "Abr", revenue: 780, bookings: 630, cancelled: 150 },
  { label: "May", revenue: 710, bookings: 590, cancelled: 130 },
  { label: "Jun", revenue: 860, bookings: 660, cancelled: 170 },
];

const HEX_6 = /^#([0-9a-fA-F]{6})$/;
const HEX_3 = /^#([0-9a-fA-F]{3})$/;
const LOGO_MAX_SIZE_LABEL = getTenantAssetMaxSizeLabel("logo");
const FAVICON_MAX_SIZE_LABEL = getTenantAssetMaxSizeLabel("favicon");

function normalizeColorInput(value: string | undefined) {
  if (!value) return "#000000";
  const normalized = value.trim();
  if (HEX_6.test(normalized)) return normalized.toLowerCase();
  const match = HEX_3.exec(normalized);
  if (!match) return "#000000";
  const [r, g, b] = match[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

function equalEditableTheme(a: TenantThemeSettings, b: TenantThemeSettings) {
  return editableThemeFields.every(({ key }) => a[key] === b[key]);
}

function SectionCard({
  title,
  description,
  icon,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-card-border bg-card p-5 shadow-theme-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="mt-0.5 rounded-2xl border border-card-border bg-surface p-2 text-fg-secondary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-fg-strong">{title}</h3>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out ${
          isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </article>
  );
}

export default function TenantSettingsPanel() {
  const {
    settings,
    canEditTenantSettings,
    isLoadingSettings,
    isSavingSettings,
    errorMessage,
    saveSettings,
    uploadBrandingAsset,
  } = useTenantSettings();

  const [themeDraft, setThemeDraft] = useState<TenantThemeSettings>(() =>
    normalizeThemeSettings(settings.theme),
  );
  const [brandingDraft, setBrandingDraft] = useState({
    appName: settings.branding.appName,
    windowTitle: settings.branding.windowTitle,
  });
  const [logoPreview, setLogoPreview] = useState(settings.branding.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState(settings.branding.faviconUrl);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingFaviconFile, setPendingFaviconFile] = useState<File | null>(null);
  const [useDefaultLogo, setUseDefaultLogo] = useState(false);
  const [useDefaultFavicon, setUseDefaultFavicon] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<PanelSectionKey, boolean>>({
    palette: true,
    branding: false,
    assets: false,
  });

  const tempLogoUrlRef = useRef<string | null>(null);
  const tempFaviconUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setThemeDraft(normalizeThemeSettings(settings.theme));
    setBrandingDraft({
      appName: settings.branding.appName,
      windowTitle: settings.branding.windowTitle,
    });

    if (tempLogoUrlRef.current) {
      URL.revokeObjectURL(tempLogoUrlRef.current);
      tempLogoUrlRef.current = null;
    }
    if (tempFaviconUrlRef.current) {
      URL.revokeObjectURL(tempFaviconUrlRef.current);
      tempFaviconUrlRef.current = null;
    }

    setLogoPreview(settings.branding.logoUrl);
    setFaviconPreview(settings.branding.faviconUrl);
    setPendingLogoFile(null);
    setPendingFaviconFile(null);
    setUseDefaultLogo(false);
    setUseDefaultFavicon(false);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (tempLogoUrlRef.current) URL.revokeObjectURL(tempLogoUrlRef.current);
      if (tempFaviconUrlRef.current) URL.revokeObjectURL(tempFaviconUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!errorMessage) return;
    toast.error(errorMessage, { id: "tenant-settings-error" });
  }, [errorMessage]);

  const previewTheme = useMemo(
    () => createThemeVariables(themeDraft, "AUTO", {}),
    [themeDraft],
  );
  const previewStyle = useMemo(() => previewTheme as CSSProperties, [previewTheme]);
  const previewShellStyle = useMemo(
    () => ({ backgroundColor: previewTheme["--shell-bg"] }),
    [previewTheme],
  );
  const previewSidebarStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(180deg, ${previewTheme["--sidebar-bg-start"]}, ${previewTheme["--tertiary-hover"]})`,
      color: previewTheme["--sidebar-text"],
    }),
    [previewTheme],
  );
  const previewSidebarItemStyle = useMemo(
    () => ({
      backgroundColor: previewTheme["--inverse-10"],
      color: previewTheme["--inverse-80"],
    }),
    [previewTheme],
  );
  const previewSidebarActiveStyle = useMemo(
    () => ({
      backgroundColor: previewTheme["--primary-accent"],
      color: previewTheme["--primary-accent-text"],
      boxShadow: previewTheme["--shadow-accent-sm"],
    }),
    [previewTheme],
  );

  const brandingPreviewName =
    brandingDraft.appName.trim() || defaultTenantSettings.branding.appName;
  const brandingPreviewTitle =
    brandingDraft.windowTitle.trim() || defaultTenantSettings.branding.windowTitle;
  const hasThemeChanges = !equalEditableTheme(themeDraft, settings.theme);
  const hasBrandingChanges =
    brandingPreviewName !== settings.branding.appName ||
    brandingPreviewTitle !== settings.branding.windowTitle;
  const hasDefaultAssetChanges =
    (useDefaultLogo && settings.branding.logoUrl !== defaultTenantSettings.branding.logoUrl) ||
    (useDefaultFavicon && settings.branding.faviconUrl !== defaultTenantSettings.branding.faviconUrl);
  const hasAssetUploads = !!pendingLogoFile || !!pendingFaviconFile;
  const hasChanges =
    hasThemeChanges || hasBrandingChanges || hasDefaultAssetChanges || hasAssetUploads;
  const willReturnToSimplifiedMode = hasThemeChanges && settings.themeMode !== "AUTO";
  const hasAdvancedThemeActive =
    settings.themeMode === "ADVANCED" && Object.keys(settings.themeOverrides).length > 0;
  const isBusy = isLoadingSettings || isSavingSettings || isApplying;

  const pendingItems = [
    hasThemeChanges && "paleta",
    hasBrandingChanges && "branding",
    hasDefaultAssetChanges && "restauracion de assets",
    hasAssetUploads && "nuevas imagenes",
    willReturnToSimplifiedMode && "modo simplificado",
  ]
    .filter(Boolean)
    .join(", ");

  const applyEditableThemeField = (key: EditableThemeKey, value: string) => {
    setThemeDraft((current) =>
      normalizeThemeSettings({
        ...current,
        [key]: value,
      }),
    );
  };

  const toggleSection = (section: PanelSectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const syncFromSettings = () => {
    setThemeDraft(normalizeThemeSettings(settings.theme));
    setBrandingDraft({
      appName: settings.branding.appName,
      windowTitle: settings.branding.windowTitle,
    });
    setLogoPreview(settings.branding.logoUrl);
    setFaviconPreview(settings.branding.faviconUrl);
    setPendingLogoFile(null);
    setPendingFaviconFile(null);
    setUseDefaultLogo(false);
    setUseDefaultFavicon(false);
    toast.success("Cambios descartados.");
  };

  const loadDefaults = () => {
    setThemeDraft(normalizeThemeSettings(defaultTenantSettings.theme));
    setBrandingDraft({
      appName: defaultTenantSettings.branding.appName,
      windowTitle: defaultTenantSettings.branding.windowTitle,
    });
    setUseDefaultLogo(true);
    setUseDefaultFavicon(true);
    setLogoPreview(defaultTenantSettings.branding.logoUrl);
    setFaviconPreview(defaultTenantSettings.branding.faviconUrl);
    setPendingLogoFile(null);
    setPendingFaviconFile(null);
    toast("Defaults cargados. Revisa el preview y confirma si te gusta.");
  };

  const onAssetUpload = async (
    assetType: "logo" | "favicon",
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      await validateTenantSettingsAssetFile(assetType, file);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Archivo invalido. Usa PNG, JPG, WEBP o ICO.";
      toast.error(message);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (assetType === "logo") {
      if (tempLogoUrlRef.current) URL.revokeObjectURL(tempLogoUrlRef.current);
      tempLogoUrlRef.current = objectUrl;
      setLogoPreview(objectUrl);
      setPendingLogoFile(file);
      setUseDefaultLogo(false);
      toast.success("Logo listo para guardar.");
      return;
    }

    if (tempFaviconUrlRef.current) URL.revokeObjectURL(tempFaviconUrlRef.current);
    tempFaviconUrlRef.current = objectUrl;
    setFaviconPreview(objectUrl);
    setPendingFaviconFile(file);
    setUseDefaultFavicon(false);
    toast.success("Favicon listo para guardar.");
  };

  const applyChanges = async () => {
    if (!hasChanges) return;

    setIsApplying(true);
    try {
      const payload: UpdateTenantSettingsPayload = {};

      if (hasThemeChanges) payload.theme = { ...themeDraft };
      if (hasThemeChanges && settings.themeMode !== "AUTO") payload.themeMode = "AUTO";
      if (hasBrandingChanges) {
        payload.branding = {
          appName: brandingPreviewName,
          windowTitle: brandingPreviewTitle,
        };
      }
      if (useDefaultLogo && settings.branding.logoUrl !== defaultTenantSettings.branding.logoUrl) {
        payload.branding = {
          ...(payload.branding ?? {}),
          logoUrl: defaultTenantSettings.branding.logoUrl,
        };
      }
      if (
        useDefaultFavicon &&
        settings.branding.faviconUrl !== defaultTenantSettings.branding.faviconUrl
      ) {
        payload.branding = {
          ...(payload.branding ?? {}),
          faviconUrl: defaultTenantSettings.branding.faviconUrl,
        };
      }

      if (payload.theme || payload.branding || payload.themeMode) {
        await saveSettings(payload);
      }
      if (pendingLogoFile) await uploadBrandingAsset("logo", pendingLogoFile);
      if (pendingFaviconFile) await uploadBrandingAsset("favicon", pendingFaviconFile);

      setConfirmOpen(false);
      toast.success("Identidad visual actualizada correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron aplicar los cambios.";
      toast.error(message);
    } finally {
      setIsApplying(false);
    }
  };

  if (!canEditTenantSettings) {
    return <p className="text-sm text-muted">No tienes permisos para editar settings.</p>;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-card-border bg-gradient-to-br from-surface-warm via-surface to-surface-soft p-6 shadow-theme-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-warning bg-surface-warning px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warning">
              <Sparkles className="h-3.5 w-3.5" />
              Visual System
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg-strong">
              Paleta simplificada
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              El panel ahora se controla con 5 colores editables. Hover, superficies,
              contrastes y estados se derivan automaticamente para que la
              personalizacion sea mas simple y tenga impacto real.
            </p>
            <p className="mt-2 text-xs text-muted">
              {pendingItems
                ? `Pendiente: ${pendingItems}.`
                : "No hay cambios pendientes en la identidad visual."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isBusy ? (
              <span className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs text-neutral">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                {isLoadingSettings ? "Cargando..." : "Guardando..."}
              </span>
            ) : null}
            <button
              type="button"
              onClick={loadDefaults}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-neutral transition-colors hover:bg-secondary-hover"
            >
              <RotateCcw className="h-4 w-4" />
              Defaults
            </button>
            <button
              type="button"
              onClick={syncFromSettings}
              disabled={!hasChanges || isBusy}
              className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-neutral transition-colors hover:bg-secondary-hover"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={!hasChanges || isBusy}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-text shadow-theme-accent transition-colors hover:bg-accent-hover"
            >
              Aplicar cambios
            </button>
          </div>
        </div>
      </div>

      {hasAdvancedThemeActive ? (
        <div className="rounded-2xl border border-border-warning bg-surface-warning-soft px-4 py-3 text-sm text-warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              Este tenant tiene overrides avanzados activos. Cuando guardes una nueva
              paleta, el tema volvera a modo simplificado para que el branding quede
              consistente en todo el dashboard.
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="rounded-2xl border border-border-danger bg-surface-danger-soft px-4 py-3 text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
          <SectionCard
            title="Colores editables"
            description="Solo editas la paleta semilla. El sistema resuelve hover, suaves y estados automaticamente."
            icon={<Palette className="h-4 w-4" />}
            isOpen={expandedSections.palette}
            onToggle={() => toggleSection("palette")}
          >
            <div className="space-y-3">
              {editableThemeFields.map((field) => (
                <label
                  key={field.key}
                  className="block rounded-2xl border border-card-border bg-surface p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="block text-sm font-semibold text-fg-strong">
                        {field.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {field.description}
                      </span>
                    </div>
                    <span
                      className="mt-0.5 h-4 w-4 rounded-full border border-border-soft"
                      style={{ backgroundColor: themeDraft[field.key] }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="color"
                      value={normalizeColorInput(themeDraft[field.key])}
                      onChange={(event) => applyEditableThemeField(field.key, event.target.value)}
                      className="h-10 w-12 rounded-lg border border-card-border bg-surface"
                    />
                    <input
                      type="text"
                      value={themeDraft[field.key]}
                      onChange={(event) => applyEditableThemeField(field.key, event.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-card-border bg-surface-soft px-3 py-2 text-sm text-fg"
                    />
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Branding"
            description="Nombre del negocio y titulo de la ventana."
            icon={<Type className="h-4 w-4" />}
            isOpen={expandedSections.branding}
            onToggle={() => toggleSection("branding")}
          >
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Nombre del panel
                </span>
                <input
                  value={brandingDraft.appName}
                  onChange={(event) =>
                    setBrandingDraft((prev) => ({ ...prev, appName: event.target.value }))
                  }
                  className="w-full rounded-xl border border-card-border bg-surface px-3 py-2 text-sm text-fg"
                  placeholder="Nombre del negocio"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Titulo de ventana
                </span>
                <input
                  value={brandingDraft.windowTitle}
                  onChange={(event) =>
                    setBrandingDraft((prev) => ({ ...prev, windowTitle: event.target.value }))
                  }
                  className="w-full rounded-xl border border-card-border bg-surface px-3 py-2 text-sm text-fg"
                  placeholder="Mi negocio | Dashboard"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard
            title="Assets"
            description="Logo y favicon con previsualizacion antes de guardar."
            icon={<ImageIcon className="h-4 w-4" />}
            isOpen={expandedSections.assets}
            onToggle={() => toggleSection("assets")}
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-card-border bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg-strong">Logo</p>
                    <p className="mt-1 text-xs text-muted">
                      PNG, JPG o WEBP. Maximo {LOGO_MAX_SIZE_LABEL}.
                    </p>
                  </div>
                  <img
                    src={logoPreview || defaultTenantSettings.branding.logoUrl}
                    alt="Logo preview"
                    className="h-12 w-12 rounded-xl border border-border-soft bg-surface object-contain p-2"
                    onError={(event) => {
                      event.currentTarget.src = defaultTenantSettings.branding.logoUrl;
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover">
                    <Upload className="h-3.5 w-3.5" />
                    Subir logo
                    <input
                      type="file"
                      accept={TENANT_SETTINGS_IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(event) => {
                        void onAssetUpload("logo", event);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseDefaultLogo(true);
                      setPendingLogoFile(null);
                      setLogoPreview(defaultTenantSettings.branding.logoUrl);
                    }}
                    className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover"
                  >
                    Default
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-card-border bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg-strong">Favicon</p>
                    <p className="mt-1 text-xs text-muted">
                      PNG, ICO o WEBP. Maximo {FAVICON_MAX_SIZE_LABEL}.
                    </p>
                  </div>
                  <img
                    src={faviconPreview || defaultTenantSettings.branding.faviconUrl}
                    alt="Favicon preview"
                    className="h-12 w-12 rounded-xl border border-border-soft bg-surface object-contain p-2"
                    onError={(event) => {
                      event.currentTarget.src = defaultTenantSettings.branding.faviconUrl;
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover">
                    <Upload className="h-3.5 w-3.5" />
                    Subir favicon
                    <input
                      type="file"
                      accept={TENANT_SETTINGS_IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(event) => {
                        void onAssetUpload("favicon", event);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseDefaultFavicon(true);
                      setPendingFaviconFile(null);
                      setFaviconPreview(defaultTenantSettings.branding.faviconUrl);
                    }}
                    className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        </aside>

        <div style={previewStyle} className="space-y-5">
          <article className="rounded-[24px] border border-card-border bg-card p-5 shadow-theme-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-fg-strong">Preview unificado</h3>
                <p className="mt-1 text-sm text-muted">
                  El preview usa la misma derivacion del dashboard y del booking publico.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-surface px-3 py-1 text-xs font-medium text-muted">
                <Palette className="h-3.5 w-3.5 text-fg-secondary" />
                5 colores editables
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-12">
              <div className="rounded-3xl border border-card-border bg-surface p-4 xl:col-span-7">
                <div
                  className="overflow-hidden rounded-[26px] border border-card-border shadow-theme-shell"
                  style={previewShellStyle}
                >
                  <div className="grid min-h-[260px] lg:grid-cols-[220px_1fr]">
                    <aside
                      className="border-b border-inverse-15 p-4 lg:border-b-0 lg:border-r"
                      style={previewSidebarStyle}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-12 w-12 place-items-center rounded-2xl"
                          style={previewSidebarItemStyle}
                        >
                          <img
                            src={logoPreview || defaultTenantSettings.branding.logoUrl}
                            alt="Brand logo"
                            className="h-8 w-8 object-contain"
                            onError={(event) => {
                              event.currentTarget.src = defaultTenantSettings.branding.logoUrl;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-sidebar-text">
                            {brandingPreviewName}
                          </p>
                          <p className="truncate text-xs text-inverse-70">Dashboard</p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        {["Dashboard", "Bookings", "Employees", "Settings"].map((item, index) => (
                          <div
                            key={item}
                            className="rounded-xl px-3 py-2 text-sm transition-colors"
                            style={index === 1 ? previewSidebarActiveStyle : previewSidebarItemStyle}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </aside>

                    <div className="p-4">
                      <header className="flex items-center justify-between rounded-2xl border border-navbar-border bg-navbar px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            Vista tenant
                          </p>
                          <p className="mt-1 text-sm font-semibold text-fg-strong">
                            {brandingPreviewTitle}
                          </p>
                        </div>
                        <button className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-text shadow-theme-accent">
                          Nueva reserva
                        </button>
                      </header>

                      <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
                        <div className="rounded-2xl border border-card-border bg-surface-soft p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                                Proximas citas
                              </p>
                              <p className="mt-1 text-sm font-semibold text-fg-strong">
                                Flujo operativo real
                              </p>
                            </div>
                            <span className="rounded-full bg-surface-warning-soft px-2.5 py-1 text-[11px] font-semibold text-warning">
                              Live
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            {[
                              { customer: "Carlos Ruiz", service: "Fade + Beard", time: "10:30" },
                              { customer: "Ana Perez", service: "Color + Blowout", time: "11:15" },
                              { customer: "Mateo Gil", service: "Corte premium", time: "12:00" },
                            ].map((item) => (
                              <div
                                key={`${item.customer}-${item.time}`}
                                className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-fg-strong">
                                    {item.customer}
                                  </p>
                                  <p className="truncate text-xs text-fg-secondary">
                                    {item.service}
                                  </p>
                                </div>
                                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-neutral">
                                  {item.time}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-text shadow-theme-accent">
                              Confirmar
                            </button>
                            <button className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-semibold text-neutral transition-colors hover:bg-secondary-hover">
                              Reagendar
                            </button>
                            <button className="rounded-xl border border-border-danger bg-surface-danger px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger hover:text-inverse">
                              Cancelar
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {[
                            {
                              label: "Bookings hoy",
                              value: "18",
                              detail: "agenda activa",
                            },
                            {
                              label: "Revenue",
                              value: "$4,820",
                              detail: "semana actual",
                            },
                            {
                              label: "No-shows",
                              value: "7",
                              detail: "seguimiento operativo",
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-2xl border border-card-border bg-surface-soft p-3"
                            >
                              <p className="text-xs uppercase tracking-[0.12em] text-muted">
                                {item.label}
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-fg-strong">
                                {item.value}
                              </p>
                              <p className="mt-1 text-xs text-fg-secondary">
                                {item.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-card-border bg-surface p-4 xl:col-span-5">
                <h4 className="text-sm font-semibold text-fg-strong">Jerarquia tipografica</h4>
                <div className="mt-3 space-y-2 rounded-2xl border border-border-soft bg-surface-soft p-4">
                  <p className="text-base font-semibold text-fg-strong">
                    Heading fuerte para elementos clave
                  </p>
                  <p className="text-sm text-fg">
                    Texto principal para lectura normal y contenido productivo.
                  </p>
                  <p className="text-sm text-fg-secondary">
                    Texto de soporte para metadata y contexto.
                  </p>
                  <p className="text-sm text-muted">
                    Texto muted para notas o estados menos importantes.
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-card-border bg-surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Brand preview
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl border border-card-border bg-surface">
                      <img
                        src={logoPreview || defaultTenantSettings.branding.logoUrl}
                        alt="Brand preview"
                        className="h-9 w-9 object-contain"
                        onError={(event) => {
                          event.currentTarget.src = defaultTenantSettings.branding.logoUrl;
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-fg-strong">
                        {brandingPreviewName}
                      </p>
                      <p className="text-sm text-fg-secondary">{brandingPreviewTitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-card-border bg-surface p-4 xl:col-span-12">
                <h4 className="text-sm font-semibold text-fg-strong">Chart</h4>
                <div className="mt-3 rounded-2xl border border-border-soft bg-surface-soft p-3">
                  <div className="mb-2 flex items-center gap-3 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      Revenue
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-chart-secondary" />
                      Bookings
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-chart-tertiary" />
                      Cancelled
                    </span>
                  </div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={settingsDemoChartData}
                        margin={{ top: 6, right: 8, left: -10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="settingsPreviewRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-primary-soft)" stopOpacity={0.32} />
                            <stop offset="95%" stopColor="var(--chart-primary-soft)" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
                        />
                        <Tooltip
                          cursor={{ stroke: "var(--chart-cursor)", strokeWidth: 1 }}
                          contentStyle={{
                            borderRadius: 10,
                            border: "1px solid var(--chart-tooltip-border)",
                            background: "var(--chart-tooltip-bg)",
                            boxShadow: "var(--shadow-row)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--chart-primary)"
                          strokeWidth={2}
                          fill="url(#settingsPreviewRevenueGradient)"
                          dot={{ fill: "var(--chart-primary)", r: 2.5 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="var(--chart-secondary)"
                          strokeWidth={1.7}
                          dot={{ fill: "var(--chart-secondary)", r: 2 }}
                          activeDot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="cancelled"
                          stroke="var(--chart-tertiary)"
                          strokeWidth={1.4}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={confirmOpen}
        title="Aplicar nueva identidad visual"
        description={
          pendingItems
            ? `Se aplicaran cambios en: ${pendingItems}. Esta actualizacion impactara el dashboard y la experiencia publica del tenant.`
            : "No hay cambios pendientes."
        }
        checkboxLabel="Confirmo que deseo actualizar la identidad visual del negocio."
        confirmText="Aplicar cambios"
        isConfirming={isApplying || isSavingSettings}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          void applyChanges();
        }}
      />
    </section>
  );
}
