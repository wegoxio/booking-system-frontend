import { apiFetch } from "@/modules/http/services/api";
import type {
  CreateServicePayload,
  Service,
  ToggleServiceStatusPayload,
  UpdateServicePayload,
} from "@/types/service.types";

export const servicesService = {
  findAll: async (token: string): Promise<Service[]> => {
    return apiFetch<Service[]>("/services", {
      method: "GET",
      token,
    });
  },

  create: async (payload: CreateServicePayload, token: string): Promise<Service> => {
    return apiFetch<Service>("/services", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: UpdateServicePayload,
    token: string,
  ): Promise<Service> => {
    return apiFetch<Service>(`/services/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  toggleStatus: async (
    id: string,
    payload: ToggleServiceStatusPayload,
    token: string,
  ): Promise<Service> => {
    return apiFetch<Service>(`/services/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
};
