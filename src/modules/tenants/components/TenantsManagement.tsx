"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { tenantsService } from "@/modules/tenants/services/tenants.service";
import TenantEditModalContent from "@/modules/tenants/components/TenantEditModalContent";
import TenantsTable from "@/modules/tenants/components/TenantsTable";
import ConfirmDeleteModal from "@/modules/ui/ConfirmDeleteModal";
import TableEditModal from "@/modules/ui/TableEditModal";
import {
  emptyForm,
  type CreateTenantPayload,
  type Tenant,
  type TenantFormState,
  type UpdateTenantPayload,
} from "@/types/tenant.types";
import { normalizeSlug } from "@/utils/format";
import { wait } from "@/utils/delay";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import SectionHeader from "@/modules/ui/SectionHeader";
import TableHeader from "@/modules/ui/TableHeader";
import { validateTenantCreateForm } from "@/utils/validation";
import { toast } from "react-hot-toast";

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
      await wait(600);
      setTenants(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar tenants.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

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

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: normalizeSlug(value),
    }));
  };

  const handleIsActiveChange = (value: boolean) => {
    setForm((prev) => ({ ...prev, is_active: value }));
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
      toast.success("Tenant eliminado correctamente.");
      setTenantToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el tenant.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const validationError = validateTenantCreateForm(form);
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
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
        toast.success("Tenant actualizado correctamente.");
      } else {
        await tenantsService.create(createPayload, token);
        toast.success("Tenant creado correctamente.");
      }

      await loadTenants();
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar tenant.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const viewStats = [
    {
      label: "Tenants Totales",
      value: tenants.length
    },
    {
      label: "Tenants Activos",
      value: activeTenantsCount
    }
  ]

  return (
    <section className="space-y-4">
      <SectionHeader
        headerTitle="Tenants"
        headerDescription="Administra organizaciones, identificadores y estado general de cada tenant."
        stats={viewStats}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
          <TableHeader
            title="Listado"
            subtitle="Vista operativa de tenants registrados en la plataforma."
            inputStateValue={searchQuery}
            inputOnchange={setSearchQuery}
            buttonOnOpen={openCreateModal}
            buttonLabel="Crear Tenant"
          />

          {errorMessage ? (
            <p className="mt-4 text-sm text-danger">{errorMessage}</p>
          ) : filteredTenants.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center">
              <p className="text-base font-medium text-fg">
                {tenants.length === 0
                  ? "No hay tenants registrados todavia."
                  : "No hay resultados para esa busqueda."}
              </p>
              <p className="mt-2 text-sm text-muted">
                {tenants.length === 0
                  ? "Crea el primero para empezar a gestionar tenant admins."
                  : "Prueba otro termino o limpia el filtro actual."}
              </p>
            </div>
          ) : (
            <TenantsTable
              tenants={filteredTenants}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}
        </div>
      )}

      <TableEditModal
        isOpen={isModalOpen}
        badgeLabel={editingId ? "Edit Tenant" : "New Tenant"}
        badgeIcon={<Building2 className="h-3.5 w-3.5" />}
        title={editingId ? "Editar tenant" : "Crear tenant"}
        description="Define el nombre comercial y slug tecnico del tenant."
        helperText="Esta accion impacta el acceso y contexto de usuarios del tenant."
        errorMessage={formError}
        submitText={isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear tenant"}
        isSubmitting={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      >
        <TenantEditModalContent
          form={form}
          isEditing={!!editingId}
          onNameChange={handleNameChange}
          onIsActiveChange={handleIsActiveChange}
        />
      </TableEditModal>

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
