"use client";

import Card from "@/modules/ui/Card";
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
import { revenueBookingsData } from "./dashboard-mock-data";

export default function DashboardRevenueChartCard() {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[30px] font-semibold leading-none text-[#2b2f3a]">
          Revenue &amp; Bookings
        </h3>
        <div className="flex items-center gap-3 text-xs text-[#6f7380]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d9a63a]" />
            Revenue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#b8bbc5]" />
            Bookings
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d7d9e1]" />
            Reversed
          </span>
        </div>
      </div>

      <div className="h-[286px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={revenueBookingsData}
            margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradientMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dfb34d" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#dfb34d" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ebebef" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8b8f9a", fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              ticks={[500, 1000, 1500]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8b8f9a", fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              ticks={[500, 1000, 1500]}
              tickFormatter={() => "EUR 23,456"}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#8b8f9a", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "#d8dae2", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e6e7eb",
                background: "#ffffff",
                boxShadow: "0 8px 20px rgba(20, 24, 40, 0.08)",
              }}
            />
            <Area
              yAxisId="left"
              name="Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#d9a63a"
              strokeWidth={2}
              fill="url(#revenueGradientMain)"
              dot={{ fill: "#d9a63a", r: 3 }}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="left"
              name="Bookings"
              type="monotone"
              dataKey="bookings"
              stroke="#b8bbc5"
              strokeWidth={1.75}
              dot={{ fill: "#b8bbc5", r: 2 }}
              activeDot={{ r: 3 }}
            />
            <Line
              yAxisId="left"
              name="Reversed"
              type="monotone"
              dataKey="reversed"
              stroke="#d7d9e1"
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
