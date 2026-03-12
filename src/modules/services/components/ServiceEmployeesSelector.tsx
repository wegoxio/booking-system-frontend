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
    <div className="space-y-3 rounded-[28px] border border-[#e2e6ee] bg-white/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#3f4655]">Employees asignados</p>
          <p className="text-xs text-[#7a8192]">
            Selecciona al menos una persona para habilitar reservas.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#eef2f8] px-3 py-1 text-xs font-medium text-[#4f5b73]">
          <Users2 className="h-3.5 w-3.5" />
          {selectedEmployees.length} seleccionados
        </div>
      </div>

      {employees.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#d9dce4] bg-white px-4 py-6 text-sm text-[#6f7380]">
          No hay employees activos. Crea employees en el modulo correspondiente.
        </p>
      ) : (
        <>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a90a2]" />
            <input
              value={employeeSearch}
              onChange={(event) => onEmployeeSearchChange(event.target.value)}
              className="w-full rounded-2xl border border-[#edf0f5] bg-[#f9fafc] py-2.5 pl-9 pr-3 text-sm text-[#2f3543] outline-none transition focus:border-[#efc35f] focus:bg-white"
              placeholder="Buscar por nombre, email o telefono"
            />
          </label>

          {selectedEmployees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#f2e2b4] bg-[#fff8e8] px-2.5 py-1.5 text-xs text-[#6f5a1a]"
                >
                  <Avatar name={employee.name} />
                  <span className="font-medium">{employee.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-2">
            {filteredEmployees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9dce4] px-4 py-6 text-center text-sm text-[#7a8192]">
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
                        ? "border-[#efc35f] bg-[#fff8e6] shadow-[0_10px_24px_rgba(239,195,95,0.18)]"
                        : "border-[#edf0f5] bg-[#fbfcfe] hover:border-[#d7ddea] hover:bg-white"
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
                        <span className="font-medium text-[#2f3543]">{employee.name}</span>
                        <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[11px] font-medium text-[#5a6780]">
                          Disponible
                        </span>
                      </div>
                      <p className="truncate text-sm text-[#7a8192]">{employee.email}</p>
                      <p className="mt-0.5 text-xs text-[#98a0b3]">
                        {employee.phone || "Sin telefono registrado"}
                      </p>
                    </div>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                        checked
                          ? "border-[#d8a63d] bg-[#efc35f] text-[#2f3543]"
                          : "border-[#d8dde8] bg-white text-transparent group-hover:text-[#c1c7d5]"
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
