import { CalendarClock, Mail, Phone, UserRound } from "lucide-react";
import { Avatar as EmployeeAvatar } from "@/modules/employees/components/components/Avatar";
import type { Employee } from "@/types/employee.types";

type EmployeesTableProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onOpenSchedule: (employee: Employee) => void;
};

export default function EmployeesTable({
  employees,
  onEdit,
  onOpenSchedule,
}: EmployeesTableProps): React.ReactNode {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-left text-sm">
        <thead>
          <tr className="text-muted">
            <th className="px-4 pb-2 font-medium">Nombre</th>
            <th className="px-4 pb-2 font-medium">Email</th>
            <th className="px-4 pb-2 font-medium">Telefono</th>
            <th className="px-4 pb-2 font-medium">Rol visual</th>
            <th className="px-4 pb-2 font-medium">Estado</th>
            <th className="px-4 pb-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="text-primary shadow-theme-row">
              <td className="rounded-l-[24px] border-y border-l border-border-soft bg-surface px-4 py-4">
                <div className="flex items-center gap-3">
                  <EmployeeAvatar name={employee.name} />
                  <div className="min-w-0">
                    <p className="font-semibold text-fg-strong">{employee.name}</p>
                    <p className="text-xs text-muted">ID interno del staff</p>
                  </div>
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <div className="inline-flex items-center gap-2 text-fg-secondary">
                  <Mail className="h-4 w-4" />
                  <span>{employee.email}</span>
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <div className="inline-flex items-center gap-2 text-fg-secondary">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone ?? "Sin telefono"}</span>
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-fg-secondary">
                  <UserRound className="h-3.5 w-3.5" />
                  Staff operativo
                </div>
              </td>
              <td className="border-y border-border-soft bg-surface px-4 py-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    employee.is_active
                      ? "bg-surface-success text-success"
                      : "bg-surface-muted text-neutral"
                  }`}
                >
                  {employee.is_active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="rounded-r-[24px] border-y border-r border-border-soft bg-surface px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSchedule(employee)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border-warning bg-surface-warning-soft px-3 py-2 text-xs font-medium text-warning transition-colors hover:bg-surface-warning"
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    Horario
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(employee)}
                    className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral transition-colors hover:bg-secondary-hover"
                  >
                    Editar
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
