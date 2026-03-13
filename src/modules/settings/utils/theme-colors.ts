import type { TenantThemeSettings } from "@/types/tenant-settings.types";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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

export function createThemeVariables(theme: TenantThemeSettings) {
  const sidebarText = ensureReadableText(theme.tertiary, theme.textSecondary);
  const primaryText = ensureReadableText(theme.primary, theme.textPrimary);

  return {
    "--app-bg": mixHex(theme.secondary, theme.tertiary, 0.1),
    "--shell-bg": theme.secondary,
    "--sidebar-bg-start": theme.tertiary,
    "--sidebar-bg-end": theme.tertiaryHover,
    "--sidebar-text": sidebarText,
    "--sidebar-hover-bg": theme.tertiaryHover,
    "--sidebar-active-bg": theme.primary,
    "--sidebar-active-text": primaryText,
    "--navbar-bg": mixHex(theme.secondary, "#ffffff", 0.12),
    "--navbar-border": withAlpha(theme.textTertiary, 0.18),
    "--icon-button-bg": mixHex(theme.secondary, "#ffffff", 0.28),
    "--icon-button-border": withAlpha(theme.textTertiary, 0.2),
    "--icon-button-text": theme.textSecondary,
    "--icon-button-hover": theme.secondaryHover,
    "--card-bg": mixHex(theme.secondary, "#ffffff", 0.35),
    "--card-border": withAlpha(theme.textTertiary, 0.16),
    "--text-primary": theme.textSecondary,
    "--text-muted": theme.textTertiary,
    "--primary-accent": theme.primary,
    "--primary-hover": theme.primaryHover,
    "--primary-accent-text": primaryText,
    "--secondary-hover": theme.secondaryHover,
    "--tertiary-hover": theme.tertiaryHover,
  };
}
