export type TenantAdmin = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  role: "TENANT_ADMIN";
  tenant_id: string;
  is_active: boolean;
  tenant: {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
  } | null;
};

export type CreateTenantAdminPayload = {
  name: string;
  email: string;
  password: string;
  tenant_id: string;
};

export type UpdateTenantAdminPayload = Partial<CreateTenantAdminPayload> & {
  is_active?: boolean;
};


export type TenantAdminFormState = {
  name: string;
  email: string;
  password: string;
  tenant_id: string;
  is_active: boolean;
};