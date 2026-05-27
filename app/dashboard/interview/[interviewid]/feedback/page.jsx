"use client";
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (interviewid) GetFeedback();
  }, [interviewid]);

  const GetFeedback = async () => {
    const answers = await db.select().from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, interviewid))
      .orderBy(UserAnswer.id);
    setFeedbackData(answers);

    const meta = await db.select().from(MockInterview)
      .where(eq(MockInterview.mockId, interviewid));
    const interviewInfo = meta[0];
    setInterviewData(interviewInfo);

    if (answers.length > 0 && interviewInfo) {
      fetchSummary(answers, interviewInfo);
    }
  };

  const fetchSummary = async (data, meta) => {
    setSummaryLoading(true);
    try {
      const payload = {
        answers: data,
        jobPosition: meta?.jobPosition ?? 'Software Engineer',
        jobExperience: meta?.jobExperience ?? '2'
      };

      console.log("Sending to summary API:", payload);

      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      console.log("Summary API response:", json);

      setSummary({
        overall_verdict: json.overall_verdict ?? 'N/A',
        strengths: Array.isArray(json.strengths) ? json.strengths : [],
        gaps: Array.isArray(json.gaps) ? json.gaps : [],
        improvement_plan: Array.isArray(json.improvement_plan) ? json.improvement_plan : [],
        overall_score: json.overall_score ?? 'N/A',
        hire_confidence: json.hire_confidence ?? 'N/A',
      });
    } catch (e) {
      console.error("Summary error:", e);
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (feedbackData.length === 0) return null;
    const total = feedbackData.length;
    const avgRating = (feedbackData.reduce((acc, curr) => acc + parseFloat(curr.rating || 0), 0) / total).toFixed(1);
    const avgFiller = (feedbackData.reduce((acc, curr) => acc + parseFloat(curr.fillerWordsCount || 0), 0) / total).toFixed(1);
    const avgSpeaking = (feedbackData.reduce((acc, curr) => acc + parseFloat(curr.speakingRateScore || 0), 0) / total).toFixed(1);
    const strong = feedbackData.filter(q => parseFloat(q.rating) >= 8).length;
    const weak = feedbackData.filter(q => parseFloat(q.rating) < 6).length;
    return { avgRating, avgFiller, avgSpeaking, strong, weak, total };
  }, [feedbackData]);

  const nextCard = () => setCurrentIndex((prev) => Math.min(prev + 1, feedbackData.length - 1));
  const prevCard = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <div className='p-6 md:p-10 max-w-3xl mx-auto'>
      <div className="flex items-center justify-between mb-8">
        <h1 className='text-2xl font-bold'>Interview Feedback</h1>
        <Button variant="outline" onClick={() => router.replace('/dashboard')}>Dashboard</Button>
      </div>

      {/* AI INTERVIEW SUMMARY */}
      {summaryLoading && (
        <Card className="mb-8 p-6 text-center text-slate-400 animate-pulse">
          Generating interview analysis...
        </Card>
      )}

      {summary && !summaryLoading && (
        <Card className="mb-8 p-6 bg-slate-950 text-white border border-slate-700">
          <h2 className="text-lg font-bold mb-1">Interview Debrief</h2>
          <p className="text-slate-400 text-sm mb-6">AI analysis across all {feedbackData.length} answers</p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 p-4 bg-slate-900 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Verdict</p>
              <p className="text-base font-semibold text-white">{summary.overall_verdict}</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg text-center min-w-[120px]">
              <p className="text-xs text-slate-400 mb-1">Interviewer Score</p>
              <p className="text-3xl font-bold text-green-400">{summary.overall_score}<span className="text-sm text-slate-400">/10</span></p>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg text-center min-w-[120px]">
              <p className="text-xs text-slate-400 mb-1">Hire Confidence</p>
              <p className="text-3xl font-bold text-blue-400">{summary.hire_confidence}<span className="text-sm text-slate-400">/10</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Strengths</p>
              <ul className="space-y-2">
                {summary.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-100">✓ {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-red-950 border border-red-800 rounded-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">Gaps</p>
              <ul className="space-y-2">
                {summary.gaps?.map((g, i) => (
                  <li key={i} className="text-sm text-red-100">✗ {g}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Before Next Interview</p>
            <ol className="space-y-2 list-decimal list-inside">
              {summary.improvement_plan?.map((tip, i) => (
                <li key={i} className="text-sm text-slate-300">{tip}</li>
              ))}
            </ol>
          </div>
        </Card>
      )}

      {/* METRICS SUMMARY */}
      {metrics && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Avg Score</p>
            <p className={`text-3xl font-bold ${parseFloat(metrics.avgRating) >= 7 ? 'text-green-400' : 'text-amber-400'}`}>
              {metrics.avgRating}<span className="text-sm text-slate-400">/10</span>
            </p>
          </Card>
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Speaking Rate</p>
            <p className="text-3xl font-bold text-blue-400">
              {metrics.avgSpeaking}<span className="text-sm text-slate-400">/10</span>
            </p>
          </Card>
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Avg Filler Words</p>
            <p className={`text-3xl font-bold ${parseFloat(metrics.avgFiller) <= 2 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.avgFiller}
            </p>
          </Card>
          <Card className="p-5 bg-slate-900 text-white">
            <p className="text-xs text-slate-400 mb-1">Strong / Weak</p>
            <p className="text-2xl font-bold">
              <span className="text-green-400">{metrics.strong}</span>
              <span className="text-slate-500"> / </span>
              <span className="text-red-400">{metrics.weak}</span>
            </p>
            <p className="text-xs text-slate-500">of {metrics.total} questions</p>
          </Card>
        </div>
      )}

      {/* EXISTING CARD CAROUSEL */}
      {feedbackData.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">No feedback found.</Card>
      ) : (
        <div className="relative">
          <Card className="min-h-[400px] flex flex-col justify-between">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-sm bg-slate-100 px-3 py-1 rounded-full">
                  Question {currentIndex + 1} / {feedbackData.length}
                </span>
                <span className={`font-bold text-lg ${parseFloat(feedbackData[currentIndex].rating) >= 7 ? 'text-green-600' : 'text-amber-600'}`}>
                  {feedbackData[currentIndex].rating}/10
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-6">{feedbackData[currentIndex].question}</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Answer</h4>
                  <p className="text-slate-700">{feedbackData[currentIndex].userAns}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Expert Feedback</h4>
                  <p className="text-emerald-900">{feedbackData[currentIndex].feedback}</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Filler words: <strong>{feedbackData[currentIndex].fillerWordsCount ?? 'N/A'}</strong></span>
                  <span>Speaking rate: <strong>{feedbackData[currentIndex].speakingRateScore ?? 'N/A'}/10</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button onClick={prevCard} disabled={currentIndex === 0}><ChevronLeft /> Previous</Button>
            <Button onClick={nextCard} disabled={currentIndex === feedbackData.length - 1}>Next <ChevronRight /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;
