import { Clock3, DollarSign } from "lucide-react";
import Avatar from "@/modules/ui/Avatar";
import { formatPrice } from "@/utils/format";
import type { ServicesListProps } from "@/types/service.types";

export function ServicesList({
  services,
  isTogglingId,
  onEdit,
  onToggleStatus,
}: ServicesListProps) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-215 border-separate border-spacing-y-3 text-left text-sm">
        <thead>
          <tr className="text-muted">
            <th className="px-4 pb-2 font-medium">Nombre</th>
            <th className="px-4 pb-2 font-medium">Duración</th>
            <th className="px-4 pb-2 font-medium">Precio</th>
            <th className="px-4 pb-2 font-medium">Empleados</th>
            <th className="px-4 pb-2 font-medium">Estado</th>
            <th className="px-4 pb-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="text-primary shadow-theme-row">
              <td className="rounded-l-3xl border-y border-l border-border-soft bg-surface px-4 py-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-fg-strong">{service.name}</div>
                    <p className="line-clamp-2 text-xs text-muted">
                      {service.description || "Sin descripción adicional."}
                    </p>
                  </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-secondary">
                  <Clock3 className="h-3.5 w-3.5" />
                  {service.duration_minutes} min
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-success px-3 py-1.5 text-xs font-semibold text-success">
                  <DollarSign className="h-3.5 w-3.5" />
                  {service.currency} {formatPrice(service.price)}
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {service.employees.slice(0, 3).map((employee) => (
                      <Avatar
                        key={employee.id}
                        name={employee.name}
                        imageUrl={employee.avatar_url}
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg-strong">
                      {service.employees.map((employee) => employee.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted">
                      {service.employees.length} asignado
                      {service.employees.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    service.is_active
                      ? "bg-surface-success text-success"
                      : "bg-surface-muted text-neutral"
                  }`}
                >
                  {service.is_active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="rounded-r-3xl border-y border-r border-border-soft bg-surface px-4 py-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(service)}
                    className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(service)}
                    disabled={isTogglingId === service.id}
                    className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover disabled:opacity-60"
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
  );
}
