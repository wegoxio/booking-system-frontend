"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { employeesService } from "@/modules/employees/services/employees.service";
import { servicesService } from "@/modules/services/services/services.service";
import type { Employee } from "@/types/employee.types";
import type {
  CreateServicePayload,
  Service,
  UpdateServicePayload,
} from "@/types/service.types";

type ServiceFormState = {
  name: string;
  description: string;
  duration_minutes: number;
  capacity: number;
  price: number;
  currency: string;
  employee_ids: string[];
  is_active: boolean;
};

const emptyForm: ServiceFormState = {
  name: "",
  description: "",
  duration_minutes: 60,
  capacity: 1,
  price: 0,
  currency: "USD",
  employee_ids: [],
  is_active: true,
};

function validateServiceForm(form: ServiceFormState): string | null {
  const normalizedName = form.name.trim();
  const normalizedCurrency = form.currency.trim().toUpperCase();

  if (normalizedName.length < 1 || normalizedName.length > 120) {
    return "El nombre debe tener entre 1 y 120 caracteres.";
  }
  if (!Number.isInteger(form.duration_minutes) || form.duration_minutes <= 0) {
    return "La duracion debe ser un entero positivo.";
  }
  if (!Number.isInteger(form.capacity) || form.capacity <= 0) {
    return "La capacidad debe ser un entero positivo.";
  }
  if (!Number.isFinite(form.price) || form.price < 0) {
    return "El precio debe ser mayor o igual a 0.";
  }
  if (normalizedCurrency.length !== 3) {
    return "La moneda debe tener 3 caracteres (ej. USD, EUR).";
  }
  if (form.employee_ids.length === 0) {
    return "Debes asignar al menos 1 employee al servicio.";
  }
  return null;
}

function toCreatePayload(form: ServiceFormState): CreateServicePayload {
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

function toUpdatePayload(form: ServiceFormState): UpdateServicePayload {
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

function serviceToForm(service: Service): ServiceFormState {
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

export default function ServicesManagement() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.is_active),
    [employees],
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [servicesData, employeesData] = await Promise.all([
        servicesService.findAll(token),
        employeesService.findAll(token),
      ]);
      setServices(servicesData);
      setEmployees(employeesData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cargar informacion.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setForm((prev) => {
      const selected = new Set(prev.employee_ids);
      if (selected.has(employeeId)) {
        selected.delete(employeeId);
      } else {
        selected.add(employeeId);
      }
      return { ...prev, employee_ids: Array.from(selected) };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const validationError = validateServiceForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await servicesService.update(editingId, toUpdatePayload(form), token);
      } else {
        await servicesService.create(toCreatePayload(form), token);
      }
      await loadData();
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el servicio.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setForm(serviceToForm(service));
    setFormError("");
  };

  const handleToggleServiceStatus = async (service: Service) => {
    if (!token) return;
    setIsTogglingId(service.id);
    try {
      await servicesService.toggleStatus(
        service.id,
        { is_active: !service.is_active },
        token,
      );
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cambiar el estado.";
      setErrorMessage(message);
    } finally {
      setIsTogglingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#e4e4e8] bg-[#fafafc] p-6">
        <h2 className="text-2xl font-semibold text-[#2b2f3a]">Services</h2>
        <p className="mt-1 text-sm text-[#6f7380]">
          Crea y edita servicios del tenant. Cada servicio debe tener al menos un
          employee asignado.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.8fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-[#e4e4e8] bg-[#fafafc] p-5"
        >
          <h3 className="text-lg font-semibold text-[#2b2f3a]">
            {editingId ? "Editar service" : "Crear service"}
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="service-name" className="text-sm font-medium text-[#3f4655]">
              Nombre
            </label>
            <input
              id="service-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
              placeholder="Ej: Corte + Barba"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="service-description"
              className="text-sm font-medium text-[#3f4655]"
            >
              Descripcion
            </label>
            <textarea
              id="service-description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="min-h-[90px] w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
              placeholder="Opcional"
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label
                htmlFor="service-duration"
                className="text-sm font-medium text-[#3f4655]"
              >
                Duracion (min)
              </label>
              <input
                id="service-duration"
                type="number"
                min={1}
                step={1}
                value={form.duration_minutes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    duration_minutes: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-capacity"
                className="text-sm font-medium text-[#3f4655]"
              >
                Capacidad
              </label>
              <input
                id="service-capacity"
                type="number"
                min={1}
                step={1}
                value={form.capacity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))
                }
                className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="service-price" className="text-sm font-medium text-[#3f4655]">
                Precio
              </label>
              <input
                id="service-price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: Number(event.target.value) }))
                }
                className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-currency"
                className="text-sm font-medium text-[#3f4655]"
              >
                Moneda
              </label>
              <input
                id="service-currency"
                value={form.currency}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currency: event.target.value }))
                }
                className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm uppercase"
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-[#3f4655]">Employees asignados</p>
            {activeEmployees.length === 0 ? (
              <p className="text-sm text-[#6f7380]">
                No hay employees activos. Crea employees en el modulo correspondiente.
              </p>
            ) : (
              <div className="grid gap-1.5 rounded-lg border border-[#d9dce4] bg-white p-3">
                {activeEmployees.map((employee) => (
                  <label key={employee.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.employee_ids.includes(employee.id)}
                      onChange={() => handleEmployeeToggle(employee.id)}
                    />
                    <span className="text-[#2f3543]">
                      {employee.name} <span className="text-[#737a88]">({employee.email})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {editingId && (
            <label className="flex items-center gap-2 text-sm text-[#3f4655]">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, is_active: event.target.checked }))
                }
              />
              Service activo
            </label>
          )}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-[#efc35f] px-4 py-2 text-sm font-medium text-[#2f3543] disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear service"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#d8dae1] bg-white px-4 py-2 text-sm text-[#454b59]"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="rounded-xl border border-[#e4e4e8] bg-[#fafafc] p-5">
          <h3 className="text-lg font-semibold text-[#2b2f3a]">Listado</h3>

          {isLoading ? (
            <p className="mt-4 text-sm text-[#6f7380]">Cargando services...</p>
          ) : errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : services.length === 0 ? (
            <p className="mt-4 text-sm text-[#6f7380]">No hay services registrados.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="text-[#6f7380]">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Duracion</th>
                    <th className="pb-2 font-medium">Precio</th>
                    <th className="pb-2 font-medium">Employees</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-t border-[#eceef2] text-[#2d3340]">
                      <td className="py-2.5">{service.name}</td>
                      <td className="py-2.5">{service.duration_minutes} min</td>
                      <td className="py-2.5">
                        {service.currency} {service.price}
                      </td>
                      <td className="py-2.5">{service.employees.map((e) => e.name).join(", ")}</td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            service.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {service.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(service)}
                            className="rounded-md border border-[#d8dae1] bg-white px-2.5 py-1.5 text-xs text-[#424857]"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleServiceStatus(service)}
                            disabled={isTogglingId === service.id}
                            className="rounded-md border border-[#d8dae1] bg-white px-2.5 py-1.5 text-xs text-[#424857] disabled:opacity-60"
                          >
                            {isTogglingId === service.id
                              ? "Actualizando..."
                              : service.is_active
                                ? "Desactivar"
                                : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
