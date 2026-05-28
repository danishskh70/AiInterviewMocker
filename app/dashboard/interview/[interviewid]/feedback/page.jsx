"use client";
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from 'lucide-react';

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const router = useRouter();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [viewMode, setViewMode] = useState('summary');
  const [transitionLoading, setTransitionLoading] = useState(false);

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
    
    if (answers.length > 0 && meta[0]) {
      fetchSummary(answers, meta[0]);
    }
  };

  const fetchSummary = async (data, meta) => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: data,
          jobPosition: meta?.jobPosition ?? 'Software Engineer',
          jobExperience: meta?.jobExperience ?? '2'
        })
      });
      const json = await res.json();
      setSummary({
        overall_verdict: json.overall_verdict ?? 'N/A',
        strengths: Array.isArray(json.strengths) ? json.strengths : [],
        gaps: Array.isArray(json.gaps) ? json.gaps : [],
        improvement_plan: Array.isArray(json.improvement_plan) ? json.improvement_plan : [],
        overall_score: json.overall_score ?? 'N/A',
      });
    } catch (e) {
      console.error("Summary error:", e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const openQuestion = (item) => {
    setSheetOpen(true);
    setLoading(true);
    setSelectedQuestion(null);
    setTimeout(() => {
      setSelectedQuestion(item);
      setLoading(false);
    }, 2000);
  };

  const handleExploreClick = () => {
    setTransitionLoading(true);
    setTimeout(() => {
        setViewMode('questions');
        setTransitionLoading(false);
    }, 1000);
  };

  const handleBackToSummary = () => {
    setTransitionLoading(true);
    setTimeout(() => {
        setViewMode('summary');
        setTransitionLoading(false);
    }, 1000);
  };

  return (
    <div className='p-8 md:p-20 w-full text-black'>
      <div className="flex justify-between items-end mb-24">
        <h1 className='text-6xl font-black tracking-tighter uppercase leading-none'>Feedback<br/>Report</h1>
        <button className="text-[10px] font-bold uppercase tracking-widest hover:opacity-50" onClick={() => router.replace('/dashboard')}>Dashboard</button>
      </div>

      {(summaryLoading || transitionLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Processing...</span>
        </div>
      )}

      {summary && !summaryLoading && (
        <div className="duration-700 ease-in-out transition-opacity">
          
          {viewMode === 'summary' && (
            <div className="space-y-16 animate-in fade-in duration-700">
              <header>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">Performance Evaluation</p>
                <h2 className="text-5xl font-black tracking-tighter leading-[0.9]">Interview<br/>Summary</h2>
              </header>

              <section className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-3 border-t border-b border-black py-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Verdict</p>
                  <p className="text-2xl font-light leading-snug">"{summary.overall_verdict}"</p>
                </div>
                <div className="border border-black flex flex-col items-center justify-center p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Score</p>
                  <p className="text-5xl font-black">{summary.overall_score}<span className="text-xl font-light opacity-50">/10</span></p>
                </div>
              </section>

              <section className="grid md:grid-cols-2 gap-10">
                <div className="border-t pt-6 border-black">
                  <h3 className="text-base font-bold mb-6 uppercase tracking-tight">Strengths</h3>
                  <ul className="space-y-4">{summary.strengths?.map((s, i) => <li key={i} className="text-xs font-medium border-b border-slate-100 pb-3 tracking-wide">— {s}</li>)}</ul>
                </div>
                <div className="border-t pt-6 border-black">
                  <h3 className="text-base font-bold mb-6 uppercase tracking-tight">Growth Areas</h3>
                  <ul className="space-y-4">{summary.gaps?.map((g, i) => <li key={i} className="text-xs font-medium border-b border-slate-100 pb-3 tracking-wide">○ {g}</li>)}</ul>
                </div>
              </section>
              
              <section className="p-12 bg-black text-white">
                <h3 className="text-base font-bold mb-8 uppercase tracking-tight text-white">Roadmap</h3>
                <ol className="space-y-4 text-xs font-light list-decimal list-inside text-white">{summary.improvement_plan?.map((tip, i) => <li key={i} className="tracking-wide leading-relaxed text-white">{tip}</li>)}</ol>
              </section>

              <footer className="text-center pt-10">
                <button onClick={handleExploreClick} className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] border border-black hover:bg-black hover:text-white transition-all">
                     Deep Dive Analysis
                </button>
              </footer>
            </div>
          )}

          {viewMode === 'questions' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <button onClick={handleBackToSummary} className="text-[10px] font-bold uppercase tracking-widest p-0">← Back</button>
              <div className="space-y-2">
                  <h2 className="text-3xl font-black">Question Deep-Dive</h2>
                  <p className="text-slate-500 text-xs">Select to reveal coaching report.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {feedbackData.map((item, index) => (
                  <button key={index} onClick={() => openQuestion(item)} className="text-left p-8 border border-slate-200 hover:border-black transition-all group">
                    <div className="font-mono text-lg font-bold mb-4 group-hover:text-black text-slate-300">0{index + 1}</div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Critique</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="max-w-md w-full border-l border-black p-10">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-xs font-black uppercase tracking-widest">Question Feedback</SheetTitle>
          </SheetHeader>
          {loading ? (
            <div className="animate-pulse text-[10px] font-bold uppercase">Loading...</div>
          ) : selectedQuestion ? (
            <div className="space-y-8">
              <p className="text-sm font-medium leading-relaxed">{selectedQuestion.question}</p>
              <div className="border-t pt-8">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3">Feedback</p>
                <p className="text-xs leading-relaxed">{selectedQuestion.feedback}</p>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Feedback;