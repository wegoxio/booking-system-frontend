import Card from "@/modules/ui/Card";
import { metricCards } from "../mocks/dashboard-mock-data";

export default function DashboardStatsGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((metric) => (
        <Card key={metric.label} className="min-h-28 p-4">
          <p className="text-sm text-[#646874]">{metric.label}</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-[34px] font-semibold leading-none text-[#2b2f3a]">
              {metric.value}
            </p>
            {metric.delta ? (
              <span className="mb-1 text-sm font-medium text-emerald-600">
                {metric.delta}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-[#9a9da8]">{metric.hint}</p>
        </Card>
      ))}
    </div>
  );
}
