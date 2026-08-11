import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PANEL_CLASS, PanelTitle } from "./ui";
import { cn } from "@/lib/utils";

interface EarningsChartProps {
  data: number[];
  weekTotal?: number;
  avgDaily?: number;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({
  data,
  weekTotal = 0,
  avgDaily = 0,
}) => {
  const chartData = data.map((earnings, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      earnings,
      fullDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  const formatTooltipValue = (value: number): [string, string] => [
    `$${value.toFixed(2)}`,
    "Earnings",
  ];

  return (
    <div className={cn(PANEL_CLASS, "h-full p-4 sm:p-5 flex flex-col")}>
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <PanelTitle as="h3">Earnings statistics</PanelTitle>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-0.5">
              Week total
            </p>
            <p className="text-sm font-semibold text-white tabular-nums">
              ${weekTotal.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-0.5">
              Daily avg
            </p>
            <p className="text-sm font-semibold text-white tabular-nums">
              ${avgDaily.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#262626"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737373", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737373", fontSize: 11 }}
              tickFormatter={(value: number) => `$${value}`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "10px",
                color: "#F5F5F5",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(249,115,22,0.06)" }}
              formatter={formatTooltipValue}
              labelFormatter={(value: string) =>
                `Date: ${chartData.find((d) => d.day === value)?.fullDate || value}`
              }
            />
            <Bar dataKey="earnings" fill="#F97316" radius={[8, 8, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
