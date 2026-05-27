"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { fetchUserAnalytics, fetchInterviews } from '../actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Analytics() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      Promise.all([
        fetchUserAnalytics(email),
        fetchInterviews(email)
      ]).then(([answers, interviewList]) => {
        setData(answers);
        setInterviews(interviewList);
      });
    }
  }, [user]);

  // Per-interview aggregated scores (grouped by mockIdRef)
  const interviewScores = useMemo(() => {
    const groups = {};
    data.forEach(row => {
      const id = row.mockIdRef;
      if (!groups[id]) groups[id] = { ratings: [], fillers: [] };
      groups[id].ratings.push(parseFloat(row.rating || 0));
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

  // Chart: one point per interview session (not per answer)
  const trendData = useMemo(() => {
    return interviews.map((iv, idx) => ({
      label: `#${interviews.length - idx}`,
      rating: parseFloat(interviewScores[iv.mockId]?.avgRating || 0),
      filler: parseFloat(interviewScores[iv.mockId]?.avgFiller || 0),
    })).reverse();
  }, [interviews, interviewScores]);

  // Summary stats
  const stats = useMemo(() => {
    if (!trendData.length) return null;
    const ratings = trendData.map(d => d.rating).filter(Boolean);
    const best = Math.max(...ratings).toFixed(1);
    const latest = trendData[trendData.length - 1]?.rating?.toFixed(1);
    const trend = trendData.length >= 2
      ? (trendData[trendData.length - 1].rating - trendData[0].rating).toFixed(1)
      : null;
    return { best, latest, trend, total: interviews.length };
  }, [trendData, interviews]);

  return (
    <div className='p-6 md:p-10 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8'>Performance Analytics</h1>

      {/* STAT PILLS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Total Interviews</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Latest Score</p>
            <p className={`text-3xl font-bold ${parseFloat(stats.latest) >= 7 ? 'text-green-400' : 'text-amber-400'}`}>
              {stats.latest}<span className="text-sm text-slate-400">/10</span>
            </p>
          </Card>
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Best Score</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.best}<span className="text-sm text-slate-400">/10</span>
            </p>
          </Card>
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Overall Trend</p>
            <p className={`text-3xl font-bold ${parseFloat(stats.trend) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.trend !== null ? `${parseFloat(stats.trend) >= 0 ? '+' : ''}${stats.trend}` : 'N/A'}
            </p>
          </Card>
        </div>
      )}

      {/* TREND CHARTS — per interview session, not per answer */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Career Trend</h2>
        <p className="text-sm text-slate-500 mb-6">Each point = one interview session average</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Score Per Interview</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip formatter={(val) => [`${val}/10`, 'Avg Score']} />
                  <Line type="monotone" dataKey="rating" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Filler Words Per Interview</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(val) => [val, 'Avg Filler Words']} />
                  <Bar dataKey="filler" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* INTERVIEW HISTORY */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Interview History</h2>
        {interviews.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">No interviews yet.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviews.map((iv) => {
              const score = interviewScores[iv.mockId];
              const rating = parseFloat(score?.avgRating || 0);
              return (
                <Card key={iv.mockId} className="flex flex-col justify-between p-5 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <p className="font-semibold text-base mb-1">{iv.jobPosition}</p>
                    <p className="text-xs text-slate-500">{iv.jobExperience} yrs exp • {iv.createdAt}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${rating >= 7 ? 'text-green-600' : rating >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                      {score?.avgRating ?? '—'}<span className="text-xs text-slate-400">/10</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/interview/${iv.mockId}/feedback`)}
                    >
                      View Report
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Analytics;
