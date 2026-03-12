"use client";

import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DashboardStatsGrid from "./DashboardStatsGrid";
import { auditLogsPrimary, auditLogsSecondary } from "../mocks/dashboard-mock-data";
import DashboardTenantsTableCard from "./DashboardTenantsTableCard";
import RecentAuditLogsCard from "./RecentAuditLogsCard";
import DashboardRevenueChartCard from "./DashboardRevenueChartCard";

export default function DashboardOverview() {
  const { user } = useAuth();
  const dashboardTitle = user?.role === "TENANT_ADMIN" ? "Tenant Admin" : "Super Admin";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[42px] font-semibold leading-none text-[#282d39]">
          {dashboardTitle}
        </h2>

        <button className="inline-flex items-center gap-2 rounded-lg border border-[#dde0e7] bg-[#f7f7f9] px-3 py-2 text-xs text-[#6d717c]">
          All by shows
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <DashboardStatsGrid />

      <div className="grid gap-3 xl:grid-cols-[1.6fr_0.85fr]">
        <DashboardRevenueChartCard />
        <RecentAuditLogsCard
          title="Logs del Sistema"
          logs={auditLogsPrimary}
          withRanges={true}
        />
      </div>
    </section>
  );
}
