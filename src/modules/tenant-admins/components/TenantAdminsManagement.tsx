"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/modules/employees/components/components/Avatar";
import { tenantAdminsService } from "@/modules/tenant-admins/services/tenant-admins.service";
import { tenantsService } from "@/modules/tenants/services/tenants.service";
import ConfirmDeleteModal from "@/modules/ui/ConfirmDeleteModal";
import type {
  CreateTenantAdminPayload,
  TenantAdmin,
  UpdateTenantAdminPayload,
} from "@/types/tenant-admin.types";
import type { Tenant } from "@/types/tenant.types";

type TenantAdminFormState = {
  name: string;
  email: string;
  password: string;
  tenant_id: string;
  is_active: boolean;
};

const emptyForm: TenantAdminFormState = {
  name: "",
  email: "",
  password: "",
  tenant_id: "",
  is_active: true,
};

const LOAD_DELAY_MS = 600;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function validateForm(form: TenantAdminFormState, isEditing: boolean): string | null {
  const normalizedName = form.name.trim();
  const normalizedEmail = form.email.trim();

  if (normalizedName.length < 1 || normalizedName.length > 120) {
    return "El nombre debe tener entre 1 y 120 caracteres.";
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return "Debes ingresar un correo valido.";
  }

  if (!form.tenant_id) {
    return "Debes asignar un tenant.";
  }

  if (!isEditing || form.password.trim()) {
    if (!isStrongPassword(form.password.trim())) {
      return "La password debe tener 8+ caracteres, mayuscula, minuscula, numero y simbolo.";
    }
  }

  return null;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#e8ebf2] ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-[28px] border border-[#e4e4e8] bg-[#fafafc] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <SkeletonBlock className="h-10 w-40" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid animate-pulse gap-3 rounded-3xl border border-[#edf0f5] bg-white p-4 md:grid-cols-[1.4fr_1.5fr_1.3fr_0.9fr_1fr]"
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

export default function TenantAdminsManagement() {
  const { token } = useAuth();
  const [tenantAdmins, setTenantAdmins] = useState<TenantAdmin[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<TenantAdminFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantAdminToDelete, setTenantAdminToDelete] = useState<TenantAdmin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeTenantAdminsCount = useMemo(
    () => tenantAdmins.filter((tenantAdmin) => tenantAdmin.is_active).length,
    [tenantAdmins],
  );

  const managedTenantsCount = useMemo(
    () => new Set(tenantAdmins.map((tenantAdmin) => tenantAdmin.tenant_id)).size,
    [tenantAdmins],
  );

  const filteredTenantAdmins = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return tenantAdmins;
    }

    return tenantAdmins.filter((tenantAdmin) => {
      const haystack = `${tenantAdmin.name} ${tenantAdmin.email} ${tenantAdmin.tenant?.name ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [tenantAdmins, searchQuery]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [tenantAdminsData, tenantsData] = await Promise.all([
        tenantAdminsService.findAll(token),
        tenantsService.findAll(token),
      ]);
      await wait(LOAD_DELAY_MS);
      setTenantAdmins(tenantAdminsData);
      setTenants(tenantsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar informacion.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
    if (tenants.length > 0) {
      setForm((prev) => ({ ...prev, tenant_id: tenants[0].id }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (tenantAdmin: TenantAdmin) => {
    setEditingId(tenantAdmin.id);
    setForm({
      name: tenantAdmin.name,
      email: tenantAdmin.email,
      password: "",
      tenant_id: tenantAdmin.tenant_id,
      is_active: tenantAdmin.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (tenantAdmin: TenantAdmin) => {
    setTenantAdminToDelete(tenantAdmin);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setTenantAdminToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!token || !tenantAdminToDelete) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await tenantAdminsService.remove(tenantAdminToDelete.id, token);
      await loadData();
      setTenantAdminToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar tenant admin.";
      setErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const isEditing = !!editingId;
    const validationError = validateForm(form, isEditing);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const basePayload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      tenant_id: form.tenant_id,
    };

    setIsSaving(true);
    setFormError("");

    try {
      if (editingId) {
        const payload: UpdateTenantAdminPayload = {
          ...basePayload,
          is_active: form.is_active,
        };

        if (form.password.trim()) {
          payload.password = form.password.trim();
        }

        await tenantAdminsService.update(editingId, payload, token);
      } else {
        const payload: CreateTenantAdminPayload = {
          ...basePayload,
          password: form.password.trim(),
        };
        await tenantAdminsService.create(payload, token);
      }

      await loadData();
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar tenant admin.";
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
              <Users2 className="h-3.5 w-3.5" />
              Super Admin
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#202534]">
              Tenant Admins
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-[#6f7380]">
              Gestiona cuentas administrativas por tenant y su estado de acceso.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Admins
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">
                {tenantAdmins.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Activos
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">
                {activeTenantAdminsCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Tenants cubiertos
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">
                {managedTenantsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-[28px] border border-[#e4e4e8] bg-[#fafafc] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2b2f3a]">Listado</h3>
              <p className="text-sm text-[#7a8192]">
                Usuarios con rol tenant admin y tenant asignado.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a90a2]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-[#e2e6ee] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2f3543] outline-none transition focus:border-[#efc35f]"
                  placeholder="Buscar por nombre, email o tenant"
                />
              </label>
              <button
                type="button"
                onClick={openCreateModal}
                disabled={tenants.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#efc35f] px-4 py-2.5 text-sm font-medium text-[#2f3543] shadow-[0_12px_24px_rgba(239,195,95,0.28)] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Crear tenant admin
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : filteredTenantAdmins.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#d9dce4] bg-white px-6 py-10 text-center">
              <p className="text-base font-medium text-[#2f3543]">
                {tenantAdmins.length === 0
                  ? "No hay tenant admins registrados todavia."
                  : "No hay resultados para esa busqueda."}
              </p>
              <p className="mt-2 text-sm text-[#7a8192]">
                {tenants.length === 0
                  ? "Primero debes crear al menos un tenant."
                  : tenantAdmins.length === 0
                    ? "Crea el primero para delegar administracion por tenant."
                    : "Prueba otro termino o limpia el filtro actual."}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[940px] border-separate border-spacing-y-3 text-left text-sm">
                <thead>
                  <tr className="text-[#6f7380]">
                    <th className="px-4 pb-2 font-medium">Nombre</th>
                    <th className="px-4 pb-2 font-medium">Email</th>
                    <th className="px-4 pb-2 font-medium">Tenant</th>
                    <th className="px-4 pb-2 font-medium">Estado</th>
                    <th className="px-4 pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenantAdmins.map((tenantAdmin) => (
                    <tr
                      key={tenantAdmin.id}
                      className="text-[#2d3340] shadow-[0_12px_30px_rgba(17,24,39,0.04)]"
                    >
                      <td className="rounded-l-[24px] border-y border-l border-[#eceef2] bg-white px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={tenantAdmin.name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#202534]">{tenantAdmin.name}</p>
                            <p className="text-xs text-[#7a8192]">Rol: Tenant Admin</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <div className="inline-flex items-center gap-2 text-[#52607a]">
                          <Mail className="h-4 w-4" />
                          <span>{tenantAdmin.email}</span>
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f6fb] px-3 py-1.5 text-xs font-medium text-[#52607a]">
                          <UserRound className="h-3.5 w-3.5" />
                          {tenantAdmin.tenant?.name ?? "Tenant no disponible"}
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            tenantAdmin.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tenantAdmin.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="rounded-r-[24px] border-y border-r border-[#eceef2] bg-white px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(tenantAdmin)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#424857]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(tenantAdmin)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#f1c8c8] bg-[#fff5f5] px-3 py-2 text-xs font-medium text-[#9f3a3a]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
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
                  <Users2 className="h-3.5 w-3.5" />
                  {editingId ? "Edit Tenant Admin" : "New Tenant Admin"}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#202534]">
                  {editingId ? "Editar tenant admin" : "Crear tenant admin"}
                </h3>
                <p className="mt-1 text-sm text-[#7a8192]">
                  Define credenciales de acceso y tenant asociado.
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
                    <label
                      htmlFor="tenant-admin-name"
                      className="text-sm font-medium text-[#3f4655]"
                    >
                      Nombre
                    </label>
                    <input
                      id="tenant-admin-name"
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
                    <label
                      htmlFor="tenant-admin-email"
                      className="text-sm font-medium text-[#3f4655]"
                    >
                      Email
                    </label>
                    <input
                      id="tenant-admin-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                      placeholder="admin@tenant.com"
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="tenant-admin-password"
                      className="text-sm font-medium text-[#3f4655]"
                    >
                      Password {editingId ? "(opcional)" : ""}
                    </label>
                    <input
                      id="tenant-admin-password"
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                      placeholder={
                        editingId
                          ? "Completa solo si deseas actualizarla"
                          : "Password segura para acceso"
                      }
                      required={!editingId}
                      maxLength={128}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="tenant-admin-tenant"
                      className="text-sm font-medium text-[#3f4655]"
                    >
                      Tenant
                    </label>
                    <select
                      id="tenant-admin-tenant"
                      value={form.tenant_id}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, tenant_id: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm text-[#2f3543]"
                      required
                    >
                      <option value="" disabled>
                        Selecciona un tenant
                      </option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.slug})
                        </option>
                      ))}
                    </select>
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
                      Tenant admin activo
                    </label>
                  )}
                </div>

                <div className="space-y-4 rounded-[28px] border border-[#e2e6ee] bg-white/80 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={form.name || "Nuevo Admin"} />
                    <div>
                      <p className="font-semibold text-[#202534]">
                        {form.name.trim() || "Nuevo Admin"}
                      </p>
                      <p className="text-sm text-[#7a8192]">
                        {form.email.trim() || "admin@tenant.com"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <UserRound className="h-4 w-4 text-[#65728a]" />
                        Contexto del tenant
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        {form.tenant_id
                          ? `Este admin tendra acceso sobre ${
                              tenants.find((tenant) => tenant.id === form.tenant_id)?.name ??
                              "el tenant seleccionado"
                            }.`
                          : "Selecciona el tenant para asignar permisos."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <ShieldCheck className="h-4 w-4 text-[#65728a]" />
                        Seguridad de acceso
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        Usa una password robusta con mayusculas, minusculas, numeros y simbolos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#edf0f5] bg-white/75 px-6 py-4">
                {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#7a8192]">
                    Esta accion actualiza permisos de administracion por tenant.
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
                      {isSaving
                        ? "Guardando..."
                        : editingId
                          ? "Guardar cambios"
                          : "Crear tenant admin"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!tenantAdminToDelete}
        title="Eliminar tenant admin"
        description="Esta accion eliminara la cuenta administrativa seleccionada. No se puede deshacer."
        itemName={tenantAdminToDelete?.name}
        checkboxLabel="Confirmo que deseo eliminar este tenant admin de forma permanente."
        confirmText="Eliminar tenant admin"
        isConfirming={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  );
}
