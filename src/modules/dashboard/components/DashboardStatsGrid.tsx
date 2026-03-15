import Card from "@/modules/ui/Card";
import type { DashboardMetric } from "@/types/dashboard.types";

type DashboardStatsGridProps = {
  metrics: DashboardMetric[];
};

export default function DashboardStatsGrid({ metrics }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="min-h-28 p-4">
          <p className="text-sm text-muted">{metric.label}</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-[34px] font-semibold leading-none text-fg-strong">
              {metric.value}
            </p>
            {metric.delta ? (
              <span className="mb-1 text-sm font-medium text-success">
                {metric.delta}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-fg-soft">{metric.hint}</p>
        </Card>
      ))}
    </div>
  );
}
