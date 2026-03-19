"use client";

import { useAuth } from "@/context/AuthContext";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DashboardOverviewResponse } from "@/types/dashboard.types";
import DashboardStatsGrid from "./DashboardStatsGrid";
import DashboardTenantsTableCard from "./DashboardTenantsTableCard";
import RecentAuditLogsCard from "./RecentAuditLogsCard";
import DashboardRevenueChartCard from "./DashboardRevenueChartCard";
import { dashboardService } from "../services/dashboard.service";

export default function DashboardOverview() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOverview = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await dashboardService.getOverview(token);
      setOverview(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo cargar el dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void loadOverview();
  }, [token, loadOverview]);

  const dashboardTitle = user?.role === "TENANT_ADMIN" ? "Tenant Admin" : "Super Admin";
  const isSuperAdmin = overview?.role === "SUPER_ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <section data-tour="dashboard-overview" className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[42px] font-semibold leading-none text-fg-strong">
          {dashboardTitle}
        </h2>

        <button
          type="button"
          onClick={() => void loadOverview()}
          disabled={isLoading || !token}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs text-muted disabled:opacity-60"
        >
          {isLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Actualizar
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-border-danger bg-surface-danger px-4 py-3 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}

      {overview ? (
        <>
          <DashboardStatsGrid metrics={overview.metrics} />

          <div className="grid gap-3 xl:grid-cols-[1.6fr_0.85fr]">
            <DashboardRevenueChartCard
              title={isSuperAdmin ? "Revenue y Bookings por mes" : "Rendimiento mensual del tenant"}
              data={overview.chart}
              currency={overview.currency}
            />
            <RecentAuditLogsCard
              title="Logs recientes"
              logs={overview.recent_logs}
              withRanges={false}
            />
          </div>

          <DashboardTenantsTableCard
            role={overview.role}
            currency={overview.currency}
            tenants={overview.super_admin?.tenants}
            employees={overview.tenant_admin?.employees}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-muted">
          {isLoading ? "Cargando datos del dashboard..." : "No hay datos para mostrar."}
        </div>
      )}

    </section>
  );
}
