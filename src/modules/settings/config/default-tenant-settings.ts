import type { TenantSettings } from "@/types/tenant-settings.types";

export const defaultTenantSettings: TenantSettings = {
  theme: {
    primary: "#efc35f",
    secondary: "#e9e9ed",
    tertiary: "#5f6470",
    primaryHover: "#d6ad50",
    secondaryHover: "#ececef",
    tertiaryHover: "#4a4f5b",
    textPrimary: "#2f3543",
    textSecondary: "#2d313b",
    textTertiary: "#6f7380",
  },
  themeMode: "AUTO",
  themeOverrides: {},
  branding: {
    appName: "wegox",
    windowTitle: "Wegox Booking System",
    logoUrl: "/wegox-logo.svg",
    faviconUrl: "/favicon.ico",
  },
};
