import type { Employee } from "./employee.types";

export type Service = {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  capacity: number;
  price: string;
  currency: string;
  is_active: boolean;
  sort_order: number;
  requires_confirmation: boolean;
  min_notice_minutes: number;
  booking_window_days: number;
  employees: Employee[];
};

export type CreateServicePayload = {
  name: string;
  description?: string;
  duration_minutes: number;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
  capacity?: number;
  price: number;
  currency?: string;
  is_active?: boolean;
  sort_order?: number;
  requires_confirmation?: boolean;
  min_notice_minutes?: number;
  booking_window_days?: number;
  employee_ids: string[];
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

export type ToggleServiceStatusPayload = {
  is_active: boolean;
};
