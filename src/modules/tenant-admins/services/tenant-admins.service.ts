import { apiFetch } from "@/modules/http/services/api";
import type {
  CreateTenantAdminPayload,
  TenantAdmin,
  UpdateTenantAdminPayload,
} from "@/types/tenant-admin.types";

export const tenantAdminsService = {
  findAll: async (token: string): Promise<TenantAdmin[]> => {
    return apiFetch<TenantAdmin[]>("/users/tenant-admins", {
      method: "GET",
      token,
    });
  },

  create: async (
    payload: CreateTenantAdminPayload,
    token: string,
  ): Promise<TenantAdmin> => {
    return apiFetch<TenantAdmin>("/users/tenant-admins", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: UpdateTenantAdminPayload,
    token: string,
  ): Promise<TenantAdmin> => {
    return apiFetch<TenantAdmin>(`/users/tenant-admins/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  remove: async (id: string, token: string): Promise<{ id: string }> => {
    return apiFetch<{ id: string }>(`/users/tenant-admins/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
