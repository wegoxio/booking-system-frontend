"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users2,
  X,
} from "lucide-react";
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

const LOAD_DELAY_MS = 1200;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarTone(seed: string) {
  const tones = [
    "bg-amber-100 text-amber-700 ring-amber-200",
    "bg-sky-100 text-sky-700 ring-sky-200",
    "bg-emerald-100 text-emerald-700 ring-emerald-200",
    "bg-rose-100 text-rose-700 ring-rose-200",
    "bg-violet-100 text-violet-700 ring-violet-200",
  ];
  const index = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % tones.length;
  return tones[index];
}

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-[#e8ebf2] ${className}`} />;
}

function EmployeeAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const sizing = size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ${sizing} ${getAvatarTone(
        name,
      )}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

function EmployeesTableSkeleton() {
  return (
    <div className="rounded-[28px] border border-[#e4e4e8] bg-[#fafafc] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-32" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
        <SkeletonBlock className="h-10 w-36" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid animate-pulse gap-3 rounded-3xl border border-[#edf0f5] bg-white p-4 md:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_0.8fr]"
          >
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeEmployeesCount = useMemo(
    () => employees.filter((employee) => employee.is_active).length,
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return employees;
    }

    return employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.email} ${employee.phone ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [employees, searchQuery]);

  const loadEmployees = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await employeesService.findAll(token);
      await wait(LOAD_DELAY_MS);
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

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? "",
      is_active: employee.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
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
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar employee.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-[#e4e4e8] bg-[linear-gradient(135deg,#fffdf7_0%,#f6f8fc_100%)] p-6 shadow-[0_18px_40px_rgba(22,31,57,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f2e2b4] bg-[#fff6dd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9c6a00]">
              <Sparkles className="h-3.5 w-3.5" />
              Team Studio
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#202534]">
              Employees
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-[#6f7380]">
              Gestiona el personal que atiende servicios y mantiene operativa la agenda.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Employees
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">{employees.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Activos
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">
                {activeEmployeesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <EmployeesTableSkeleton />
      ) : (
        <div className="rounded-[28px] border border-[#e4e4e8] bg-[#fafafc] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2b2f3a]">Listado</h3>
              <p className="text-sm text-[#7a8192]">
                Vista del equipo, disponibilidad y datos de contacto.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a90a2]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-[#e2e6ee] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2f3543] outline-none transition focus:border-[#efc35f]"
                  placeholder="Buscar por nombre, email o telefono"
                />
              </label>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#efc35f] px-4 py-2.5 text-sm font-medium text-[#2f3543] shadow-[0_12px_24px_rgba(239,195,95,0.28)] transition hover:brightness-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Crear employee
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : filteredEmployees.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#d9dce4] bg-white px-6 py-10 text-center">
              <p className="text-base font-medium text-[#2f3543]">
                {employees.length === 0
                  ? "No hay employees registrados todavia."
                  : "No hay resultados para esa busqueda."}
              </p>
              <p className="mt-2 text-sm text-[#7a8192]">
                {employees.length === 0
                  ? "Crea el primero para comenzar a asignar servicios."
                  : "Prueba otro termino o limpia el filtro actual."}
              </p>
              {employees.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#ead9a5] bg-[#fff8e6] px-4 py-2 text-sm font-medium text-[#7a5c08]"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo employee
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-left text-sm">
                <thead>
                  <tr className="text-[#6f7380]">
                    <th className="px-4 pb-2 font-medium">Nombre</th>
                    <th className="px-4 pb-2 font-medium">Email</th>
                    <th className="px-4 pb-2 font-medium">Telefono</th>
                    <th className="px-4 pb-2 font-medium">Rol visual</th>
                    <th className="px-4 pb-2 font-medium">Estado</th>
                    <th className="px-4 pb-2 font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="text-[#2d3340] shadow-[0_12px_30px_rgba(17,24,39,0.04)]"
                    >
                      <td className="rounded-l-[24px] border-y border-l border-[#eceef2] bg-white px-4 py-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar name={employee.name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#202534]">{employee.name}</p>
                            <p className="text-xs text-[#7a8192]">ID interno del staff</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <div className="inline-flex items-center gap-2 text-[#52607a]">
                          <Mail className="h-4 w-4" />
                          <span>{employee.email}</span>
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <div className="inline-flex items-center gap-2 text-[#52607a]">
                          <Phone className="h-4 w-4" />
                          <span>{employee.phone ?? "Sin telefono"}</span>
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f6fb] px-3 py-1.5 text-xs font-medium text-[#52607a]">
                          <UserRound className="h-3.5 w-3.5" />
                          Staff operativo
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            employee.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {employee.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="rounded-r-[24px] border-y border-r border-[#eceef2] bg-white px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          className="rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#424857]"
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 bg-[rgba(15,23,42,0.46)] backdrop-blur-[6px]"
            onClick={closeModal}
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf0f5] px-6 py-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f2e2b4] bg-[#fff6dd] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9c6a00]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {editingId ? "Edit Employee" : "New Employee"}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#202534]">
                  {editingId ? "Editar employee" : "Crear employee"}
                </h3>
                <p className="mt-1 text-sm text-[#7a8192]">
                  Mantiene actualizada la informacion del equipo desde un flujo simple.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e7ee] bg-white text-[#4c576d]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="employee-name" className="text-sm font-medium text-[#3f4655]">
                      Nombre
                    </label>
                    <input
                      id="employee-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
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
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                      placeholder="empleado@empresa.com"
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="employee-phone" className="text-sm font-medium text-[#3f4655]">
                      Telefono
                    </label>
                    <input
                      id="employee-phone"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                      placeholder="+34 600 000 000"
                      maxLength={30}
                    />
                  </div>

                  {editingId && (
                    <label className="flex items-center gap-2 rounded-2xl border border-[#e7ebf3] bg-white px-4 py-3 text-sm text-[#3f4655]">
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
                </div>

                <div className="space-y-4 rounded-[28px] border border-[#e2e6ee] bg-white/80 p-5">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar name={form.name || "Nuevo Employee"} />
                    <div>
                      <p className="font-semibold text-[#202534]">
                        {form.name.trim() || "Nuevo Employee"}
                      </p>
                      <p className="text-sm text-[#7a8192]">
                        {form.email.trim() || "correo@empresa.com"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <Mail className="h-4 w-4 text-[#65728a]" />
                        Contacto principal
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        Usa un email real para notificaciones y asignaciones operativas.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <Phone className="h-4 w-4 text-[#65728a]" />
                        Telefono de soporte
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        {form.phone.trim() || "Aun no se ha definido un telefono para este perfil."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <ShieldCheck className="h-4 w-4 text-[#65728a]" />
                        Estado del perfil
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        {editingId
                          ? form.is_active
                            ? "Este employee aparecera disponible para asignaciones."
                            : "Este employee quedara oculto de los flujos activos."
                          : "El nuevo employee se creara como activo por defecto."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#edf0f5] bg-white/75 px-6 py-4">
                {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#7a8192]">
                    Esta acción editará la información del usuario permanentemente.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-xl border border-[#d8dae1] bg-white px-4 py-2.5 text-sm text-[#454b59]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-[#efc35f] px-4 py-2.5 text-sm font-medium text-[#2f3543] shadow-[0_12px_24px_rgba(239,195,95,0.28)] transition hover:brightness-[0.98] disabled:opacity-60"
                    >
                      {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear employee"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
