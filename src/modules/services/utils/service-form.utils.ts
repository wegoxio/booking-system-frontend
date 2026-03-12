import type {
  CreateServicePayload,
  Service,
  ServiceFormState,
  UpdateServicePayload,
} from "@/types/service.types";

export const emptyServiceForm: ServiceFormState = {
  name: "",
  description: "",
  duration_minutes: 60,
  capacity: 1,
  price: 0,
  currency: "USD",
  employee_ids: [],
  is_active: true,
};

export function toCreateServicePayload(form: ServiceFormState): CreateServicePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    duration_minutes: form.duration_minutes,
    capacity: form.capacity,
    price: Number(form.price.toFixed(2)),
    currency: form.currency.trim().toUpperCase(),
    is_active: form.is_active,
    employee_ids: form.employee_ids,
  };
}

export function toUpdateServicePayload(form: ServiceFormState): UpdateServicePayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    duration_minutes: form.duration_minutes,
    capacity: form.capacity,
    price: Number(form.price.toFixed(2)),
    currency: form.currency.trim().toUpperCase(),
    employee_ids: form.employee_ids,
    is_active: form.is_active,
  };
}

export function serviceToFormState(service: Service): ServiceFormState {
  return {
    name: service.name,
    description: service.description ?? "",
    duration_minutes: service.duration_minutes,
    capacity: service.capacity,
    price: Number(service.price),
    currency: service.currency,
    employee_ids: service.employees.map((employee) => employee.id),
    is_active: service.is_active,
  };
}
