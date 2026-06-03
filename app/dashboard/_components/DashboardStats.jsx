"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DashboardStats({ stats }) {
  if (!stats)
    return (
      <div className="p-4 bg-gray-50 rounded">
        No interview data yet. Start practicing!
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm text-gray-500">Total Questions</h3>
        <p className="text-2xl font-bold">{stats.totalQuestionsAnswered}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm text-gray-500">Average Score</h3>
        <p className="text-2xl font-bold">{stats.averageScore}/10</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm text-gray-500">Strongest Category</h3>
        <p className="text-lg font-semibold">{stats.strongestCategory}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="text-sm text-gray-500">Weakest Category</h3>
        <p className="text-lg font-semibold">{stats.weakestCategory}</p>
      </div>

      <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 border rounded-lg h-80">
        <h3 className="text-sm text-gray-500 mb-4">Category Breakdown</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.categoryBreakdown} margin={{ bottom: 40 }}>
            <XAxis dataKey="category" interval={0} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="avg" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardStats;
