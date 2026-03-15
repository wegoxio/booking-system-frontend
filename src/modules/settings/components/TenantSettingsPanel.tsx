"use client";

import { useAuth } from "@/context/AuthContext";
import { useTenantSettings } from "@/context/TenantSettingsContext";
import { defaultTenantSettings } from "@/modules/settings/config/default-tenant-settings";
import {
  createThemeVariables,
  normalizeThemeOverrides,
  THEME_OVERRIDE_TOKENS,
} from "@/modules/settings/utils/theme-colors";
import ConfirmActionModal from "@/modules/ui/ConfirmActionModal";
import type {
  TenantThemeMode,
  TenantThemeOverrides,
  TenantThemeSettings,
  UpdateTenantSettingsPayload,
} from "@/types/tenant-settings.types";
import {
  ChevronDown,
  LoaderCircle,
  MousePointer2,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";
import {
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const baseFields: Array<{ key: keyof TenantThemeSettings; label: string }> = [
  { key: "primary", label: "Primario" },
  { key: "secondary", label: "Secundario" },
  { key: "tertiary", label: "Terciario" },
  { key: "primaryHover", label: "Hover primario" },
  { key: "secondaryHover", label: "Hover secundario" },
  { key: "tertiaryHover", label: "Hover terciario" },
  { key: "textPrimary", label: "Texto primario" },
  { key: "textSecondary", label: "Texto secundario" },
  { key: "textTertiary", label: "Texto terciario" },
];

const groups = ["layout", "surface", "text", "status", "border", "chart"] as const;
const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,.svg,.ico,image/*";
const HEX_6 = /^#([0-9a-fA-F]{6})$/;
const HEX_3 = /^#([0-9a-fA-F]{3})$/;
const brandPaletteFields = baseFields.slice(0, 6);
const textPaletteFields = baseFields.slice(6);
const settingsDemoChartData = [
  { label: "Ene", revenue: 540, bookings: 430, reversed: 210 },
  { label: "Feb", revenue: 690, bookings: 510, reversed: 260 },
  { label: "Mar", revenue: 620, bookings: 570, reversed: 220 },
  { label: "Abr", revenue: 780, bookings: 630, reversed: 300 },
  { label: "May", revenue: 710, bookings: 590, reversed: 250 },
  { label: "Jun", revenue: 860, bookings: 660, reversed: 320 },
];

type PanelSectionKey =
  | "brandPalette"
  | "textPalette"
  | "overrides"
  | "branding"
  | "assets";

type CollapsibleCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

function CollapsibleCard({
  title,
  description,
  icon,
  isOpen,
  onToggle,
  actions,
  children,
  className = "",
}: CollapsibleCardProps) {
  return (
    <div className={`rounded-[24px] border border-card-border bg-card p-4 shadow-theme-card ${className}`}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          {icon ? <span className="mt-0.5 text-fg-icon">{icon}</span> : null}
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-primary">{title}</span>
            {description ? <span className="mt-0.5 block text-xs text-muted">{description}</span> : null}
          </span>
          <ChevronDown
            className={`ml-auto mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {isOpen ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function normalizeColorInput(value: string | undefined) {
  if (!value) return "#000000";
  const v = value.trim();
  if (HEX_6.test(v)) return v.toLowerCase();
  const m = HEX_3.exec(v);
  if (!m) return "#000000";
  const [r, g, b] = m[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

function equalOverrides(a: TenantThemeOverrides, b: TenantThemeOverrides) {
  const x = Object.entries(a).sort(([ka], [kb]) => ka.localeCompare(kb));
  const y = Object.entries(b).sort(([ka], [kb]) => ka.localeCompare(kb));
  return x.length === y.length && x.every(([k, v], i) => k === y[i][0] && v === y[i][1]);
}

export default function TenantSettingsPanel() {
  const { user } = useAuth();
  const { settings, canEditTenantSettings, isLoadingSettings, isSavingSettings, errorMessage, saveSettings, uploadBrandingAsset } =
    useTenantSettings();

  const [themeDraft, setThemeDraft] = useState(settings.theme);
  const [themeModeDraft, setThemeModeDraft] = useState<TenantThemeMode>(settings.themeMode);
  const [overridesDraft, setOverridesDraft] = useState<TenantThemeOverrides>(settings.themeOverrides);
  const [overrideGroup, setOverrideGroup] = useState<(typeof groups)[number]>("surface");
  const [overrideTier, setOverrideTier] = useState<"core" | "all">("core");
  const [expandedSections, setExpandedSections] = useState<Record<PanelSectionKey, boolean>>({
    brandPalette: true,
    textPalette: false,
    overrides: false,
    branding: true,
    assets: false,
  });
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

  const tempLogoUrlRef = useRef<string | null>(null);
  const tempFaviconUrlRef = useRef<string | null>(null);
  const isBusy = isLoadingSettings || isSavingSettings || isApplying;

  const normalizedOverrides = useMemo(() => normalizeThemeOverrides(overridesDraft), [overridesDraft]);
  const savedOverrides = useMemo(() => normalizeThemeOverrides(settings.themeOverrides), [settings.themeOverrides]);
  const previewTheme = useMemo(
    () => createThemeVariables(themeDraft, themeModeDraft, normalizedOverrides),
    [themeDraft, themeModeDraft, normalizedOverrides],
  );
  const previewScopeStyle = useMemo(() => previewTheme as CSSProperties, [previewTheme]);
  const overrideTokens = useMemo(
    () =>
      THEME_OVERRIDE_TOKENS.filter(
        (t) => t.group === overrideGroup && (overrideTier === "all" || t.tier === "core"),
      ),
    [overrideGroup, overrideTier],
  );

  const hasThemeChanges = baseFields.some(({ key }) => themeDraft[key] !== settings.theme[key]);
  const hasModeChanges = themeModeDraft !== settings.themeMode;
  const hasOverridesChanges = !equalOverrides(normalizedOverrides, savedOverrides);
  const hasBrandingChanges =
    (brandingDraft.appName.trim() || defaultTenantSettings.branding.appName) !== settings.branding.appName ||
    (brandingDraft.windowTitle.trim() || defaultTenantSettings.branding.windowTitle) !== settings.branding.windowTitle;
  const hasDefaultAssetChanges =
    (useDefaultLogo && settings.branding.logoUrl !== defaultTenantSettings.branding.logoUrl) ||
    (useDefaultFavicon && settings.branding.faviconUrl !== defaultTenantSettings.branding.faviconUrl);
  const hasAssetUploads = !!pendingLogoFile || !!pendingFaviconFile;
  const hasChanges =
    hasThemeChanges || hasModeChanges || hasOverridesChanges || hasBrandingChanges || hasDefaultAssetChanges || hasAssetUploads;

  const pendingText = [
    hasThemeChanges && "paleta",
    hasModeChanges && "modo",
    hasOverridesChanges && "overrides",
    hasBrandingChanges && "branding",
    hasDefaultAssetChanges && "assets default",
    hasAssetUploads && "nuevas imagenes",
  ]
    .filter(Boolean)
    .join(", ");

  const syncFromSettings = () => {
    setThemeDraft(settings.theme);
    setThemeModeDraft(settings.themeMode);
    setOverridesDraft(settings.themeOverrides);
    setBrandingDraft({ appName: settings.branding.appName, windowTitle: settings.branding.windowTitle });
    if (tempLogoUrlRef.current) URL.revokeObjectURL(tempLogoUrlRef.current);
    if (tempFaviconUrlRef.current) URL.revokeObjectURL(tempFaviconUrlRef.current);
    tempLogoUrlRef.current = null;
    tempFaviconUrlRef.current = null;
    setLogoPreview(settings.branding.logoUrl);
    setFaviconPreview(settings.branding.faviconUrl);
    setPendingLogoFile(null);
    setPendingFaviconFile(null);
    setUseDefaultLogo(false);
    setUseDefaultFavicon(false);
  };

  const loadDefaults = () => {
    setThemeDraft(defaultTenantSettings.theme);
    setThemeModeDraft(defaultTenantSettings.themeMode);
    setOverridesDraft(defaultTenantSettings.themeOverrides);
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
  };

  const onAssetUpload = (assetType: "logo" | "favicon", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    if (assetType === "logo") {
      if (tempLogoUrlRef.current) URL.revokeObjectURL(tempLogoUrlRef.current);
      tempLogoUrlRef.current = objectUrl;
      setLogoPreview(objectUrl);
      setPendingLogoFile(file);
      setUseDefaultLogo(false);
      return;
    }
    if (tempFaviconUrlRef.current) URL.revokeObjectURL(tempFaviconUrlRef.current);
    tempFaviconUrlRef.current = objectUrl;
    setFaviconPreview(objectUrl);
    setPendingFaviconFile(file);
    setUseDefaultFavicon(false);
  };

  const applyChanges = async () => {
    if (!hasChanges) return;
    setIsApplying(true);
    try {
      const payload: UpdateTenantSettingsPayload = {};
      if (hasThemeChanges) payload.theme = { ...themeDraft };
      if (hasModeChanges) payload.themeMode = themeModeDraft;
      if (hasOverridesChanges) payload.themeOverrides = { ...normalizedOverrides };
      if (hasBrandingChanges) {
        payload.branding = {
          appName: brandingDraft.appName.trim() || defaultTenantSettings.branding.appName,
          windowTitle: brandingDraft.windowTitle.trim() || defaultTenantSettings.branding.windowTitle,
        };
      }
      if (useDefaultLogo && settings.branding.logoUrl !== defaultTenantSettings.branding.logoUrl) {
        payload.branding = { ...(payload.branding ?? {}), logoUrl: defaultTenantSettings.branding.logoUrl };
      }
      if (useDefaultFavicon && settings.branding.faviconUrl !== defaultTenantSettings.branding.faviconUrl) {
        payload.branding = { ...(payload.branding ?? {}), faviconUrl: defaultTenantSettings.branding.faviconUrl };
      }
      if (payload.theme || payload.themeMode || payload.themeOverrides || payload.branding) await saveSettings(payload);
      if (pendingLogoFile) await uploadBrandingAsset("logo", pendingLogoFile);
      if (pendingFaviconFile) await uploadBrandingAsset("favicon", pendingFaviconFile);
      setConfirmOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  const toggleSection = (section: PanelSectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!canEditTenantSettings) {
    return <p className="text-sm text-muted">No tienes permisos para editar settings.</p>;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-card-border bg-card p-6 shadow-theme-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-warning bg-surface-warning px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warning"><Sparkles className="h-3.5 w-3.5" />Theme Builder</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-primary">Live Palette Editor</h2>
            <p className="mt-2 text-sm text-muted">Preview en vivo tipo generador de tema. Ambito: {user?.role === "SUPER_ADMIN" ? "plataforma" : "tenant"}.</p>
            <p className="mt-2 text-xs text-muted">{pendingText ? `Pendiente: ${pendingText}.` : "No hay cambios pendientes."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isBusy && <span className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs text-neutral"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />{isLoadingSettings ? "Cargando..." : "Guardando..."}</span>}
            <button type="button" onClick={loadDefaults} disabled={isBusy} className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-neutral disabled:opacity-60"><RotateCcw className="h-4 w-4" />Defaults</button>
            <button type="button" onClick={syncFromSettings} disabled={!hasChanges || isBusy} className="rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-medium text-neutral disabled:opacity-60">Descartar</button>
            <button type="button" onClick={() => setConfirmOpen(true)} disabled={!hasChanges || isBusy} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-text disabled:opacity-60">Confirmar cambios</button>
          </div>
        </div>
      </div>

      {errorMessage && <p className="rounded-2xl border border-border-danger bg-surface-danger-soft px-4 py-3 text-sm text-danger">{errorMessage}</p>}

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-[24px] border border-card-border bg-card p-4 shadow-theme-card">
            <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-primary">Modo de tema</p><div className="inline-flex rounded-xl border border-card-border bg-surface-soft p-1"><button onClick={() => setThemeModeDraft("AUTO")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${themeModeDraft === "AUTO" ? "bg-surface text-fg-strong" : "text-muted"}`}>Auto</button><button onClick={() => setThemeModeDraft("ADVANCED")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${themeModeDraft === "ADVANCED" ? "bg-surface text-fg-strong" : "text-muted"}`}>Advanced</button></div></div>
            <p className="text-xs text-muted">Usa AUTO para derivaciones inteligentes o ADVANCED para control total.</p>
          </div>

          <CollapsibleCard
            title="Paleta principal"
            description="Colores de marca y estados base."
            isOpen={expandedSections.brandPalette}
            onToggle={() => toggleSection("brandPalette")}
          >
            <div className="space-y-2">
              {brandPaletteFields.map((field) => (
                <label key={field.key} className="block rounded-xl border border-card-border bg-surface p-2.5">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={normalizeColorInput(themeDraft[field.key])}
                      onChange={(event) =>
                        setThemeDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="h-8 w-10 rounded-md border border-card-border"
                    />
                    <input
                      type="text"
                      value={themeDraft[field.key]}
                      onChange={(event) =>
                        setThemeDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="min-w-0 flex-1 rounded-lg border border-card-border bg-surface-soft px-2.5 py-1.5 text-xs text-primary"
                    />
                  </div>
                </label>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Paleta de texto"
            description="Jerarquia tipografica para todo el sistema."
            isOpen={expandedSections.textPalette}
            onToggle={() => toggleSection("textPalette")}
          >
            <div className="space-y-2">
              {textPaletteFields.map((field) => (
                <label key={field.key} className="block rounded-xl border border-card-border bg-surface p-2.5">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={normalizeColorInput(themeDraft[field.key])}
                      onChange={(event) =>
                        setThemeDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="h-8 w-10 rounded-md border border-card-border"
                    />
                    <input
                      type="text"
                      value={themeDraft[field.key]}
                      onChange={(event) =>
                        setThemeDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="min-w-0 flex-1 rounded-lg border border-card-border bg-surface-soft px-2.5 py-1.5 text-xs text-primary"
                    />
                  </div>
                </label>
              ))}
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Branding"
            description="Nombre principal y titulo del navegador."
            isOpen={expandedSections.branding}
            onToggle={() => toggleSection("branding")}
          >
            <div className="space-y-2.5">
              <input
                value={brandingDraft.appName}
                onChange={(event) =>
                  setBrandingDraft((prev) => ({ ...prev, appName: event.target.value }))
                }
                className="w-full rounded-xl border border-card-border bg-surface px-3 py-2 text-sm text-primary"
                placeholder="Nombre app"
              />
              <input
                value={brandingDraft.windowTitle}
                onChange={(event) =>
                  setBrandingDraft((prev) => ({ ...prev, windowTitle: event.target.value }))
                }
                className="w-full rounded-xl border border-card-border bg-surface px-3 py-2 text-sm text-primary"
                placeholder="Window title"
              />
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Assets"
            description="Logo y favicon con preview inmediato."
            isOpen={expandedSections.assets}
            onToggle={() => toggleSection("assets")}
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-card-border bg-surface p-2">
                <img
                  src={logoPreview || defaultTenantSettings.branding.logoUrl}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-lg border border-card-border bg-surface-soft p-1.5 object-contain"
                />
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-[11px] font-medium text-neutral">
                  <Upload className="h-3.5 w-3.5" />
                  Logo
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="hidden"
                    onChange={(event) => onAssetUpload("logo", event)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseDefaultLogo(true);
                    setLogoPreview(defaultTenantSettings.branding.logoUrl);
                    setPendingLogoFile(null);
                  }}
                  className="rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-[11px] font-medium text-neutral"
                >
                  Default
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-card-border bg-surface p-2">
                <img
                  src={faviconPreview || defaultTenantSettings.branding.faviconUrl}
                  alt="Favicon preview"
                  className="h-10 w-10 rounded-lg border border-card-border bg-surface-soft p-1.5 object-contain"
                />
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-[11px] font-medium text-neutral">
                  <Upload className="h-3.5 w-3.5" />
                  Favicon
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="hidden"
                    onChange={(event) => onAssetUpload("favicon", event)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseDefaultFavicon(true);
                    setFaviconPreview(defaultTenantSettings.branding.faviconUrl);
                    setPendingFaviconFile(null);
                  }}
                  className="rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-[11px] font-medium text-neutral"
                >
                  Default
                </button>
              </div>
            </div>
          </CollapsibleCard>
        </aside>

        <div style={previewScopeStyle} className="space-y-5">
          <CollapsibleCard
            title="Overrides avanzados"
            description="Control token por token cuando necesitas precision total."
            icon={<WandSparkles className="h-4 w-4" />}
            isOpen={expandedSections.overrides}
            onToggle={() => toggleSection("overrides")}
            actions={(
              <button
                type="button"
                onClick={() => setOverridesDraft({})}
                disabled={Object.keys(normalizedOverrides).length === 0 || isBusy}
                className="rounded-lg border border-border-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-neutral disabled:opacity-60"
              >
                Limpiar
              </button>
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="inline-flex rounded-lg border border-card-border bg-surface-soft p-1">
                <button
                  type="button"
                  onClick={() => setOverrideTier("core")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${overrideTier === "core" ? "bg-surface text-fg-strong" : "text-muted"}`}
                >
                  Core
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideTier("all")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${overrideTier === "all" ? "bg-surface text-fg-strong" : "text-muted"}`}
                >
                  All
                </button>
              </div>
              <p className="text-[11px] text-muted">{overrideTokens.length} tokens visibles</p>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {groups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setOverrideGroup(group)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${overrideGroup === group ? "bg-accent text-accent-text" : "border border-card-border bg-surface text-muted"}`}
                >
                  {group}
                </button>
                ))}
              </div>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {overrideTokens.length === 0 ? (
                <p className="rounded-xl border border-card-border bg-surface-soft px-3 py-2 text-xs text-muted">
                  No hay tokens para este grupo en modo {overrideTier.toUpperCase()}.
                </p>
              ) : null}
              {overrideTokens.map((token) => {
                const computed = previewTheme[token.cssVar];
                const custom = normalizedOverrides[token.key] ?? "";
                return (
                  <div key={token.key} className="rounded-xl border border-card-border bg-surface p-2.5">
                    <p className="mb-1 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{token.label}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={normalizeColorInput(custom || computed)}
                        onChange={(event) => {
                          setThemeModeDraft("ADVANCED");
                          setOverridesDraft((prev) => ({ ...prev, [token.key]: event.target.value }));
                        }}
                        className="h-7 w-8 rounded-md border border-card-border"
                      />
                      <input
                        type="text"
                        value={custom || computed}
                        onChange={(event) => {
                          setThemeModeDraft("ADVANCED");
                          setOverridesDraft((prev) => ({ ...prev, [token.key]: event.target.value }));
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-card-border bg-surface-soft px-2 py-1.5 text-[11px] text-primary"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOverridesDraft((prev) => {
                            const next = { ...prev };
                            delete next[token.key];
                            return next;
                          })
                        }
                        disabled={!custom}
                        className="rounded-lg border border-border-strong bg-surface px-2 py-1.5 text-[11px] font-medium text-neutral disabled:opacity-60"
                      >
                        Off
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleCard>

          <div className="rounded-[24px] border border-card-border bg-card p-5 shadow-theme-card">
            <div className="mb-4 flex items-center justify-between"><div><h3 className="text-xl font-semibold text-primary">Components Demo</h3><p className="text-sm text-muted">Cada bloque valida un set de tokens especifico en vivo.</p></div><div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-surface px-3 py-1 text-xs text-muted"><Paintbrush className="h-3.5 w-3.5 text-fg-icon" />{themeModeDraft}</div></div>
            <div className="grid gap-4 xl:grid-cols-12">
              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-6">
                <h4 className="text-sm font-semibold text-primary">Actions + Hover</h4>
                <p className="mt-1 text-xs text-muted">Accent, hover, neutral y estados de accion.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-text transition-colors hover:bg-accent-hover">Primary</button>
                  <button className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-semibold text-neutral transition-colors hover:bg-secondary-hover">Secondary</button>
                  <button className="rounded-lg border border-border-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-tertiary-hover hover:text-inverse">Neutral</button>
                  <button className="rounded-lg border border-border-danger bg-surface-danger px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger hover:text-inverse">Danger</button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-border-soft bg-surface-soft p-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Primary</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-accent-text">Normal</span>
                      <span className="rounded-md bg-accent-hover px-2 py-1 text-[11px] font-semibold text-accent-text">Hover</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-soft bg-surface-soft p-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Secondary</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-border-strong bg-surface px-2 py-1 text-[11px] font-semibold text-neutral">Normal</span>
                      <span className="rounded-md border border-border-strong bg-secondary-hover px-2 py-1 text-[11px] font-semibold text-neutral">Hover</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:bg-surface-warning hover:text-warning">
                    <MousePointer2 className="h-3.5 w-3.5" />
                    Icon action
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:bg-surface-danger hover:text-danger">
                    Delete hover
                  </button>
                </div>
              </article>

              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-6">
                <h4 className="text-sm font-semibold text-primary">Text Hierarchy</h4>
                <p className="mt-1 text-xs text-muted">Primary, body, label, secondary, muted y placeholder.</p>
                <div className="mt-3 space-y-2 rounded-xl border border-border-soft bg-surface-soft p-3">
                  <p className="text-sm font-semibold text-fg-strong">Heading fuerte de ejemplo</p>
                  <p className="text-sm text-primary">Texto principal para contenido clave.</p>
                  <p className="text-sm text-fg">Texto body regular para descripciones largas.</p>
                  <p className="text-sm text-fg-label">Texto label para formularios y metadata.</p>
                  <p className="text-sm text-fg-secondary">Texto secundario para soporte visual.</p>
                  <p className="text-sm text-muted">Texto muted para notas menos importantes.</p>
                  <p className="text-sm text-fg-placeholder">Placeholder visual de referencia.</p>
                </div>
              </article>

              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-6">
                <h4 className="text-sm font-semibold text-primary">Surfaces + Borders</h4>
                <p className="mt-1 text-xs text-muted">Niveles de superficie y bordes semanticos.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface p-2.5 text-xs text-primary">Surface + border</div>
                  <div className="rounded-xl border border-border-soft bg-surface-soft p-2.5 text-xs text-primary">Surface soft</div>
                  <div className="rounded-xl border border-border-soft bg-surface-muted p-2.5 text-xs text-primary">Surface muted</div>
                  <div className="rounded-xl border border-border-soft bg-surface-subtle p-2.5 text-xs text-primary">Surface subtle</div>
                  <div className="rounded-xl border border-border-warning bg-surface-warning p-2.5 text-xs text-warning">Warning surface</div>
                  <div className="rounded-xl border border-border-danger bg-surface-danger p-2.5 text-xs text-danger">Danger surface</div>
                </div>
              </article>

              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-6">
                <h4 className="text-sm font-semibold text-primary">Status + Table</h4>
                <p className="mt-1 text-xs text-muted">Estados semanticos con UI real.</p>
                <div className="mt-3 space-y-2">
                  {[{ n: "Salon Central", s: "Activo", c: "success" }, { n: "Estudio Norte", s: "Pendiente", c: "warning" }, { n: "Spa Oeste", s: "Bloqueado", c: "danger" }].map((r) => <div key={r.n} className="flex items-center justify-between rounded-lg border border-border-soft bg-surface-soft px-3 py-2"><span className="text-xs font-medium text-primary">{r.n}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.c === "success" ? "bg-surface-success text-success" : r.c === "warning" ? "bg-surface-warning-soft text-warning" : "bg-surface-danger text-danger"}`}>{r.s}</span></div>)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full bg-surface-success px-2 py-1 text-success">Success</span>
                  <span className="rounded-full bg-surface-warning-soft px-2 py-1 text-warning">Warning</span>
                  <span className="rounded-full bg-surface-danger px-2 py-1 text-danger">Danger</span>
                  <span className="rounded-full bg-surface-info px-2 py-1 text-info">Info</span>
                </div>
              </article>

              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-5">
                <h4 className="text-sm font-semibold text-primary">Chart</h4>
                <p className="mt-1 text-xs text-muted">Preview estilo dashboard (area + lineas + tooltip).</p>
                <div className="mt-3 rounded-xl border border-border-soft bg-surface-soft p-3">
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
                      Reversed
                    </span>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={settingsDemoChartData} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
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
                          dataKey="reversed"
                          stroke="var(--chart-tertiary)"
                          strokeWidth={1.4}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-7"><h4 className="text-sm font-semibold text-primary">Form Controls</h4><p className="mt-1 text-xs text-muted">Inputs, labels, placeholders y focus semantic.</p><div className="mt-3 space-y-2.5"><label className="block text-xs font-medium text-fg-label">Nombre del cliente</label><input readOnly value="Salon Central" className="w-full rounded-lg border border-border-soft bg-surface-soft px-3 py-2 text-xs text-primary" /><label className="block text-xs font-medium text-fg-label">Email</label><input readOnly value="cliente@correo.com" className="w-full rounded-lg border border-border-soft bg-surface-soft px-3 py-2 text-xs text-primary" /><input readOnly value="Placeholder visible" placeholder="placeholder" className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-xs placeholder:text-fg-placeholder" /><label className="inline-flex items-center gap-2 rounded-lg border border-border-soft bg-surface px-2.5 py-2 text-xs text-fg-label"><input type="checkbox" checked readOnly />Notificar por email</label></div></article>

              <article className="rounded-2xl border border-card-border bg-surface p-4 xl:col-span-12"><h4 className="text-sm font-semibold text-primary">Brand Identity</h4><div className="mt-3 rounded-xl border border-card-border bg-surface-soft p-3"><div className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-text">{brandingDraft.appName.trim() || defaultTenantSettings.branding.appName}</div><p className="mt-2 text-sm text-primary">{brandingDraft.windowTitle.trim() || defaultTenantSettings.branding.windowTitle}</p><p className="mt-1 text-xs text-muted">Este bloque refleja cabecera e identidad principal.</p></div></article>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        isOpen={confirmOpen}
        title="Confirmar cambios de settings"
        description={`${pendingText ? `Se aplicaran cambios en: ${pendingText}.` : "No hay cambios pendientes."} Esta accion actualizara la configuracion visual del panel.`}
        checkboxLabel="Confirmo que deseo aplicar estos cambios de apariencia."
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
