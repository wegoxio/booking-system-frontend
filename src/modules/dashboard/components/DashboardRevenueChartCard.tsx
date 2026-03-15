"use client";

import Card from "@/modules/ui/Card";
import type { DashboardChartPoint } from "@/types/dashboard.types";
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

type DashboardRevenueChartCardProps = {
  title: string;
  data: DashboardChartPoint[];
  currency: string;
};

function formatCompactCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${value.toFixed(0)} ${currency}`;
  }
}

export default function DashboardRevenueChartCard({
  title,
  data,
  currency,
}: DashboardRevenueChartCardProps) {
  const chart = {
    primary: "var(--chart-primary)",
    primarySoft: "var(--chart-primary-soft)",
    secondary: "var(--chart-secondary)",
    tertiary: "var(--chart-tertiary)",
    grid: "var(--chart-grid)",
    axis: "var(--chart-axis)",
    cursor: "var(--chart-cursor)",
    tooltipBg: "var(--chart-tooltip-bg)",
    tooltipBorder: "var(--chart-tooltip-border)",
    tooltipShadow: "var(--shadow-row)",
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[30px] font-semibold leading-none text-fg-strong">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Revenue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-secondary" />
            Bookings
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-tertiary" />
            Cancelled
          </span>
        </div>
      </div>

      <div className="h-71.5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradientMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chart.primarySoft} stopOpacity={0.35} />
                <stop offset="95%" stopColor={chart.primarySoft} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="month_label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: chart.axis, fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: chart.axis, fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatCompactCurrency(Number(value), currency)}
              tickLine={false}
              axisLine={false}
              tick={{ fill: chart.axis, fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Revenue") {
                  return [formatCompactCurrency(Number(value), currency), name];
                }
                return [Number(value), name];
              }}
              cursor={{ stroke: chart.cursor, strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 10,
                border: `1px solid ${chart.tooltipBorder}`,
                background: chart.tooltipBg,
                boxShadow: chart.tooltipShadow,
              }}
            />
            <Area
              yAxisId="right"
              name="Revenue"
              type="monotone"
              dataKey="revenue"
              stroke={chart.primary}
              strokeWidth={2}
              fill="url(#revenueGradientMain)"
              dot={{ fill: chart.primary, r: 3 }}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="left"
              name="Bookings"
              type="monotone"
              dataKey="bookings"
              stroke={chart.secondary}
              strokeWidth={1.75}
              dot={{ fill: chart.secondary, r: 2 }}
              activeDot={{ r: 3 }}
            />
            <Line
              yAxisId="left"
              name="Cancelled"
              type="monotone"
              dataKey="cancelled"
              stroke={chart.tertiary}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
