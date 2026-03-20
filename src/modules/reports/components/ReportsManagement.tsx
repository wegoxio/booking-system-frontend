"use client";

import { useAuth } from "@/context/AuthContext";
import { employeesService } from "@/modules/employees/services/employees.service";
import { reportsService } from "@/modules/reports/services/reports.service";
import { servicesService } from "@/modules/services/services/services.service";
import Avatar from "@/modules/ui/Avatar";
import Card from "@/modules/ui/Card";
import type { Employee } from "@/types/employee.types";
import type { ReportGroupBy, ReportsOverviewQuery, ReportsOverviewResponse } from "@/types/report.types";
import type { Service } from "@/types/service.types";
import {
  BarChart3,
  BellRing,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  DollarSign,
  Download,
  LoaderCircle,
  Radio,
  RefreshCcw,
  UserX,
  Users,
  Wallet,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportsFiltersState = {
  date_from: string;
  date_to: string;
  group_by: ReportGroupBy;
  status: string;
  source: string;
  employee_id: string;
  service_id: string;
};

const STATUS_FILTERS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "IN_PROGRESS", label: "En progreso" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "NO_SHOW", label: "No asistió" },
];

const SOURCE_FILTERS = [
  { value: "", label: "Todos los canales" },
  { value: "WEB", label: "Web" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANUAL", label: "Manual" },
  { value: "API", label: "API" },
];

type SummaryCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconToneClass: string;
};

function formatTenantLabel(input: {
  tenant_name: string | null;
  tenant_slug: string | null;
  tenant_id: string | null;
}): string {
  if (input.tenant_name) return input.tenant_name;
  if (input.tenant_slug) return input.tenant_slug;
  if (input.tenant_id) return `ID ${input.tenant_id.slice(0, 8)}`;
  return "Sin tenant";
}

function toDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultDateRange(): { date_from: string; date_to: string } {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 29);

  return {
    date_from: toDateInput(start),
    date_to: toDateInput(today),
  };
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function downloadBlob(input: { blob: Blob; fileName: string }) {
  const objectUrl = URL.createObjectURL(input.blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = input.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function ReportsManagement() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [overview, setOverview] = useState<ReportsOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const defaultDateRange = useMemo(() => getDefaultDateRange(), []);
  const [filters, setFilters] = useState<ReportsFiltersState>({
    ...defaultDateRange,
    group_by: "day",
    status: "",
    source: "",
    employee_id: "",
    service_id: "",
  });

  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  const buildQuery = useCallback((state: ReportsFiltersState): ReportsOverviewQuery => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    return {
      date_from: state.date_from,
      date_to: state.date_to,
      group_by: state.group_by,
      timezone: browserTimeZone,
      status: state.status ? (state.status as ReportsOverviewQuery["status"]) : undefined,
      source: state.source ? (state.source as ReportsOverviewQuery["source"]) : undefined,
      employee_id: state.employee_id || undefined,
      service_id: state.service_id || undefined,
      top_limit: 10,
    };
  }, []);

  const loadOverview = useCallback(
    async (state: ReportsFiltersState) => {
      if (!token) return;

      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await reportsService.getOverview(token, buildQuery(state));
        setOverview(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar los reportes.";
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [buildQuery, token],
  );

  const loadReferenceData = useCallback(async () => {
    if (!token || !isTenantAdmin) {
      setEmployees([]);
      setServices([]);
      return;
    }

    setIsLoadingFilters(true);
    try {
      const [employeesData, servicesData] = await Promise.all([
        employeesService.findAll(token),
        servicesService.findAll(token),
      ]);

      setEmployees(employeesData.filter((employee) => employee.is_active));
      setServices(servicesData.filter((service) => service.is_active));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar empleados y servicios.";
      toast.error(message);
    } finally {
      setIsLoadingFilters(false);
    }
  }, [isTenantAdmin, token]);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    void loadOverview(filters);
    // Initial fetch only. Further fetches are triggered by filter submit or actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverview]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    if (!overview) return [];

    return [
      {
        label: "Citas",
        value: formatInteger(overview.summary.bookings_total),
        icon: CalendarCheck2,
        iconToneClass: "bg-surface-info text-info",
      },
      {
        label: "Ingresos",
        value: formatUsd(overview.summary.revenue_total_usd),
        icon: DollarSign,
        iconToneClass: "bg-surface-success text-success",
      },
      {
        label: "Finalización",
        value: formatRate(overview.summary.completion_rate),
        icon: CheckCircle2,
        iconToneClass: "bg-surface-success text-success",
      },
      {
        label: "Cancelación",
        value: formatRate(overview.summary.cancellation_rate),
        icon: XCircle,
        iconToneClass: "bg-surface-danger text-danger",
      },
      {
        label: "Inasistencia",
        value: formatRate(overview.summary.no_show_rate),
        icon: UserX,
        iconToneClass: "bg-surface-warning text-warning",
      },
      {
        label: "Ticket promedio",
        value: formatUsd(overview.summary.avg_ticket_usd),
        icon: Wallet,
        iconToneClass: "bg-surface-muted text-fg",
      },
    ];
  }, [overview]);

  const showServiceTenantColumn = overview?.scope.role === "SUPER_ADMIN";

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadOverview(filters);
  };

  const handleExport = async () => {
    if (!token) return;

    setIsExporting(true);
    try {
      const blob = await reportsService.exportXlsx(token, buildQuery(filters));
      downloadBlob({
        blob,
        fileName: `reportes-${filters.date_from}-a-${filters.date_to}.xlsx`,
      });
      toast.success("Reporte exportado.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo exportar el reporte.";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-card-border bg-gradient-to-br from-surface-warm to-surface-soft p-6 shadow-theme-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="inline-flex items-center gap-2 text-3xl font-semibold tracking-[-0.03em] text-fg-strong">
              <BarChart3 className="h-7 w-7 text-accent" />
              Reportes
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Analiza el desempeño de citas, ingresos, canales y recordatorios con rango flexible
              y exportación a Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadOverview(filters)}
              disabled={isLoading || !token}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-fg transition hover:bg-surface-soft disabled:opacity-60"
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isLoading || !overview}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-text shadow-theme-accent transition hover:brightness-[0.98] disabled:opacity-60"
            >
              {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar Excel
            </button>
          </div>
        </div>

        <form onSubmit={handleFilterSubmit} className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <input
            type="date"
            value={filters.date_from}
            onChange={(event) =>
              setFilters((current) => ({ ...current, date_from: event.target.value }))
            }
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          />

          <input
            type="date"
            value={filters.date_to}
            onChange={(event) =>
              setFilters((current) => ({ ...current, date_to: event.target.value }))
            }
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          />

          <select
            value={filters.group_by}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                group_by: event.target.value as ReportGroupBy,
              }))
            }
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          >
            <option value="day">Agrupar por día</option>
            <option value="week">Agrupar por semana</option>
            <option value="month">Agrupar por mes</option>
          </select>

          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status.value || "all-status"} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={filters.source}
            onChange={(event) =>
              setFilters((current) => ({ ...current, source: event.target.value }))
            }
            className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
          >
            {SOURCE_FILTERS.map((source) => (
              <option key={source.value || "all-source"} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>

          {isTenantAdmin ? (
            <select
              value={filters.employee_id}
              onChange={(event) =>
                setFilters((current) => ({ ...current, employee_id: event.target.value }))
              }
              disabled={isLoadingFilters}
              className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
            >
              <option value="">Todos los profesionales</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          ) : null}

          {isTenantAdmin ? (
            <select
              value={filters.service_id}
              onChange={(event) =>
                setFilters((current) => ({ ...current, service_id: event.target.value }))
              }
              disabled={isLoadingFilters}
              className="rounded-2xl border border-border bg-surface px-3 py-2.5 text-sm text-fg"
            >
              <option value="">Todos los servicios</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          ) : null}

          <button
            type="submit"
            className="rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-surface-soft"
          >
            Aplicar filtros
          </button>
        </form>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-border-danger bg-surface-danger px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}

      {isLoading && !overview ? (
        <Card className="p-6">
          <p className="text-sm text-muted">Cargando reportes...</p>
        </Card>
      ) : null}

      {overview ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {summaryCards.map((card) => (
              <Card key={card.label} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
                    {card.label}
                  </p>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${card.iconToneClass}`.trim()}>
                    <card.icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold text-fg-strong">{card.value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-fg-strong">
              <BarChart3 className="h-4 w-4 text-accent" />
              Tendencia
            </h3>
            <p className="text-sm text-muted">
              Serie temporal agrupada por {overview.filters.group_by}.
            </p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={overview.time_series} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-primary-soft)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-primary-soft)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="period_label" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-axis)", fontSize: 11 }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-axis)", fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-axis)", fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Ingresos") return [formatUsd(Number(value)), "Ingresos"];
                      return [formatInteger(Number(value)), name];
                    }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--chart-tooltip-border)",
                      background: "var(--chart-tooltip-bg)",
                    }}
                  />
                  <Area
                    yAxisId="right"
                    name="Ingresos"
                    type="monotone"
                    dataKey="revenue_total_usd"
                    stroke="var(--chart-primary)"
                    strokeWidth={2}
                    fill="url(#reportsRevenueGradient)"
                    dot={{ fill: "var(--chart-primary)", r: 2.8 }}
                  />
                  <Line
                    yAxisId="left"
                    name="Citas"
                    type="monotone"
                    dataKey="bookings_total"
                    stroke="var(--chart-secondary)"
                    strokeWidth={1.75}
                    dot={{ fill: "var(--chart-secondary)", r: 2.5 }}
                  />
                  <Line
                    yAxisId="left"
                    name="Canceladas"
                    type="monotone"
                    dataKey="cancelled_count"
                    stroke="var(--chart-tertiary)"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-3 xl:grid-cols-2">
            <Card className="p-4">
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-fg-strong">
                <Wrench className="h-4 w-4 text-accent" />
                Top servicios
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-soft text-xs uppercase tracking-[0.08em] text-muted">
                      <th className="px-2 py-2">Servicio</th>
                      {showServiceTenantColumn ? <th className="px-2 py-2">Tenant</th> : null}
                      <th className="px-2 py-2">Items</th>
                      <th className="px-2 py-2">Citas</th>
                      <th className="px-2 py-2">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.top_services.map((row) => (
                      <tr key={row.service_id} className="border-b border-border-soft">
                        <td className="px-2 py-2 text-fg">
                          <span className="inline-flex items-center gap-2">
                            <Wrench className="h-3.5 w-3.5 text-muted" />
                            {row.service_name}
                          </span>
                        </td>
                        {showServiceTenantColumn ? (
                          <td className="px-2 py-2 text-muted">
                            <span className="inline-flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5" />
                              {formatTenantLabel(row)}
                            </span>
                          </td>
                        ) : null}
                        <td className="px-2 py-2 text-muted">{formatInteger(row.sold_items_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatInteger(row.bookings_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatUsd(row.revenue_total_usd)}</td>
                      </tr>
                    ))}
                    {overview.top_services.length === 0 ? (
                      <tr>
                        <td className="px-2 py-4 text-muted" colSpan={showServiceTenantColumn ? 5 : 4}>
                          Sin datos para este filtro.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-fg-strong">
                <Users className="h-4 w-4 text-accent" />
                Top profesionales
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-soft text-xs uppercase tracking-[0.08em] text-muted">
                      <th className="px-2 py-2">Profesional</th>
                      <th className="px-2 py-2">Citas</th>
                      <th className="px-2 py-2">Completadas</th>
                      <th className="px-2 py-2">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.top_employees.map((row) => (
                      <tr key={row.employee_id} className="border-b border-border-soft">
                        <td className="px-2 py-2 text-fg">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={row.employee_name}
                              imageUrl={row.avatar_url}
                              className="h-7 w-7 text-[10px]"
                            />
                            <span>{row.employee_name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-muted">{formatInteger(row.bookings_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatInteger(row.completed_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatUsd(row.revenue_total_usd)}</td>
                      </tr>
                    ))}
                    {overview.top_employees.length === 0 ? (
                      <tr>
                        <td className="px-2 py-4 text-muted" colSpan={4}>
                          Sin datos para este filtro.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
            <Card className="p-4">
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-fg-strong">
                <Radio className="h-4 w-4 text-accent" />
                Canales
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-soft text-xs uppercase tracking-[0.08em] text-muted">
                      <th className="px-2 py-2">Canal</th>
                      <th className="px-2 py-2">Citas</th>
                      <th className="px-2 py-2">Completadas</th>
                      <th className="px-2 py-2">Canceladas</th>
                      <th className="px-2 py-2">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.source_breakdown.map((row) => (
                      <tr key={row.source} className="border-b border-border-soft">
                        <td className="px-2 py-2 text-fg">{row.source}</td>
                        <td className="px-2 py-2 text-muted">{formatInteger(row.bookings_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatInteger(row.completed_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatInteger(row.cancelled_count)}</td>
                        <td className="px-2 py-2 text-muted">{formatUsd(row.revenue_total_usd)}</td>
                      </tr>
                    ))}
                    {overview.source_breakdown.length === 0 ? (
                      <tr>
                        <td className="px-2 py-4 text-muted" colSpan={5}>
                          Sin datos para este filtro.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-fg-strong">
                <BellRing className="h-4 w-4 text-accent" />
                Recordatorios
              </h3>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-muted">
                  Programados: <span className="font-medium text-fg">{formatInteger(overview.reminders.scheduled_total)}</span>
                </p>
                <p className="text-muted">
                  Enviados: <span className="font-medium text-fg">{formatInteger(overview.reminders.sent_count)}</span>
                </p>
                <p className="text-muted">
                  Fallidos: <span className="font-medium text-fg">{formatInteger(overview.reminders.failed_count)}</span>
                </p>
                <p className="text-muted">
                  Saltados: <span className="font-medium text-fg">{formatInteger(overview.reminders.skipped_count)}</span>
                </p>
                <p className="text-muted">
                  Pendientes: <span className="font-medium text-fg">{formatInteger(overview.reminders.pending_count)}</span>
                </p>
                <p className="text-muted">
                  Tasa de envío: <span className="font-medium text-fg">{formatRate(overview.reminders.sent_rate)}</span>
                </p>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  );
}
