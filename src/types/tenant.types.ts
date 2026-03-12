export type Tenant = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type CreateTenantPayload = {
  name: string;
  slug: string;
};

export type UpdateTenantPayload = Partial<CreateTenantPayload> & {
  is_active?: boolean;
};
