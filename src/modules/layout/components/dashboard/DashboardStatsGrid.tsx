"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import Card from "@/modules/ui/Card";
import { metricCards, revenueSparklineData } from "./dashboard-mock-data";

export default function DashboardStatsGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_1.15fr]">
      {metricCards.map((metric) => (
        <Card key={metric.label} className="min-h-[112px] p-4">
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

      <Card className="min-h-[112px] overflow-hidden p-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#575c67]">EUR 78,902</p>
            <p className="mt-1 text-xs text-emerald-600">+ 5.4%</p>
          </div>
          <p className="text-[11px] text-[#9a9da8]">Revenue trend</p>
        </div>

        <div className="mt-1 h-[62px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSparklineData}>
              <defs>
                <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e7be5e" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#e7be5e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#d9a73d"
                strokeWidth={2}
                fill="url(#sparkGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
