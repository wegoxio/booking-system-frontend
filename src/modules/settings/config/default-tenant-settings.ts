import type { TenantSettings } from "@/types/tenant-settings.types";
import { normalizeThemeSettings } from "@/modules/settings/utils/theme-colors";

export const defaultTenantSettings: TenantSettings = {
  theme: normalizeThemeSettings({
    primary: "#efc35f",
    secondary: "#e9e9ed",
    tertiary: "#5f6470",
    textPrimary: "#2f3543",
    textSecondary: "#2d313b",
  }),
  themeMode: "AUTO",
  themeOverrides: {},
  branding: {
    appName: "wegox",
    windowTitle: "Wegox Booking System",
    logoUrl: "/wegox-logo.svg",
    faviconUrl: "/favicon.ico",
  },
};
