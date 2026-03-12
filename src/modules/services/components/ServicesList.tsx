import { Clock3, DollarSign, Plus } from "lucide-react";
import Avatar from "@/modules/ui/Avatar";
import { formatPrice } from "@/utils/format";
import type { ServicesListProps } from "@/types/service.types";

export function ServicesList({
  services,
  errorMessage,
  isTogglingId,
  onCreate,
  onEdit,
  onToggleStatus,
}: ServicesListProps) {
  return (
    <div className="rounded-[28px] border border-[#e4e4e8] bg-[#fafafc] p-5 shadow-[0_20px_44px_rgba(26,35,58,0.05)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#2b2f3a]">Listado</h3>
          <p className="text-sm text-[#7a8192]">
            Vista operativa de precios, tiempo y staff asignado.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ebf3] bg-white px-3 py-1.5 text-xs font-medium text-[#536078]">
            <Clock3 className="h-3.5 w-3.5" />
            Actualizado en vivo
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#efc35f] px-4 py-2.5 text-sm font-medium text-[#2f3543] shadow-[0_12px_24px_rgba(239,195,95,0.28)] transition hover:brightness-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Crear servicio
          </button>
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
      ) : services.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-[#d9dce4] bg-white px-6 py-10 text-center">
          <p className="text-base font-medium text-[#2f3543]">No hay servicios registrados.</p>
          <p className="mt-2 text-sm text-[#7a8192]">
            Crea el primero desde el boton superior para empezar a configurar reservas.
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#ead9a5] bg-[#fff8e6] px-4 py-2 text-sm font-medium text-[#7a5c08]"
          >
            <Plus className="h-4 w-4" />
            Nuevo servicio
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-215 border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="text-[#6f7380]">
                <th className="px-4 pb-2 font-medium">Nombre</th>
                <th className="px-4 pb-2 font-medium">Duracion</th>
                <th className="px-4 pb-2 font-medium">Precio</th>
                <th className="px-4 pb-2 font-medium">Employees</th>
                <th className="px-4 pb-2 font-medium">Estado</th>
                <th className="px-4 pb-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="text-[#2d3340] shadow-[0_12px_30px_rgba(17,24,39,0.04)]"
                >
                  <td className="rounded-l-3xl border-y border-l border-[#eceef2] bg-white px-4 py-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-[#202534]">{service.name}</div>
                      <p className="line-clamp-2 text-xs text-[#7a8192]">
                        {service.description || "Sin descripcion adicional."}
                      </p>
                    </div>
                  </td>
                  <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f6fb] px-3 py-1.5 text-xs font-medium text-[#52607a]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {service.duration_minutes} min
                    </div>
                  </td>
                  <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#edf8f2] px-3 py-1.5 text-xs font-semibold text-[#1f7a4d]">
                      <DollarSign className="h-3.5 w-3.5" />
                      {service.currency} {formatPrice(service.price)}
                    </div>
                  </td>
                  <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {service.employees.slice(0, 3).map((employee) => (
                          <Avatar key={employee.id} name={employee.name} />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#2b2f3a]">
                          {service.employees.map((employee) => employee.name).join(", ")}
                        </p>
                        <p className="text-xs text-[#7a8192]">
                          {service.employees.length} asignado
                          {service.employees.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="border-y border-[#eceef2] bg-white px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        service.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {service.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="rounded-r-3xl border-y border-r border-[#eceef2] bg-white px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(service)}
                        className="rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#424857]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(service)}
                        disabled={isTogglingId === service.id}
                        className="rounded-xl border border-[#d8dae1] bg-white px-3 py-2 text-xs font-medium text-[#424857] disabled:opacity-60"
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
  );
}
