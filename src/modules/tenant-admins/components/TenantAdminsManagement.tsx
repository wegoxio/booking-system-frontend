"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Users2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TenantAdminModalContent from "@/modules/tenant-admins/components/TenantAdminModalContent";
import { tenantAdminsService } from "@/modules/tenant-admins/services/tenant-admins.service";
import { tenantsService } from "@/modules/tenants/services/tenants.service";
import ConfirmDeleteModal from "@/modules/ui/ConfirmDeleteModal";
import TableEditModal from "@/modules/ui/TableEditModal";
import type {
  CreateTenantAdminPayload,
  TenantAdmin,
  TenantAdminFormState,
  UpdateTenantAdminPayload,
} from "@/types/tenant-admin.types";
import type { Tenant } from "@/types/tenant.types";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import { validateTenantAdminCreateForm } from "@/utils/validation";
import SectionHeader from "@/modules/ui/SectionHeader";
import TableHeader from "@/modules/ui/TableHeader";
import TenantsAdminsTable from "./TenantAdminsTable";
import { wait } from "@/utils/delay";
import { toast } from "react-hot-toast";

const emptyForm: TenantAdminFormState = {
  name: "",
  email: "",
  tenant_id: "",
  is_active: true,
};

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
      await wait(600);
      setTenantAdmins(tenantAdminsData);
      setTenants(tenantsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar informacion.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      tenant_id: tenantAdmin.tenant_id,
      is_active: tenantAdmin.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (tenantAdmin: TenantAdmin) => {
    setTenantAdminToDelete(tenantAdmin);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value }));
  };

  const handleEmailChange = (value: string) => {
    setForm((prev) => ({ ...prev, email: value }));
  };

  const handleTenantChange = (value: string) => {
    setForm((prev) => ({ ...prev, tenant_id: value }));
  };

  const handleIsActiveChange = (value: boolean) => {
    setForm((prev) => ({ ...prev, is_active: value }));
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
      toast.success("Tenant admin eliminado correctamente.");
      setTenantAdminToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar tenant admin.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const validationError = validateTenantAdminCreateForm(form, !!editingId);
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
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

        await tenantAdminsService.update(editingId, payload, token);
        toast.success("Tenant admin actualizado correctamente.");
      } else {
        const payload: CreateTenantAdminPayload = {
          ...basePayload,
        };
        await tenantAdminsService.create(payload, token);
        toast.success("Invitacion enviada correctamente.");
      }

      await loadData();
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar tenant admin.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const TenantsAdminStats = [
    {
      label: 'Admins',
      value: tenantAdmins.length
    },
    {
      label: 'activos',
      value: activeTenantAdminsCount
    },
    {
      label: 'Cubiertos',
      value: managedTenantsCount
    },
  ]

  return (
    <section className="space-y-4">
      <SectionHeader
        headerTitle="Tenants Admins"
        headerDescription="Gestiona cuentas administrativas por tenant y su estado de acceso."
        stats={TenantsAdminStats}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (

        <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
          <TableHeader
            title="Listado"
            subtitle="Usuarios con rol tenant admin y tenant asignado."
            inputStateValue={searchQuery}
            inputOnchange={setSearchQuery}
            buttonOnOpen={openCreateModal}
            buttonLabel="Crear tenant admin"
          />

          {errorMessage ? (
            <p className="mt-4 text-sm text-danger">{errorMessage}</p>
          ) : filteredTenantAdmins.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center">
              <p className="text-base font-medium text-fg">
                {tenantAdmins.length === 0
                  ? "No hay tenant admins registrados todavia."
                  : "No hay resultados para esa busqueda."}
              </p>
              <p className="mt-2 text-sm text-muted">
                {tenants.length === 0
                  ? "Primero debes crear al menos un tenant."
                  : tenantAdmins.length === 0
                    ? "Crea el primero para delegar administracion por tenant."
                    : "Prueba otro termino o limpia el filtro actual."}
              </p>
            </div>
          ) : (
            <TenantsAdminsTable tenantsAdmin={filteredTenantAdmins} onEdit={openEditModal} onDelete={openDeleteModal} />
          )}
        </div>
      )}

      <TableEditModal
        isOpen={isModalOpen}
        badgeLabel={editingId ? "Edit Tenant Admin" : "New Tenant Admin"}
        badgeIcon={<Users2 className="h-3.5 w-3.5" />}
        title={editingId ? "Editar tenant admin" : "Crear tenant admin"}
        description="Asigna el tenant y el correo desde el que el cliente activará su acceso."
        helperText="La contraseña inicial no la define Wegox: el cliente la crea desde un enlace seguro."
        errorMessage={formError}
        submitText={isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Enviar invitacion"}
        isSubmitting={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      >
        <TenantAdminModalContent
          form={form}
          tenants={tenants}
          isEditing={!!editingId}
          onNameChange={handleNameChange}
          onEmailChange={handleEmailChange}
          onTenantChange={handleTenantChange}
          onIsActiveChange={handleIsActiveChange}
        />
      </TableEditModal>

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
