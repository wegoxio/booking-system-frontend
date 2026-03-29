import { apiFetch } from "@/modules/http/services/api";
import type {
  CreateTenantPayload,
  Tenant,
  UpdateTenantPayload,
} from "@/types/tenant.types";

export const tenantsService = {
  findAll: async (token: string): Promise<Tenant[]> => {
    return apiFetch<Tenant[]>("/tenant", {
      method: "GET",
      token,
    });
  },

  create: async (payload: CreateTenantPayload, token: string): Promise<Tenant> => {
    return apiFetch<Tenant>("/tenant", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: UpdateTenantPayload,
    token: string,
  ): Promise<Tenant> => {
    return apiFetch<Tenant>(`/tenant/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
};
