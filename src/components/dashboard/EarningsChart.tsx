import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    <div className="h-full rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm p-4 sm:p-5 flex flex-col">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
            Earnings Trend
          </p>
          <h3 className="text-base font-semibold text-white">Last 7 days</h3>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 mb-0.5">
              Week total
            </p>
            <p className="font-semibold text-white tabular-nums">
              ${weekTotal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 mb-0.5">
              Daily avg
            </p>
            <p className="font-semibold text-white tabular-nums">
              ${avgDaily.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={formatTooltipValue}
              labelFormatter={(value: string) =>
                `Date: ${chartData.find((d) => d.day === value)?.fullDate || value}`
              }
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#earningsGradient)"
              dot={{ fill: "#F97316", strokeWidth: 0, r: 3 }}
              activeDot={{
                r: 5,
                stroke: "#F97316",
                strokeWidth: 2,
                fill: "#171717",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
