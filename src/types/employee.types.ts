export type Employee = {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
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
