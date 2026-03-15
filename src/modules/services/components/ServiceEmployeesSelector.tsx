import { Check, Search, Users2 } from "lucide-react";
import Avatar from "@/modules/ui/Avatar";
import type { Employee } from "@/types/employee.types";

type ServiceEmployeesSelectorProps = {
  employees: Employee[];
  filteredEmployees: Employee[];
  selectedEmployees: Employee[];
  selectedIds: string[];
  employeeSearch: string;
  onEmployeeSearchChange: (value: string) => void;
  onEmployeeToggle: (employeeId: string) => void;
};

export function ServiceEmployeesSelector({
  employees,
  filteredEmployees,
  selectedEmployees,
  selectedIds,
  employeeSearch,
  onEmployeeSearchChange,
  onEmployeeToggle,
}: ServiceEmployeesSelectorProps) {
  return (
    <div className="space-y-3 rounded-[28px] border border-border bg-inverse-80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fg-label">Employees asignados</p>
          <p className="text-xs text-muted">
            Selecciona al menos una persona para habilitar reservas.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-surface-subtle px-3 py-1 text-xs font-medium text-fg-secondary">
          <Users2 className="h-3.5 w-3.5" />
          {selectedEmployees.length} seleccionados
        </div>
      </div>

      {employees.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-sm text-muted">
          No hay employees activos. Crea employees en el modulo correspondiente.
        </p>
      ) : (
        <>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-placeholder" />
            <input
              value={employeeSearch}
              onChange={(event) => onEmployeeSearchChange(event.target.value)}
              className="w-full rounded-2xl border border-border-soft bg-surface-soft py-2.5 pl-9 pr-3 text-sm text-fg outline-none transition focus:border-accent focus:bg-surface"
              placeholder="Buscar por nombre, email o telefono"
            />
          </label>

          {selectedEmployees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border-warning bg-surface-warning-soft px-2.5 py-1.5 text-xs text-warning"
                >
                  <Avatar name={employee.name} />
                  <span className="font-medium">{employee.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-2">
            {filteredEmployees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                No hay resultados para tu busqueda.
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const checked = selectedIds.includes(employee.id);

                return (
                  <label
                    key={employee.id}
                    className={`group flex cursor-pointer items-center gap-3 rounded-[22px] border px-3 py-3 transition ${
                      checked
                        ? "border-accent bg-surface-warning-soft shadow-theme-accent-sm"
                        : "border-border-soft bg-surface-panel-strong hover:border-border-soft hover:bg-surface"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onEmployeeToggle(employee.id)}
                      className="sr-only"
                    />
                    <Avatar name={employee.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-fg">{employee.name}</span>
                        <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-fg-secondary">
                          Disponible
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted">{employee.email}</p>
                      <p className="mt-0.5 text-xs text-fg-soft">
                        {employee.phone || "Sin telefono registrado"}
                      </p>
                    </div>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                        checked
                          ? "border-border-warning bg-accent text-accent-text"
                          : "border-border-soft bg-surface text-transparent group-hover:text-fg-soft"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
