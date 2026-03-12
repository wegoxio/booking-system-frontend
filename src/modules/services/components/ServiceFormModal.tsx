import type { FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { ServiceEmployeesSelector } from "./ServiceEmployeesSelector";
import type { Employee } from "@/types/employee.types";
import type { ServiceFormState } from "@/types/service.types";

type ServiceFormModalProps = {
  isOpen: boolean;
  editingId: string | null;
  form: ServiceFormState;
  formError: string;
  isSaving: boolean;
  activeEmployees: Employee[];
  filteredEmployees: Employee[];
  selectedEmployees: Employee[];
  employeeSearch: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onFormChange: (updater: (prev: ServiceFormState) => ServiceFormState) => void;
  onEmployeeSearchChange: (value: string) => void;
  onEmployeeToggle: (employeeId: string) => void;
};

export function ServiceFormModal({
  isOpen,
  editingId,
  form,
  formError,
  isSaving,
  activeEmployees,
  filteredEmployees,
  selectedEmployees,
  employeeSearch,
  onClose,
  onSubmit,
  onFormChange,
  onEmployeeSearchChange,
  onEmployeeToggle,
}: ServiceFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-[rgba(15,23,42,0.46)] backdrop-blur-[6px]"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-4xl border border-white/60 bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#edf0f5] px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f2e2b4] bg-[#fff6dd] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9c6a00]">
              <Sparkles className="h-3.5 w-3.5" />
              {editingId ? "Edit Service" : "New Service"}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#202534]">
              {editingId ? "Editar servicio" : "Crear servicio"}
            </h3>
            <p className="mt-1 text-sm text-[#7a8192]">
              Configura nombre, precio, duracion y el equipo asignado desde un solo lugar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e7ee] bg-white text-[#4c576d]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="service-name" className="text-sm font-medium text-[#3f4655]">
                  Nombre
                </label>
                <input
                  id="service-name"
                  value={form.name}
                  onChange={(event) =>
                    onFormChange((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                  placeholder="Ej: Corte + Barba"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="service-description" className="text-sm font-medium text-[#3f4655]">
                  Descripcion
                </label>
                <textarea
                  id="service-description"
                  value={form.description}
                  onChange={(event) =>
                    onFormChange((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="min-h-30 w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                  placeholder="Describe el valor del servicio, detalles o notas internas"
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="service-duration" className="text-sm font-medium text-[#3f4655]">
                    Duracion (min)
                  </label>
                  <input
                    id="service-duration"
                    type="number"
                    min={1}
                    step={1}
                    value={form.duration_minutes}
                    onChange={(event) =>
                      onFormChange((prev) => ({
                        ...prev,
                        duration_minutes: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="service-capacity" className="text-sm font-medium text-[#3f4655]">
                    Capacidad
                  </label>
                  <input
                    id="service-capacity"
                    type="number"
                    min={1}
                    step={1}
                    value={form.capacity}
                    onChange={(event) =>
                      onFormChange((prev) => ({ ...prev, capacity: Number(event.target.value) }))
                    }
                    className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
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
                      onFormChange((prev) => ({ ...prev, price: Number(event.target.value) }))
                    }
                    className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="service-currency" className="text-sm font-medium text-[#3f4655]">
                    Moneda
                  </label>
                  <input
                    id="service-currency"
                    value={form.currency}
                    onChange={(event) =>
                      onFormChange((prev) => ({ ...prev, currency: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#d9dce4] bg-white px-4 py-3 text-sm uppercase"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              {editingId && (
                <label className="flex items-center gap-2 rounded-2xl border border-[#e7ebf3] bg-white px-4 py-3 text-sm text-[#3f4655]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      onFormChange((prev) => ({ ...prev, is_active: event.target.checked }))
                    }
                  />
                  Service activo
                </label>
              )}
            </div>

            <ServiceEmployeesSelector
              employees={activeEmployees}
              filteredEmployees={filteredEmployees}
              selectedEmployees={selectedEmployees}
              selectedIds={form.employee_ids}
              employeeSearch={employeeSearch}
              onEmployeeSearchChange={onEmployeeSearchChange}
              onEmployeeToggle={onEmployeeToggle}
            />
          </div>

          <div className="border-t border-[#edf0f5] bg-white/75 px-6 py-4">
            {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#7a8192]">Los cambios se guardan en el mismo flujo actual.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
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
                      : "Crear service"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
