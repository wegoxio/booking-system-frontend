"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { employeesService } from "@/modules/employees/services/employees.service";
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from "@/types/employee.types";

type EmployeeFormState = {
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
};

const emptyForm: EmployeeFormState = {
  name: "",
  email: "",
  phone: "",
  is_active: true,
};

function validateForm(form: EmployeeFormState): string | null {
  const normalizedName = form.name.trim();
  const normalizedEmail = form.email.trim();
  const normalizedPhone = form.phone.trim();

  if (normalizedName.length < 1 || normalizedName.length > 120) {
    return "El nombre debe tener entre 1 y 120 caracteres.";
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return "Debes ingresar un correo valido.";
  }

  if (normalizedPhone.length > 0 && normalizedPhone.length < 3) {
    return "El telefono debe tener al menos 3 caracteres.";
  }

  return null;
}

export default function EmployeesManagement() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeEmployeesCount = useMemo(
    () => employees.filter((employee) => employee.is_active).length,
    [employees],
  );

  const loadEmployees = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await employeesService.findAll(token);
      setEmployees(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cargar employees.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) return;

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const basePayload: CreateEmployeePayload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || undefined,
    };

    setIsSaving(true);
    setFormError("");

    try {
      if (editingId) {
        const payload: UpdateEmployeePayload = {
          ...basePayload,
          is_active: form.is_active,
        };
        await employeesService.update(editingId, payload, token);
      } else {
        await employeesService.create(basePayload, token);
      }

      await loadEmployees();
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar employee.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? "",
      is_active: employee.is_active,
    });
    setFormError("");
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#e4e4e8] bg-[#fafafc] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#2b2f3a]">Employees</h2>
            <p className="mt-1 text-sm text-[#6f7380]">
              Gestiona el personal que atiende servicios de tu tenant.
            </p>
          </div>

          <div className="rounded-lg border border-[#e4e4e8] bg-white px-3 py-2 text-sm text-[#4f5563]">
            Activos: <span className="font-semibold">{activeEmployeesCount}</span> /{" "}
            {employees.length}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.8fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-[#e4e4e8] bg-[#fafafc] p-5"
        >
          <h3 className="text-lg font-semibold text-[#2b2f3a]">
            {editingId ? "Editar employee" : "Crear employee"}
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="employee-name" className="text-sm font-medium text-[#3f4655]">
              Nombre
            </label>
            <input
              id="employee-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
              placeholder="Ej: Ana Lopez"
              required
              maxLength={120}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="employee-email" className="text-sm font-medium text-[#3f4655]">
              Email
            </label>
            <input
              id="employee-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
              placeholder="empleado@empresa.com"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="employee-phone" className="text-sm font-medium text-[#3f4655]">
              Telefono (opcional)
            </label>
            <input
              id="employee-phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-lg border border-[#d9dce4] bg-white px-3 py-2 text-sm"
              placeholder="+34 600 000 000"
              maxLength={30}
            />
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
              Employee activo
            </label>
          )}

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-[#efc35f] px-4 py-2 text-sm font-medium text-[#2f3543] disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear employee"}
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
            <p className="mt-4 text-sm text-[#6f7380]">Cargando employees...</p>
          ) : errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : employees.length === 0 ? (
            <p className="mt-4 text-sm text-[#6f7380]">
              No hay employees registrados todavia.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-[#6f7380]">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Telefono</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-t border-[#eceef2] text-[#2d3340]">
                      <td className="py-2.5">{employee.name}</td>
                      <td className="py-2.5">{employee.email}</td>
                      <td className="py-2.5">{employee.phone ?? "-"}</td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            employee.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {employee.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(employee)}
                          className="rounded-md border border-[#d8dae1] bg-white px-2.5 py-1.5 text-xs text-[#424857]"
                        >
                          Editar
                        </button>
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
