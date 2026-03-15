export type Employee = {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  schedule_timezone?: string;
  slot_interval_minutes?: number;
  is_active: boolean;
};

export type CreateEmployeePayload = {
  name: string;
  email: string;
  phone?: string;
};

export type UpdateEmployeePayload = Partial<CreateEmployeePayload> & {
  is_active?: boolean;
};

export type EmployeeFormState = {
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
};
