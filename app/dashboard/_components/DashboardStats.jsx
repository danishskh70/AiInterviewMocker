// DESIGN SYSTEM APPLIED
"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function DashboardStats({ stats }) {
  if (!stats)
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <p className="text-sm text-zinc-500">
          No interview data yet. Start practicing!
        </p>
      </div>
    );

  const statCards = [
    { label: "Total Questions", value: stats.totalQuestionsAnswered, size: "2xl" },
    { label: "Average Score",   value: `${stats.averageScore}/10`,   size: "2xl" },
    { label: "Strongest Area",  value: stats.strongestCategory,      size: "lg"  },
    { label: "Weakest Area",    value: stats.weakestCategory,         size: "lg"  },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, size }) => (
          <div
            key={label}
            className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-1 hover:shadow-md transition-shadow duration-200"
          >
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              {label}
            </p>
            <p className={`font-bold text-zinc-900 ${size === "2xl" ? "text-2xl" : "text-lg"}`}>
              {value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {stats.categoryBreakdown?.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-4">
            Category Breakdown
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={stats.categoryBreakdown}
              margin={{ bottom: 40, left: -10 }}
            >
              <XAxis
                dataKey="category"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "#f4f4f5" }}
              />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {stats.categoryBreakdown.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.category === stats.weakestCategory
                        ? "#fbbf24"  // amber — weakest
                        : entry.category === stats.strongestCategory
                        ? "#4ade80"  // green — strongest
                        : "#18181b"  // zinc-900 — default
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default DashboardStats;