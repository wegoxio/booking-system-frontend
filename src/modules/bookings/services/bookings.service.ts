import { apiFetch } from "@/modules/http/services/api";
import type {
  AvailabilityQuery,
  AvailabilityResponse,
  Booking,
  CreateEmployeeTimeOffPayload,
  CreateBookingPayload,
  CreateManualBookingPayload,
  EmployeeTimeOffRecord,
  EmployeeScheduleResponse,
  ListBookingsQuery,
  PublicBookingConfirmation,
  PublicBookingEmployee,
  PublicBookingService,
  SetEmployeeSchedulePayload,
  UpdateBookingStatusPayload,
} from "@/types/booking.types";
import type { Employee } from "@/types/employee.types";

function toQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value || value.trim().length === 0) return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const bookingsService = {
  findPublicServices: async (tenantSlug: string): Promise<PublicBookingService[]> => {
    return apiFetch<PublicBookingService[]>(
      `/public/tenants/${encodeURIComponent(tenantSlug)}/bookings/services`,
      {
        method: "GET",
      },
    );
  },

  findPublicEligibleEmployees: async (
    tenantSlug: string,
    serviceIds: string[],
  ): Promise<PublicBookingEmployee[]> => {
    const query = toQueryString({
      service_ids: serviceIds.join(","),
    });
    return apiFetch<PublicBookingEmployee[]>(
      `/public/tenants/${encodeURIComponent(tenantSlug)}/bookings/eligible-employees${query}`,
      {
        method: "GET",
      },
    );
  },

  getPublicAvailability: async (
    tenantSlug: string,
    query: AvailabilityQuery,
  ): Promise<AvailabilityResponse> => {
    const queryString = toQueryString({
      employee_id: query.employee_id,
      service_ids: query.service_ids.join(","),
      date: query.date,
      timezone: query.timezone,
    });
    return apiFetch<AvailabilityResponse>(
      `/public/tenants/${encodeURIComponent(tenantSlug)}/bookings/availability${queryString}`,
      {
        method: "GET",
      },
    );
  },

  createPublic: async (
    tenantSlug: string,
    payload: CreateBookingPayload,
  ): Promise<PublicBookingConfirmation> => {
    return apiFetch<PublicBookingConfirmation>(
      `/public/tenants/${encodeURIComponent(tenantSlug)}/bookings`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  findEligibleEmployees: async (serviceIds: string[], token: string): Promise<Employee[]> => {
    const query = toQueryString({
      service_ids: serviceIds.join(","),
    });
    return apiFetch<Employee[]>(`/bookings/eligible-employees${query}`, {
      method: "GET",
      token,
    });
  },

  getAvailability: async (query: AvailabilityQuery, token: string): Promise<AvailabilityResponse> => {
    const queryString = toQueryString({
      employee_id: query.employee_id,
      service_ids: query.service_ids.join(","),
      date: query.date,
      timezone: query.timezone,
    });
    return apiFetch<AvailabilityResponse>(`/bookings/availability${queryString}`, {
      method: "GET",
      token,
    });
  },

  create: async (payload: CreateBookingPayload, token: string): Promise<Booking> => {
    return apiFetch<Booking>("/bookings", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  createManual: async (
    payload: CreateManualBookingPayload,
    token: string,
  ): Promise<Booking> => {
    return apiFetch<Booking>("/bookings/manual", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  findAll: async (query: ListBookingsQuery, token: string): Promise<Booking[]> => {
    const queryString = toQueryString({
      employee_id: query.employee_id,
      date: query.date,
      status: query.status,
    });
    return apiFetch<Booking[]>(`/bookings${queryString}`, {
      method: "GET",
      token,
    });
  },

  findOne: async (id: string, token: string): Promise<Booking> => {
    return apiFetch<Booking>(`/bookings/${id}`, {
      method: "GET",
      token,
    });
  },

  getEmployeeSchedule: async (
    employeeId: string,
    token: string,
  ): Promise<EmployeeScheduleResponse> => {
    return apiFetch<EmployeeScheduleResponse>(`/bookings/employees/${employeeId}/schedule`, {
      method: "GET",
      token,
    });
  },

  setEmployeeSchedule: async (
    employeeId: string,
    payload: SetEmployeeSchedulePayload,
    token: string,
  ): Promise<EmployeeScheduleResponse> => {
    return apiFetch<EmployeeScheduleResponse>(`/bookings/employees/${employeeId}/schedule`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },

  createEmployeeTimeOff: async (
    employeeId: string,
    payload: CreateEmployeeTimeOffPayload,
    token: string,
  ): Promise<EmployeeTimeOffRecord> => {
    return apiFetch<EmployeeTimeOffRecord>(`/bookings/employees/${employeeId}/time-off`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  removeEmployeeTimeOff: async (
    employeeId: string,
    timeOffId: string,
    token: string,
  ): Promise<{ id: string }> => {
    return apiFetch<{ id: string }>(
      `/bookings/employees/${employeeId}/time-off/${timeOffId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  updateStatus: async (
    id: string,
    payload: UpdateBookingStatusPayload,
    token: string,
  ): Promise<Booking> => {
    return apiFetch<Booking>(`/bookings/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
};
