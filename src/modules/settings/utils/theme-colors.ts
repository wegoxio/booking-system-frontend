import type {
  TenantThemeMode,
  TenantThemeOverrides,
  TenantThemeSettings,
} from "@/types/tenant-settings.types";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export type ThemeVariableMap = Record<string, string>;

type ThemeOverrideToken = {
  key: string;
  cssVar: string;
  label: string;
  group: "layout" | "surface" | "text" | "status" | "border" | "chart";
  tier: "core" | "advanced";
};

export const THEME_OVERRIDE_TOKENS: ThemeOverrideToken[] = [
  { key: "appBg", cssVar: "--app-bg", label: "Fondo app", group: "layout", tier: "core" },
  { key: "shellBg", cssVar: "--shell-bg", label: "Fondo shell", group: "layout", tier: "core" },
  { key: "navbarBg", cssVar: "--navbar-bg", label: "Navbar", group: "layout", tier: "core" },
  {
    key: "sidebarBgStart",
    cssVar: "--sidebar-bg-start",
    label: "Sidebar base",
    group: "layout",
    tier: "core",
  },
  { key: "cardBg", cssVar: "--card-bg", label: "Card base", group: "layout", tier: "core" },
  { key: "surface", cssVar: "--surface", label: "Surface", group: "surface", tier: "core" },
  { key: "surfaceSoft", cssVar: "--surface-soft", label: "Surface soft", group: "surface", tier: "core" },
  { key: "surfaceMuted", cssVar: "--surface-muted", label: "Surface muted", group: "surface", tier: "core" },
  {
    key: "surfaceSubtle",
    cssVar: "--surface-subtle",
    label: "Surface subtle",
    group: "surface",
    tier: "advanced",
  },
  {
    key: "surfacePanel",
    cssVar: "--surface-panel",
    label: "Surface panel",
    group: "surface",
    tier: "advanced",
  },
  {
    key: "surfacePanelStrong",
    cssVar: "--surface-panel-strong",
    label: "Surface panel strong",
    group: "surface",
    tier: "advanced",
  },
  { key: "surfaceWarm", cssVar: "--surface-warm", label: "Surface warm", group: "surface", tier: "advanced" },
  { key: "accent", cssVar: "--primary-accent", label: "Accent", group: "surface", tier: "core" },
  { key: "accentHover", cssVar: "--primary-hover", label: "Accent hover", group: "surface", tier: "core" },
  { key: "accentText", cssVar: "--primary-accent-text", label: "Accent text", group: "text", tier: "core" },
  { key: "textPrimary", cssVar: "--text-primary", label: "Texto principal", group: "text", tier: "core" },
  { key: "textBody", cssVar: "--text-body", label: "Texto body", group: "text", tier: "core" },
  { key: "textStrong", cssVar: "--text-strong", label: "Texto fuerte", group: "text", tier: "core" },
  { key: "textMuted", cssVar: "--text-muted", label: "Texto muted", group: "text", tier: "core" },
  { key: "textSecondary", cssVar: "--text-secondary", label: "Texto secundario", group: "text", tier: "core" },
  { key: "warning", cssVar: "--warning", label: "Warning", group: "status", tier: "core" },
  { key: "success", cssVar: "--success", label: "Success", group: "status", tier: "core" },
  { key: "danger", cssVar: "--danger", label: "Danger", group: "status", tier: "core" },
  { key: "info", cssVar: "--info", label: "Info", group: "status", tier: "core" },
  {
    key: "borderWarning",
    cssVar: "--border-warning",
    label: "Border warning",
    group: "border",
    tier: "core",
  },
  {
    key: "borderDanger",
    cssVar: "--border-danger",
    label: "Border danger",
    group: "border",
    tier: "core",
  },
  { key: "borderInfo", cssVar: "--border-info", label: "Border info", group: "border", tier: "core" },
  { key: "chartPrimary", cssVar: "--chart-primary", label: "Chart primary", group: "chart", tier: "core" },
  {
    key: "chartPrimarySoft",
    cssVar: "--chart-primary-soft",
    label: "Chart primary soft",
    group: "chart",
    tier: "advanced",
  },
  {
    key: "chartSecondary",
    cssVar: "--chart-secondary",
    label: "Chart secondary",
    group: "chart",
    tier: "core",
  },
  { key: "chartTertiary", cssVar: "--chart-tertiary", label: "Chart tertiary", group: "chart", tier: "core" },
  {
    key: "chartTooltipBg",
    cssVar: "--chart-tooltip-bg",
    label: "Chart tooltip bg",
    group: "chart",
    tier: "advanced",
  },
];

const THEME_OVERRIDE_TOKEN_MAP = new Map(
  THEME_OVERRIDE_TOKENS.map((token) => [token.key, token.cssVar]),
);

function expandHex(value: string): string {
  const normalized = value.trim();
  if (!HEX_COLOR_REGEX.test(normalized)) {
    return "#000000";
  }

  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return normalized.toLowerCase();
}

function hexToRgb(value: string) {
  const hex = expandHex(value);
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const channelToHex = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0");

  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

function mixHex(base: string, target: string, weight: number) {
  const from = hexToRgb(base);
  const to = hexToRgb(target);
  return rgbToHex(
    from.r + (to.r - from.r) * weight,
    from.g + (to.g - from.g) * weight,
    from.b + (to.b - from.b) * weight,
  );
}

function withAlpha(value: string, alpha: number) {
  const { r, g, b } = hexToRgb(value);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getRelativeLuminance(value: string) {
  const { r, g, b } = hexToRgb(value);
  const [red, green, blue] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function ensureReadableText(
  background: string,
  preferred: string,
  fallbackLight = "#ffffff",
  fallbackDark = "#111827",
) {
  if (contrastRatio(preferred, background) >= 4.5) {
    return preferred;
  }

  return contrastRatio(fallbackLight, background) >= contrastRatio(fallbackDark, background)
    ? fallbackLight
    : fallbackDark;
}

export function normalizeThemeSettings(input: unknown): TenantThemeSettings {
  const theme = input && typeof input === "object" ? (input as Record<string, string>) : {};

  return {
    primary: theme.primary ?? theme.primaryAccent ?? "#efc35f",
    secondary: theme.secondary ?? theme.cardBg ?? theme.shellBg ?? theme.navbarBg ?? "#e9e9ed",
    tertiary: theme.tertiary ?? theme.sidebarBgStart ?? theme.appBg ?? "#5f6470",
    primaryHover: theme.primaryHover ?? theme.sidebarActiveBg ?? theme.primaryAccent ?? "#d6ad50",
    secondaryHover: theme.secondaryHover ?? theme.navbarBg ?? theme.iconButtonBg ?? "#ececef",
    tertiaryHover: theme.tertiaryHover ?? theme.sidebarBgEnd ?? "#4a4f5b",
    textPrimary: theme.textPrimary ?? theme.primaryAccentText ?? "#2f3543",
    textSecondary: theme.textSecondary ?? theme.textPrimary ?? "#2d313b",
    textTertiary: theme.textTertiary ?? theme.textMuted ?? theme.iconButtonText ?? "#6f7380",
  };
}

export function normalizeThemeMode(input: unknown): TenantThemeMode {
  return input === "ADVANCED" ? "ADVANCED" : "AUTO";
}

export function normalizeThemeOverrides(input: unknown): TenantThemeOverrides {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const entries = Object.entries(input).filter(
    ([key, value]) => key.trim().length > 0 && typeof value === "string" && value.trim().length > 0,
  );

  return Object.fromEntries(entries);
}

function resolveOverrideCssVariable(token: string): string | null {
  if (!token.trim()) return null;
  if (token.startsWith("--")) return token;
  return THEME_OVERRIDE_TOKEN_MAP.get(token) ?? null;
}

export function createThemeVariables(
  theme: TenantThemeSettings,
  themeMode: TenantThemeMode = "AUTO",
  themeOverrides: TenantThemeOverrides = {},
): ThemeVariableMap {
  const sidebarText = ensureReadableText(theme.tertiary, theme.textSecondary);
  const primaryText = ensureReadableText(theme.primary, theme.textPrimary);
  const surface = mixHex(theme.secondary, "#ffffff", 0.9);
  const surfaceSoft = mixHex(theme.secondary, "#ffffff", 0.74);
  const surfaceMuted = mixHex(theme.secondary, "#ffffff", 0.62);
  const surfaceSubtle = mixHex(theme.secondary, "#ffffff", 0.52);
  const panelSurface = mixHex(theme.secondary, "#ffffff", 0.35);
  const panelSurfaceStrong = mixHex(theme.secondary, "#ffffff", 0.42);
  const warningSurface = mixHex(theme.primary, "#ffffff", 0.82);
  const warningSurfaceSoft = mixHex(theme.primary, "#ffffff", 0.9);
  const warningBorder = mixHex(theme.primary, "#ffffff", 0.66);
  const warningText = ensureReadableText(
    warningSurface,
    mixHex(theme.primary, "#7a5c08", 0.55),
    "#7a5c08",
    theme.textSecondary,
  );
  const textStrong = mixHex(theme.textSecondary, "#111827", 0.18);
  const textLabel = mixHex(theme.textSecondary, theme.textTertiary, 0.35);
  const textSecondary = mixHex(theme.textSecondary, theme.textTertiary, 0.55);
  const textIcon = mixHex(theme.textSecondary, theme.textTertiary, 0.65);
  const textPlaceholder = mixHex(theme.textTertiary, "#a8b0c2", 0.35);
  const textSoft = mixHex(theme.textTertiary, "#aeb5c3", 0.3);
  const chartPrimary = mixHex(theme.primary, "#b8841f", 0.35);
  const chartPrimarySoft = mixHex(theme.primary, "#dfb34d", 0.55);
  const chartSecondary = mixHex(theme.textTertiary, "#b8bbc5", 0.4);
  const chartTertiary = mixHex(theme.textTertiary, "#d7d9e1", 0.62);
  const chartAxis = mixHex(theme.textTertiary, "#8b8f9a", 0.52);
  const chartGrid = withAlpha(theme.textTertiary, 0.22);
  const chartCursor = withAlpha(theme.textTertiary, 0.28);
  const overlay = withAlpha(theme.tertiary, 0.46);
  const overlayStrong = withAlpha(theme.tertiary, 0.5);
  const overlaySoft = withAlpha(theme.tertiary, 0.3);
  const overlayMuted = withAlpha(theme.tertiary, 0.2);
  const inverseText = ensureReadableText(theme.tertiary, "#ffffff");
  const infoTone = mixHex(theme.textSecondary, "#295693", 0.42);
  const dangerTone = mixHex(theme.textSecondary, "#ab3d3d", 0.42);
  const shadowSoft = `0 18px 40px ${withAlpha(theme.tertiary, 0.14)}`;
  const shadowSoftSm = `0 8px 24px ${withAlpha(theme.tertiary, 0.11)}`;
  const shadowCard = `0 20px 44px ${withAlpha(theme.tertiary, 0.1)}`;
  const shadowShell = `0 18px 45px ${withAlpha(theme.tertiary, 0.18)}`;
  const shadowRow = `0 12px 30px ${withAlpha(theme.tertiary, 0.08)}`;
  const shadowAccent = `0 12px 24px ${withAlpha(theme.primary, 0.28)}`;
  const shadowAccentSm = `0 10px 24px ${withAlpha(theme.primary, 0.18)}`;
  const shadowInfo = `0 12px 24px ${withAlpha(infoTone, 0.28)}`;
  const shadowDanger = `0 12px 24px ${withAlpha(dangerTone, 0.32)}`;
  const shadowModal = `0 28px 80px ${withAlpha(theme.tertiary, 0.25)}`;
  const shadowModalLg = `0 30px 90px ${withAlpha(theme.tertiary, 0.24)}`;
  const shadowInsetLight = `inset 0 1px 0 ${withAlpha("#ffffff", 0.12)}`;

  const baseVariables: ThemeVariableMap = {
    "--app-bg": mixHex(theme.secondary, theme.tertiary, 0.1),
    "--shell-bg": theme.secondary,
    "--sidebar-bg-start": theme.tertiary,
    "--sidebar-text": sidebarText,
    "--navbar-bg": mixHex(theme.secondary, "#ffffff", 0.12),
    "--navbar-border": withAlpha(theme.textTertiary, 0.18),
    "--icon-button-bg": mixHex(theme.secondary, "#ffffff", 0.28),
    "--icon-button-border": withAlpha(theme.textTertiary, 0.2),
    "--card-bg": mixHex(theme.secondary, "#ffffff", 0.35),
    "--card-border": withAlpha(theme.textTertiary, 0.16),
    "--text-primary": theme.textSecondary,
    "--text-muted": theme.textTertiary,
    "--primary-accent": theme.primary,
    "--primary-hover": theme.primaryHover,
    "--primary-accent-text": primaryText,
    "--secondary-hover": theme.secondaryHover,
    "--tertiary-hover": theme.tertiaryHover,
    "--surface": surface,
    "--surface-soft": surfaceSoft,
    "--surface-muted": surfaceMuted,
    "--surface-subtle": surfaceSubtle,
    "--surface-panel": panelSurface,
    "--surface-panel-strong": panelSurfaceStrong,
    "--surface-warm": mixHex(theme.primary, "#ffffff", 0.92),
    "--surface-warning": warningSurface,
    "--surface-warning-soft": warningSurfaceSoft,
    "--surface-success": "#edf8f2",
    "--surface-danger": "#fff5f5",
    "--surface-danger-soft": "#fff4f4",
    "--surface-info": "#f2f7ff",
    "--border": withAlpha(theme.textTertiary, 0.24),
    "--border-soft": withAlpha(theme.textTertiary, 0.16),
    "--border-strong": withAlpha(theme.textTertiary, 0.32),
    "--border-warning": warningBorder,
    "--border-danger": "#f2d4d4",
    "--border-success": "#cde7da",
    "--border-info": "#dce8fb",
    "--text-strong": textStrong,
    "--text-label": textLabel,
    "--text-body": theme.textPrimary,
    "--text-secondary": textSecondary,
    "--text-icon": textIcon,
    "--text-placeholder": textPlaceholder,
    "--text-soft": textSoft,
    "--warning": warningText,
    "--success": "#1f7a4d",
    "--danger": "#ab3d3d",
    "--info": "#295693",
    "--neutral": textSecondary,
    "--overlay": overlay,
    "--overlay-strong": overlayStrong,
    "--overlay-soft": overlaySoft,
    "--overlay-muted": overlayMuted,
    "--inverse": inverseText,
    "--inverse-95": withAlpha(inverseText, 0.95),
    "--inverse-80": withAlpha(inverseText, 0.8),
    "--inverse-75": withAlpha(inverseText, 0.75),
    "--inverse-70": withAlpha(inverseText, 0.7),
    "--inverse-60": withAlpha(inverseText, 0.6),
    "--inverse-20": withAlpha(inverseText, 0.2),
    "--inverse-15": withAlpha(inverseText, 0.15),
    "--inverse-10": withAlpha(inverseText, 0.1),
    "--chart-primary": chartPrimary,
    "--chart-primary-soft": chartPrimarySoft,
    "--chart-secondary": chartSecondary,
    "--chart-tertiary": chartTertiary,
    "--chart-grid": chartGrid,
    "--chart-axis": chartAxis,
    "--chart-cursor": chartCursor,
    "--chart-tooltip-bg": surface,
    "--chart-tooltip-border": withAlpha(theme.textTertiary, 0.24),
    "--shadow-soft": shadowSoft,
    "--shadow-soft-sm": shadowSoftSm,
    "--shadow-card": shadowCard,
    "--shadow-shell": shadowShell,
    "--shadow-row": shadowRow,
    "--shadow-accent": shadowAccent,
    "--shadow-accent-sm": shadowAccentSm,
    "--shadow-info": shadowInfo,
    "--shadow-danger": shadowDanger,
    "--shadow-modal": shadowModal,
    "--shadow-modal-lg": shadowModalLg,
    "--shadow-inset-light": shadowInsetLight,
  };

  if (normalizeThemeMode(themeMode) !== "ADVANCED") {
    return baseVariables;
  }

  const normalizedOverrides = normalizeThemeOverrides(themeOverrides);
  const variablesWithOverrides = { ...baseVariables };

  Object.entries(normalizedOverrides).forEach(([token, value]) => {
    const cssVar = resolveOverrideCssVariable(token);
    if (!cssVar) return;
    variablesWithOverrides[cssVar] = value;
  });

  return variablesWithOverrides;
}
