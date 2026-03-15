import Avatar from "@/modules/ui/Avatar";
import Card from "@/modules/ui/Card";
import StatusPill from "@/modules/ui/StatusPill";
import type {
  DashboardTenantsTableCardProps,
} from "@/types/dashboard.types";
import { formatCurrency, formatDateTime } from "@/utils/format";

export default function DashboardTenantsTableCard({
  role,
  currency,
  tenants = [],
  employees = [],
}: DashboardTenantsTableCardProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const hasRows = isSuperAdmin ? tenants.length > 0 : employees.length > 0;

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[30px] font-semibold leading-none text-fg-strong">
          {isSuperAdmin ? "Tenants" : "Profesionales"}
        </h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-soft bg-surface-soft">
        <table className="min-w-190 w-full text-left">
          <thead className="border-b border-border-soft bg-surface-soft">
            <tr className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-soft">
              {isSuperAdmin ? (
                <>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Bookings mes</th>
                  <th className="px-4 py-3">Revenue mes</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Profesional</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Bookings mes</th>
                  <th className="px-4 py-3">Revenue mes</th>
                  <th className="px-4 py-3">Ultima cita</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </>
              )}
            </tr>
          </thead>
          {hasRows ? (
            <tbody>
              {isSuperAdmin
                ? tenants.map((tenant) => (
                    <tr
                      key={tenant.tenant_id}
                      className="border-b border-border-soft text-sm text-neutral last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-primary">{tenant.tenant_name}</p>
                          <p className="text-[10px] text-fg-soft">{tenant.tenant_slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-primary">
                            {tenant.primary_admin_name || "Sin admin"}
                          </p>
                          <p className="text-[10px] text-fg-soft">
                            {tenant.primary_admin_email || "-"}
                          </p>
                          <p className="text-[10px] text-fg-soft">
                            {tenant.tenant_admins_count} admins
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-primary">
                          {tenant.active_employees_count}
                        </span>{" "}
                        <span className="text-xs text-fg-soft">
                          / {tenant.total_employees_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-primary">
                          {tenant.bookings_this_month}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-primary">
                          {formatCurrency(tenant.revenue_this_month, currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusPill
                          label={tenant.tenant_is_active ? "Active" : "Inactive"}
                          variant={tenant.tenant_is_active ? "active" : "inactive"}
                        />
                      </td>
                    </tr>
                  ))
                : employees.map((employee) => (
                    <tr
                      key={employee.employee_id}
                      className="border-b border-border-soft text-sm text-neutral last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={employee.employee_name} />
                          <div>
                            <p className="font-semibold text-primary">{employee.employee_name}</p>
                            <p className="text-[10px] text-fg-soft">
                              ID: {employee.employee_id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-primary">{employee.employee_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-primary">
                          {employee.bookings_this_month}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-semibold text-primary">
                          {formatCurrency(employee.revenue_this_month, currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-fg-soft">
                          {formatDateTime(employee.last_booking_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <StatusPill
                          label={employee.employee_is_active ? "Active" : "Inactive"}
                          variant={employee.employee_is_active ? "active" : "inactive"}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted">
                  No hay datos suficientes para mostrar esta tabla todavia.
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </Card>
  );
}
