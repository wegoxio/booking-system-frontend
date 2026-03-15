"use client";

import { useAuth } from "@/context/AuthContext";
import { auditLogsService } from "@/modules/audit-logs/services/audit-logs.service";
import { employeesService } from "@/modules/employees/services/employees.service";
import { tenantsService } from "@/modules/tenants/services/tenants.service";
import CalendarDatePicker from "@/modules/ui/CalendarDatePicker";
import SelectField, { type SelectOption } from "@/modules/ui/SelectField";
import TableSkeleton from "@/modules/ui/TableSkeleton";
import TableStatsCard from "@/modules/ui/TableStatsCard";
import type { AuditLogItem } from "@/types/audit-log.types";
import type { Employee } from "@/types/employee.types";
import type { Tenant } from "@/types/tenant.types";
import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const ACTION_OPTIONS: SelectOption[] = [
  { value: "", label: "Todas las acciones" },
  { value: "AUTH_LOGIN_SUCCESS", label: "Login correcto" },
  { value: "TENANT_CREATED", label: "Tenant creado" },
  { value: "TENANT_UPDATED", label: "Tenant actualizado" },
  { value: "TENANT_DELETED", label: "Tenant eliminado" },
  { value: "TENANT_ADMIN_CREATED", label: "Tenant admin creado" },
  { value: "TENANT_ADMIN_UPDATED", label: "Tenant admin actualizado" },
  { value: "TENANT_ADMIN_DELETED", label: "Tenant admin eliminado" },
  { value: "EMPLOYEE_CREATED", label: "Employee creado" },
  { value: "EMPLOYEE_UPDATED", label: "Employee actualizado" },
  { value: "SERVICE_CREATED", label: "Service creado" },
  { value: "SERVICE_UPDATED", label: "Service actualizado" },
  { value: "SERVICE_ENABLED", label: "Service habilitado" },
  { value: "SERVICE_DISABLED", label: "Service deshabilitado" },
  { value: "EMPLOYEE_SCHEDULE_CREATED", label: "Horario creado" },
  { value: "EMPLOYEE_SCHEDULE_UPDATED", label: "Horario actualizado" },
  { value: "EMPLOYEE_TIME_OFF_CREATED", label: "Bloqueo creado" },
  { value: "EMPLOYEE_TIME_OFF_REMOVED", label: "Bloqueo eliminado" },
  { value: "BOOKING_CREATED", label: "Booking creado" },
  { value: "BOOKING_STATUS_UPDATED", label: "Estado booking actualizado" },
  { value: "TENANT_SETTINGS_UPDATED", label: "Settings tenant actualizados" },
  { value: "TENANT_SETTINGS_ASSET_UPLOADED", label: "Asset tenant subido" },
  { value: "PLATFORM_SETTINGS_UPDATED", label: "Settings plataforma actualizados" },
  { value: "PLATFORM_SETTINGS_ASSET_UPLOADED", label: "Asset plataforma subido" },
];

const ENTITY_OPTIONS: SelectOption[] = [
  { value: "", label: "Todas las entidades" },
  { value: "auth", label: "Auth" },
  { value: "tenant", label: "Tenant" },
  { value: "user", label: "Usuario" },
  { value: "employee", label: "Employee" },
  { value: "service", label: "Service" },
  { value: "booking", label: "Booking" },
  { value: "tenant_settings", label: "Tenant settings" },
  { value: "platform_settings", label: "Platform settings" },
];

function formatActionLabel(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getActionBadgeClass(action: string) {
  if (action.includes("DELETED") || action.includes("DISABLED")) {
    return "bg-surface-danger text-danger border-border-danger";
  }
  if (action.includes("UPDATED") || action.includes("STATUS")) {
    return "bg-surface-info text-info border-border-info";
  }
  if (action.includes("CREATED") || action.includes("UPLOADED") || action.includes("LOGIN")) {
    return "bg-surface-success text-success border-border-success";
  }
  return "bg-surface-warning-soft text-warning border-border-warning";
}

function formatMetadataJson(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "Sin detalle tecnico.";
  }
  return JSON.stringify(metadata, null, 2);
}

export default function AuditLogsManagement(): React.ReactNode {
  const { token, user } = useAuth();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  const tenantOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: "Todos los tenants" },
      ...tenants.map((tenant) => ({
        value: tenant.id,
        label: `${tenant.name} (${tenant.slug})`,
      })),
    ],
    [tenants],
  );

  const employeeOptions = useMemo<SelectOption[]>(
    () => [
      { value: "", label: "Todos los employees" },
      ...employees.map((employee) => ({
        value: employee.id,
        label: employee.name,
      })),
    ],
    [employees],
  );

  const loadFilterData = useCallback(async () => {
    if (!token || !user) return;
    setIsLoadingFilters(true);
    try {
      if (user.role === "SUPER_ADMIN") {
        const tenantsData = await tenantsService.findAll(token);
        setTenants(tenantsData);
      } else {
        const employeesData = await employeesService.findAll(token);
        setEmployees(employeesData);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudieron cargar filtros auxiliares.",
      );
    } finally {
      setIsLoadingFilters(false);
    }
  }, [token, user]);

  const loadLogs = useCallback(async () => {
    if (!token || !user) return;
    setIsLoadingLogs(true);
    setErrorMessage("");

    try {
      const response = await auditLogsService.list(
        {
          q: searchQuery || undefined,
          action: actionFilter || undefined,
          entity: entityFilter || undefined,
          tenant_id: isSuperAdmin ? tenantFilter || undefined : undefined,
          employee_id: isTenantAdmin ? employeeFilter || undefined : undefined,
          date: dateFilter || undefined,
          date_from: dateFilter ? undefined : fromDateFilter || undefined,
          date_to: dateFilter ? undefined : toDateFilter || undefined,
          page,
          limit,
        },
        token,
      );

      setLogs(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      setLogs([]);
      setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar los logs.");
    } finally {
      setIsLoadingLogs(false);
    }
  }, [
    actionFilter,
    dateFilter,
    employeeFilter,
    entityFilter,
    fromDateFilter,
    isSuperAdmin,
    isTenantAdmin,
    limit,
    page,
    searchQuery,
    tenantFilter,
    toDateFilter,
    token,
    user,
  ]);

  useEffect(() => {
    void loadFilterData();
  }, [loadFilterData]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActionFilter("");
    setEntityFilter("");
    setTenantFilter("");
    setEmployeeFilter("");
    setDateFilter("");
    setFromDateFilter("");
    setToDateFilter("");
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    actionFilter,
    entityFilter,
    tenantFilter,
    employeeFilter,
    dateFilter,
    fromDateFilter,
    toDateFilter,
  ]);

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-card-border bg-gradient-to-br from-surface-warm to-surface-soft p-6 shadow-theme-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg-strong">
              Audit Logs
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-muted">
              Trazabilidad completa de acciones criticas en plataforma, tenant y operaciones.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TableStatsCard label="Resultados" value={total} />
            <TableStatsCard label="Pagina" value={`${page}/${totalPages}`} />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-fg-strong">Filtros</h3>
            <p className="text-sm text-muted">
              Refina por accion, entidad, fecha y alcance operativo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral"
          >
            <Filter className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-placeholder" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-fg outline-none transition focus:border-accent"
              placeholder="Buscar en accion, actor o mensaje..."
            />
          </label>

          <SelectField
            value={actionFilter}
            onValueChange={setActionFilter}
            options={ACTION_OPTIONS}
          />

          <SelectField
            value={entityFilter}
            onValueChange={setEntityFilter}
            options={ENTITY_OPTIONS}
          />

          <CalendarDatePicker
            value={dateFilter}
            onChange={setDateFilter}
            placeholder="Filtrar por dia"
          />

          <CalendarDatePicker
            value={fromDateFilter}
            onChange={setFromDateFilter}
            placeholder="Desde"
          />

          <CalendarDatePicker value={toDateFilter} onChange={setToDateFilter} placeholder="Hasta" />

          {isSuperAdmin ? (
            <SelectField
              value={tenantFilter}
              onValueChange={setTenantFilter}
              options={tenantOptions}
              disabled={isLoadingFilters}
            />
          ) : null}

          {isTenantAdmin ? (
            <SelectField
              value={employeeFilter}
              onValueChange={setEmployeeFilter}
              options={employeeOptions}
              disabled={isLoadingFilters}
            />
          ) : null}
        </div>

        {errorMessage ? <p className="mt-3 text-sm text-danger">{errorMessage}</p> : null}
      </div>

      <div className="rounded-[28px] border border-card-border bg-surface-panel p-5 shadow-theme-card">
        {isLoadingLogs ? (
          <TableSkeleton />
        ) : logs.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-surface px-6 py-10 text-center">
            <p className="text-base font-medium text-fg">No hay logs para los filtros aplicados.</p>
            <p className="mt-2 text-sm text-muted">
              Ajusta el rango de fechas o la accion para encontrar resultados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px] border-separate border-spacing-y-3 text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="px-4 pb-2 font-medium">Fecha</th>
                  <th className="px-4 pb-2 font-medium">Evento</th>
                  <th className="px-4 pb-2 font-medium">Actor</th>
                  <th className="px-4 pb-2 font-medium">Tenant</th>
                  <th className="px-4 pb-2 font-medium">Entidad</th>
                  <th className="px-4 pb-2 font-medium">Tecnico</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="text-primary shadow-theme-row">
                    <td className="rounded-l-3xl border-y border-l border-border-soft bg-surface px-4 py-4">
                      <p className="font-medium text-fg">{formatDateTime(log.created_at)}</p>
                      <p className="mt-1 text-xs text-muted">{log.id.slice(0, 8)}</p>
                    </td>

                    <td className="border-y border-border-soft bg-surface px-4 py-4">
                      <p className="max-w-[360px] text-sm font-medium text-fg">{log.message}</p>
                      <span
                        className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getActionBadgeClass(log.action)}`}
                      >
                        {formatActionLabel(log.action)}
                      </span>
                    </td>

                    <td className="border-y border-border-soft bg-surface px-4 py-4">
                      <p className="font-medium text-fg">{log.actor?.name ?? "Sistema"}</p>
                      <p className="mt-1 text-xs text-muted">{log.actor?.email ?? "-"}</p>
                    </td>

                    <td className="border-y border-border-soft bg-surface px-4 py-4">
                      <p className="font-medium text-fg">{log.tenant?.name ?? "Global"}</p>
                      <p className="mt-1 text-xs text-muted">{log.tenant?.slug ?? "-"}</p>
                    </td>

                    <td className="border-y border-border-soft bg-surface px-4 py-4">
                      <p className="text-sm font-medium text-fg">{log.entity ?? "N/A"}</p>
                      <p className="mt-1 max-w-[220px] break-all text-xs text-muted">
                        {log.entity_id ?? "-"}
                      </p>
                    </td>

                    <td className="rounded-r-3xl border-y border-r border-border-soft bg-surface px-4 py-4">
                      <details className="max-w-[360px] rounded-lg border border-border-soft bg-surface-soft p-2">
                        <summary className="cursor-pointer text-xs font-medium text-fg-secondary">
                          Ver detalle tecnico
                        </summary>
                        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words text-[11px] text-fg-soft">
                          {formatMetadataJson(log.metadata)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted">
            Mostrando pagina {page} de {totalPages}.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || isLoadingLogs}
              className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || isLoadingLogs}
              className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-neutral disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


