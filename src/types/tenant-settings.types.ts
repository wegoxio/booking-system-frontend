export type TenantThemeSettings = {
  appBg: string;
  shellBg: string;
  sidebarBgStart: string;
  sidebarBgEnd: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  navbarBg: string;
  navbarBorder: string;
  iconButtonBg: string;
  iconButtonBorder: string;
  iconButtonText: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  primaryAccent: string;
  primaryAccentText: string;
};

export type TenantBrandingSettings = {
  appName: string;
  windowTitle: string;
  logoUrl: string;
  faviconUrl: string;
};

export type TenantSettings = {
  theme: TenantThemeSettings;
  branding: TenantBrandingSettings;
};

export type TenantSettingsRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string | null;
  scope?: string;
  theme: TenantThemeSettings;
  branding: TenantBrandingSettings;
  logo_key: string | null;
  favicon_key: string | null;
};

export type UpdateTenantSettingsPayload = {
  theme?: Partial<TenantThemeSettings>;
  branding?: Partial<TenantBrandingSettings>;
};
