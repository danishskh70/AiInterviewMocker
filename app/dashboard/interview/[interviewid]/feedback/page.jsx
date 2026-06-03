"use client";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/utils/db";
import { UserAnswer, MockInterview, InterviewQuestion } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Assuming these helpers still exist in the project or are extracted
const getRatingColor = (rating) => {
  const r = parseFloat(rating);
  if (r >= 8) return "text-emerald-600";
  if (r >= 6) return "text-amber-600";
  return "text-rose-500";
};

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewMode, setViewMode] = useState("summary");
  const router = useRouter();

  useEffect(() => {
    if (interviewid) {
      GetFeedback().finally(() => setInitialLoading(false));
    }
  }, [interviewid]);

  const openQuestion = (item) => {
    setSelectedQuestion(item);
    setSheetOpen(true);
  };

  const switchView = (mode) => {
    setViewMode(mode);
  };

  const GetFeedback = async () => {
    try {
      const [interview] = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewid));

      if (!interview) return;

      const answers = await db
        .select({
          id: UserAnswer.id,
          question: InterviewQuestion.question,
          userAns: UserAnswer.userAns,
          feedback: UserAnswer.feedback,
          rating: UserAnswer.rating,
        })
        .from(UserAnswer)
        .leftJoin(InterviewQuestion, eq(UserAnswer.questionId, InterviewQuestion.id))
        .where(eq(InterviewQuestion.interviewId, interview.id));

      setFeedbackData(answers);
      fetchSummary(answers, interview);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async (data, metadata) => {
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: data,
          jobPosition: metadata?.jobPosition ?? "Software Engineer",
          jobExperience: metadata?.jobExperience ?? "0",
        }),
      });
      const json = await res.json();
      setSummary({
        overall_verdict: json.overall_verdict ?? "N/A",
        strengths: Array.isArray(json.strengths) ? json.strengths : [],
        gaps: Array.isArray(json.gaps) ? json.gaps : [],
        overall_score: json.overall_score ?? "N/A",
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] p-8 md:p-12 lg:p-20">
      {/* Balanced Header */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Interview Report</h1>
          <p className="text-slate-500 text-sm mt-1">Role: Senior Developer • 2 days ago</p>
        </div>
        <button onClick={() => router.replace("/dashboard")} className="text-sm font-medium hover:text-indigo-600">Dashboard</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        {/* Main Content */}
        <main className="space-y-12">
          {viewMode === "summary" && summary && (
            <>
              <section>
                <h2 className="text-2xl font-semibold mb-4">Interview Summary</h2>
                <p className="leading-relaxed text-slate-700">"{summary.overall_verdict}"</p>
              </section>

              <section className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Strengths</h3>
                  <ul className="space-y-2 text-slate-700 list-disc list-inside">
                    {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Growth Areas</h3>
                  <ul className="space-y-2 text-slate-700 list-disc list-inside">
                    {summary.gaps.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              </section>
            </>
          )}

          {viewMode === "questions" && (
            <section>
              <button onClick={() => switchView("summary")} className="mb-6 text-indigo-600 font-medium">← Back to Summary</button>
              <h2 className="text-2xl font-semibold mb-6">Question Deep-Dive</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbackData.map((item, index) => (
                  <button key={index} onClick={() => openQuestion(item)} className="p-4 border rounded hover:border-indigo-600">
                    <p className="font-semibold">Question {index + 1}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.question}</p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sticky Score Card */}
        <aside>
          {summary && (
            <div className="sticky top-20 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-center mb-6">
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Overall Score</p>
                    <p className={`text-5xl font-bold ${getRatingColor(summary.overall_score)}`}>
                        {summary.overall_score}<span className="text-lg text-slate-400">/10</span>
                    </p>
                </div>
                <button 
                  onClick={() => switchView("questions")}
                  className="w-full py-5 text-gray-300 font-black uppercase tracking-[0.3em] transition-all hover:text-white"
                  style={{
                    background: 'linear-gradient(to right, #D4AF37, #000000)',
                  }}
                >
                    View Question Deep-Dive ({feedbackData.length} Questions)
                </button>
            </div>
          )}
        </aside>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="max-w-lg w-full">
            <SheetHeader className="mb-8">
                <SheetTitle>Question Feedback</SheetTitle>
            </SheetHeader>
            {selectedQuestion && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Question</p>
                  <p className="text-sm mt-2">{selectedQuestion.question}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Rating</p>
                  <p className="text-xl font-bold">{selectedQuestion.rating}/10</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Feedback</p>
                  {(() => {
                    let fb = selectedQuestion.feedback;
                    if (typeof fb === 'string') {
                      try {
                        if (fb.trim().startsWith('{')) fb = JSON.parse(fb);
                      } catch (e) {
                        return <p className="text-sm mt-2">{fb}</p>;
                      }
                    }
                    if (typeof fb === 'string') return <p className="text-sm mt-2">{fb}</p>;
                    return (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">{fb.feedback}</p>
                        <p className="text-xs font-bold text-emerald-700">Strengths: {fb.strengths}</p>
                        <p className="text-xs font-bold text-amber-700">Improvements: {fb.improvements}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Feedback;
