import { apiFetch } from "@/modules/http/services/api";
import type {
  TenantSettingsRecord,
  UpdateTenantSettingsPayload,
} from "@/types/tenant-settings.types";

export type TenantSettingsAssetType = "logo" | "favicon";

function createAssetFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export const tenantSettingsService = {
  findPlatform: async (token: string): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>("/tenant-settings/platform/me", {
      method: "GET",
      token,
    });
  },

  updatePlatform: async (
    payload: UpdateTenantSettingsPayload,
    token: string,
  ): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>("/tenant-settings/platform/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  uploadPlatformAsset: async (
    assetType: TenantSettingsAssetType,
    file: File,
    token: string,
  ): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>(
      `/tenant-settings/platform/me/assets/${assetType}`,
      {
        method: "POST",
        token,
        body: createAssetFormData(file),
      },
    );
  },

  findMine: async (token: string): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>("/tenant-settings/me", {
      method: "GET",
      token,
    });
  },

  updateMine: async (
    payload: UpdateTenantSettingsPayload,
    token: string,
  ): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>("/tenant-settings/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  uploadMineAsset: async (
    assetType: TenantSettingsAssetType,
    file: File,
    token: string,
  ): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>(`/tenant-settings/me/assets/${assetType}`, {
      method: "POST",
      token,
      body: createAssetFormData(file),
    });
  },

  findByTenantId: async (tenantId: string, token: string): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>(`/tenant-settings/${tenantId}`, {
      method: "GET",
      token,
    });
  },

  updateByTenantId: async (
    tenantId: string,
    payload: UpdateTenantSettingsPayload,
    token: string,
  ): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>(`/tenant-settings/${tenantId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  uploadAssetByTenantId: async (
    tenantId: string,
    assetType: TenantSettingsAssetType,
    file: File,
    token: string,
  ): Promise<TenantSettingsRecord> => {
    return apiFetch<TenantSettingsRecord>(
      `/tenant-settings/${tenantId}/assets/${assetType}`,
      {
        method: "POST",
        token,
        body: createAssetFormData(file),
      },
    );
  },
};
