import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { getProductivityPercentage } from "../../services/analyticsService";

export default function ProductivityChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } =
          await getProductivityPercentage();

        setData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const average =
    data.length > 0
      ? Math.round(
          data.reduce(
            (sum, item) =>
              sum + item.productivity,
            0
          ) / data.length
        )
      : 0;

if (!data.length) {
  return (
    <div className="bg-surface rounded-2xl border p-6">
      <div className="h-[300px] flex items-center justify-center">
        No productivity data available
      </div>
    </div>
  );
}

  return (
    <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Team Productivity
          </h3>

          <p className="text-sm text-text-secondary mt-1">
             Completion efficiency over time
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {average}%
          </div>

          <div className="text-xs text-text-secondary">
            Average
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="productivityGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#3B82F6"
                  stopOpacity={0.4}
                />

                <stop
                  offset="95%"
                  stopColor="#3B82F6"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis
              domain={[0, 100]}
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="productivity"
              stroke="#3B82F6"
              fill="url(#productivityGradient)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}