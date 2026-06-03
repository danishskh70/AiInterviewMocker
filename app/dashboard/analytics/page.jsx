// DESIGN SYSTEM APPLIED
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { fetchUserAnalytics, fetchInterviews } from "../actions";
import {
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Award, BarChart2 } from "lucide-react";

const TOOLTIP_STYLE = {
  background:   "#fff",
  border:       "1px solid #e4e4e7",
  borderRadius: "8px",
  fontSize:     "12px",
};

function Analytics() {
  const { user }   = useUser();
  const router     = useRouter();
  const [data, setData]           = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      Promise.all([fetchUserAnalytics(email), fetchInterviews(email)])
        .then(([answers, interviewList]) => {
          setData(answers);
          setInterviews(interviewList);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const interviewScores = useMemo(() => {
    const groups = {};
    data.forEach((row) => {
      const id = row.mockIdRef;
      if (!groups[id]) groups[id] = { ratings: [], fillers: [] };
      groups[id].ratings.push(parseFloat(row.rating       || 0));
      groups[id].fillers.push(parseInt(row.fillerWordsCount || 0));
    });
    const result = {};
    Object.entries(groups).forEach(([id, vals]) => {
      result[id] = {
        avgRating: (vals.ratings.reduce((a, b) => a + b, 0) / vals.ratings.length).toFixed(1),
        avgFiller: (vals.fillers.reduce((a, b) => a + b, 0) / vals.fillers.length).toFixed(1),
      };
    });
    return result;
  }, [data]);

  const trendData = useMemo(() => {
    return interviews
      .map((iv, idx) => ({
        label:  `#${interviews.length - idx}`,
        rating: parseFloat(interviewScores[iv.mockId]?.avgRating || 0),
        filler: parseFloat(interviewScores[iv.mockId]?.avgFiller || 0),
      }))
      .reverse();
  }, [interviews, interviewScores]);

  const stats = useMemo(() => {
    if (!trendData.length) return null;
    const ratings = trendData.map((d) => d.rating).filter(Boolean);
    const best    = Math.max(...ratings).toFixed(1);
    const latest  = trendData[trendData.length - 1]?.rating?.toFixed(1);
    const trend   =
      trendData.length >= 2
        ? (trendData[trendData.length - 1].rating - trendData[0].rating).toFixed(1)
        : null;
    return { best, latest, trend, total: interviews.length };
  }, [trendData, interviews]);

  const getScoreColor = (r) => {
    const n = parseFloat(r);
    if (n >= 7) return "text-green-700";
    if (n >= 5) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (r) => {
    const n = parseFloat(r);
    if (n >= 7) return "bg-green-50 border-green-200";
    if (n >= 5) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-fadeSlideUp">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-fadeSlideUp">

      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Performance Analytics
        </h1>
        <p className="text-sm text-zinc-500">
          Track your progress across all mock interviews
        </p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Total Interviews
            </p>
            <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
          </div>

          <div className={`border rounded-xl p-6 flex flex-col gap-1 hover:shadow-md transition-shadow ${getScoreBg(stats.latest)}`}>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Latest Score
            </p>
            <p className={`text-2xl font-bold ${getScoreColor(stats.latest)}`}>
              {stats.latest}
              <span className="text-sm font-normal text-zinc-400">/10</span>
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Best Score
            </p>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-zinc-400" />
              <p className="text-2xl font-bold text-zinc-900">
                {stats.best}
                <span className="text-sm font-normal text-zinc-400">/10</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Overall Trend
            </p>
            <div className="flex items-center gap-1.5">
              {stats.trend !== null && parseFloat(stats.trend) >= 0
                ? <TrendingUp className="h-4 w-4 text-green-600" />
                : <TrendingDown className="h-4 w-4 text-red-500" />
              }
              <p className={`text-2xl font-bold ${
                stats.trend === null
                  ? "text-zinc-400"
                  : parseFloat(stats.trend) >= 0
                  ? "text-green-700"
                  : "text-red-600"
              }`}>
                {stats.trend !== null
                  ? `${parseFloat(stats.trend) >= 0 ? "+" : ""}${stats.trend}`
                  : "N/A"
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trend charts */}
      {trendData.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-zinc-900">Career Trend</h2>
            <p className="text-xs text-zinc-500">
              Each point represents one interview session average
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Score line chart */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <p className="text-sm font-medium text-zinc-900 mb-4">
                Score Per Interview
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => [`${val}/10`, "Avg Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#18181b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#18181b" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Filler words bar chart */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <p className="text-sm font-medium text-zinc-900 mb-4">
                Filler Words Per Interview
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => [val, "Avg Filler Words"]}
                  />
                  <Bar dataKey="filler" radius={[4, 4, 0, 0]}>
                    {trendData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.filler > 5 ? "#fbbf24" : "#18181b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Interview history */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">
          Interview History
        </h2>

        {interviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center border border-zinc-200 border-dashed rounded-xl">
            <BarChart2 className="h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-900">No interviews yet</p>
            <p className="text-sm text-zinc-500">
              Complete a mock interview to see your analytics
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviews.map((iv) => {
              const score  = interviewScores[iv.mockId];
              const rating = parseFloat(score?.avgRating || 0);

              const formattedDate = iv.createdAt
                ? new Date(iv.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : null;

              return (
                <div
                  key={iv.mockId}
                  className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm text-zinc-900">
                      {iv.jobPosition}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {iv.jobExperience} yrs exp
                      {formattedDate && ` • ${formattedDate}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                    <span className={`text-lg font-bold ${getScoreColor(rating)}`}>
                      {score?.avgRating ?? "—"}
                      <span className="text-xs font-normal text-zinc-400">/10</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/interview/${iv.mockId}/feedback`)
                      }
                      className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs"
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;