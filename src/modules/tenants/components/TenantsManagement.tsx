"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Hash, Pencil, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/modules/employees/components/components/Avatar";
import { tenantsService } from "@/modules/tenants/services/tenants.service";
import ConfirmDeleteModal from "@/modules/ui/ConfirmDeleteModal";
import type {
  CreateTenantPayload,
  Tenant,
  UpdateTenantPayload,
} from "@/types/tenant.types";

type TenantFormState = {
  name: string;
  slug: string;
  is_active: boolean;
};

const emptyForm: TenantFormState = {
  name: "",
  slug: "",
  is_active: true,
};

const LOAD_DELAY_MS = 600;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES");
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateForm(form: TenantFormState): string | null {
  const normalizedName = form.name.trim();
  const normalizedSlug = normalizeSlug(form.slug);

  if (normalizedName.length < 1 || normalizedName.length > 120) {
    return "El nombre debe tener entre 1 y 120 caracteres.";
  }

  if (normalizedSlug.length < 3 || normalizedSlug.length > 60) {
    return "El slug debe tener entre 3 y 60 caracteres.";
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    return "Slug invalido. Solo minusculas, numeros y guiones.";
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
            className="grid animate-pulse gap-3 rounded-3xl border border-[#edf0f5] bg-white p-4 md:grid-cols-[1.5fr_1fr_0.8fr_0.9fr_1fr]"
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

export default function TenantsManagement() {
  const { token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<TenantFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeTenantsCount = useMemo(
    () => tenants.filter((tenant) => tenant.is_active).length,
    [tenants],
  );

  const filteredTenants = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return tenants;
    }

    return tenants.filter((tenant) => {
      const haystack = `${tenant.name} ${tenant.slug}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [tenants, searchQuery]);

  const loadTenants = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await tenantsService.findAll(token);
      await wait(LOAD_DELAY_MS);
      setTenants(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar tenants.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

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

  const openEditModal = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setForm({
      name: tenant.name,
      slug: tenant.slug,
      is_active: tenant.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (tenant: Tenant) => {
    setTenantToDelete(tenant);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setTenantToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!token || !tenantToDelete) return;
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await tenantsService.remove(tenantToDelete.id, token);
      await loadTenants();
      setTenantToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el tenant.";
      setErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const normalizedSlug = normalizeSlug(form.slug);
    const createPayload: CreateTenantPayload = {
      name: form.name.trim(),
      slug: normalizedSlug,
    };

    setIsSaving(true);
    setFormError("");

    try {
      if (editingId) {
        const updatePayload: UpdateTenantPayload = {
          ...createPayload,
          is_active: form.is_active,
        };
        await tenantsService.update(editingId, updatePayload, token);
      } else {
        await tenantsService.create(createPayload, token);
      }

      await loadTenants();
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar tenant.";
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
              <Building2 className="h-3.5 w-3.5" />
              Super Admin
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#202534]">
              Tenants
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-[#6f7380]">
              Administra organizaciones, identificadores y estado general de cada tenant.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Tenants
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">{tenants.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a90a2]">
                Activos
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#202534]">
                {activeTenantsCount}
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
                Vista operativa de tenants registrados en la plataforma.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a90a2]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-[#e2e6ee] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2f3543] outline-none transition focus:border-[#efc35f]"
                  placeholder="Buscar por nombre o slug"
                />
              </label>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#efc35f] px-4 py-2.5 text-sm font-medium text-[#2f3543] shadow-[0_12px_24px_rgba(239,195,95,0.28)] transition hover:brightness-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Crear tenant
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : filteredTenants.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#d9dce4] bg-white px-6 py-10 text-center">
              <p className="text-base font-medium text-[#2f3543]">
                {tenants.length === 0
                  ? "No hay tenants registrados todavia."
                  : "No hay resultados para esa busqueda."}
              </p>
              <p className="mt-2 text-sm text-[#7a8192]">
                {tenants.length === 0
                  ? "Crea el primero para empezar a gestionar tenant admins."
                  : "Prueba otro termino o limpia el filtro actual."}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[880px] border-separate border-spacing-y-3 text-left text-sm">
                <thead>
                  <tr className="text-[#6f7380]">
                    <th className="px-4 pb-2 font-medium">Tenant</th>
                    <th className="px-4 pb-2 font-medium">Slug</th>
                    <th className="px-4 pb-2 font-medium">Estado</th>
                    <th className="px-4 pb-2 font-medium">Creado</th>
                    <th className="px-4 pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="text-[#2d3340] shadow-[0_12px_30px_rgba(17,24,39,0.04)]"
                    >
                      <td className="rounded-l-[24px] border-y border-l border-[#eceef2] bg-white px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={tenant.name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#202534]">{tenant.name}</p>
                            <p className="text-xs text-[#7a8192]">Tenant ID: {tenant.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f6fb] px-3 py-1.5 text-xs font-medium text-[#52607a]">
                          <Hash className="h-3.5 w-3.5" />
                          {tenant.slug}
                        </div>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            tenant.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tenant.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                        <p className="text-[#52607a]">{formatDate(tenant.created_at)}</p>
                      </td>
                      <td className="rounded-r-[24px] border-y border-r border-[#eceef2] bg-white px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(tenant)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#424857]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(tenant)}
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
                  <Building2 className="h-3.5 w-3.5" />
                  {editingId ? "Edit Tenant" : "New Tenant"}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#202534]">
                  {editingId ? "Editar tenant" : "Crear tenant"}
                </h3>
                <p className="mt-1 text-sm text-[#7a8192]">
                  Define el nombre comercial y slug tecnico del tenant.
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
                    <label htmlFor="tenant-name" className="text-sm font-medium text-[#3f4655]">
                      Nombre
                    </label>
                    <input
                      id="tenant-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                          slug: normalizeSlug(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                      placeholder="Ej: Salon Central"
                      required
                      maxLength={120}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tenant-slug" className="text-sm font-medium text-[#3f4655]">
                      Slug
                    </label>
                    <input
                      id="tenant-slug"
                      value={form.slug}
                      readOnly
                      className="w-full cursor-not-allowed rounded-2xl border border-[#d9dce4] bg-[#f5f7fb] px-4 py-3 text-sm text-[#5a6272]"
                      placeholder="salon-central"
                      required
                      maxLength={60}
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
                      Tenant activo
                    </label>
                  )}
                </div>

                <div className="space-y-4 rounded-[28px] border border-[#e2e6ee] bg-white/80 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={form.name || "Nuevo Tenant"} />
                    <div>
                      <p className="font-semibold text-[#202534]">
                        {form.name.trim() || "Nuevo Tenant"}
                      </p>
                      <p className="text-sm text-[#7a8192]">
                        {normalizeSlug(form.slug) || "tenant-slug"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <Building2 className="h-4 w-4 text-[#65728a]" />
                        Identidad del tenant
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        El slug se usa como identificador estable para integraciones y enlaces.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#edf0f5] bg-[#fbfcfe] p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2f3543]">
                        <ShieldCheck className="h-4 w-4 text-[#65728a]" />
                        Estado del tenant
                      </div>
                      <p className="mt-2 text-sm text-[#7a8192]">
                        {editingId
                          ? form.is_active
                            ? "El tenant seguira habilitado para iniciar sesion."
                            : "El tenant quedara inactivo para usuarios tenant admin."
                          : "El tenant se creara como activo por defecto."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#edf0f5] bg-white/75 px-6 py-4">
                {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#7a8192]">
                    Esta accion impacta el acceso y contexto de usuarios del tenant.
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
                      {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear tenant"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!tenantToDelete}
        title="Eliminar tenant"
        description="Esta accion eliminara el tenant y su informacion relacionada. No se puede deshacer."
        itemName={tenantToDelete?.name}
        checkboxLabel="Confirmo que deseo eliminar este tenant de forma permanente."
        confirmText="Eliminar tenant"
        isConfirming={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  );
}
