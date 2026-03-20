import { Hash, Pencil, Trash2, UserRound } from "lucide-react";
import { Avatar } from "@/modules/employees/components/components/Avatar";
import { TenantAdmin } from "@/types/tenant-admin.types";

interface TenantsAdminTableProps {
  tenantsAdmin: TenantAdmin[];
  onEdit: (tenantAdmin: TenantAdmin) => void;
  onDelete: (tenantAdmin: TenantAdmin) => void;
}

function resolveStatus(tenant: TenantAdmin): {
  label: string;
  className: string;
} {
  if (!tenant.is_active) {
    return {
      label: "Inactivo",
      className: "bg-surface-muted text-neutral",
    };
  }

  if (tenant.access_state === "INVITED") {
    return {
      label: "Invitado",
      className: "bg-surface-warning text-warning",
    };
  }

  if (tenant.access_state === "PENDING_SETUP") {
    return {
      label: "Pendiente",
      className: "bg-surface-info text-info",
    };
  }

  return {
    label: "Activo",
    className: "bg-surface-success text-success",
  };
}

export default function TenantsAdminsTable({
  tenantsAdmin,
  onEdit,
  onDelete,
}: TenantsAdminTableProps): React.ReactNode {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-220 border-separate border-spacing-y-3 text-left text-sm">
        <thead>
          <tr className="text-muted">
            <th className="px-4 pb-2 font-medium">Nombre</th>
            <th className="px-4 pb-2 font-medium">Correo</th>
            <th className="px-4 pb-2 font-medium">Negocio</th>
            <th className="px-4 pb-2 font-medium">Estado</th>
            <th className="px-4 pb-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tenantsAdmin.map((tenant) => {
            const status = resolveStatus(tenant);

            return (
              <tr key={tenant.id} className="text-primary shadow-theme-row">
                <td className="rounded-l-3xl border-y border-l border-border-soft bg-surface px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={tenant.name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-fg-strong">{tenant.name}</p>
                      <p className="text-xs text-muted">Rol: {tenant.role}</p>
                    </div>
                  </div>
                </td>
                <td className="border-y border-border-soft bg-surface px-4 py-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-secondary">
                    <Hash className="h-3.5 w-3.5" />
                    {tenant.email}
                  </div>
                </td>
                <td className="border-y border-border-soft bg-surface px-4 py-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-secondary">
                    <UserRound className="h-3.5 w-3.5" />
                    {tenant.tenant?.name ?? "Negocio no disponible"}
                  </div>
                </td>
                <td className="border-y border-border-soft bg-surface px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="rounded-r-3xl border-y border-r border-border-soft bg-surface px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(tenant)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tenant)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border-danger bg-surface-danger px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-inverse"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
