"use client";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/utils/db";
import { UserAnswer, MockInterview, InterviewQuestion } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewMode, setViewMode] = useState("summary");
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (interviewid) {
      GetFeedback().finally(() => setInitialLoading(false));
    }
  }, [interviewid]);

  useEffect(() => {
    if (!summary?.overall_score || !meta?.jobPosition) return;

    async function loadScoreHistory() {
      try {
        const res = await fetch(
          `/api/score-history?jobPosition=${encodeURIComponent(
            meta.jobPosition
          )}`
        );
        const history = await res.json();
        setScoreHistory(history);
      } catch (error) {
        console.error("Error loading score history:", error);
      }
    }

    loadScoreHistory();
  }, [summary, meta]);

  const GetFeedback = async () => {
    try {
      const [interview] = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewid));

      if (!interview) { console.error("Interview not found"); return; }

      setMeta(interview);

      const answers = await db
        .select({
          id: UserAnswer.id,
          question: InterviewQuestion.question,
          userAns: UserAnswer.userAns,
          feedback: UserAnswer.feedback,
          rating: UserAnswer.rating,
          hintUsed: UserAnswer.hintUsed,
        })
        .from(UserAnswer)
        .leftJoin(InterviewQuestion, eq(UserAnswer.questionId, InterviewQuestion.id))
        .where(eq(InterviewQuestion.interviewId, interview.id))
        .orderBy(UserAnswer.id);

      console.log("Feedback data:", answers);
      setFeedbackData(answers);
      fetchSummary(answers, interview);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const fetchSummary = async (data, metadata) => {
    setSummaryLoading(true);
    setSummaryError(null);
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
      if (!res.ok) throw new Error(json.error ?? "Summary failed");
      setSummary({
        overall_verdict: json.overall_verdict ?? "N/A",
        strengths: Array.isArray(json.strengths) ? json.strengths : [],
        gaps: Array.isArray(json.gaps) ? json.gaps : [],
        improvement_plan: Array.isArray(json.improvement_plan) ? json.improvement_plan : [],
        overall_score: json.overall_score ?? "N/A",
        hire_confidence: json.hire_confidence ?? "N/A",
      });
    } catch (e) {
      console.error("Summary error:", e);
      setSummaryError(e.message || "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const openQuestion = (item) => {
    setSelectedQuestion(item);
    setSheetOpen(true);
  };

  const switchView = (mode) => {
    setTransitionLoading(true);
    setTimeout(() => {
      setViewMode(mode);
      setTransitionLoading(false);
    }, 400);
  };

  const getRatingColor = (rating) => {
    const r = parseFloat(rating);
    if (r >= 8) return "text-green-600";
    if (r >= 6) return "text-yellow-600";
    return "text-red-500";
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <span className="text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (!initialLoading && feedbackData.length === 0) {
    return (
      <div className="p-8 md:p-20">
        <h1 className="text-4xl font-black mb-6">No Feedback Found</h1>
        <p className="text-slate-500 text-sm mb-8">
          No answers recorded for this interview.
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="text-xs font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-20 w-full text-black">
      {/* Header */}
      <div className="flex justify-between items-end mb-24">
        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
          Feedback
          <br />
          Report
        </h1>
        <button
          className="text-[10px] font-bold uppercase tracking-widest hover:opacity-50"
          onClick={() => router.replace("/dashboard")}
        >
          Dashboard
        </button>
      </div>

      {/* Full-screen loader */}
      {(summaryLoading || transitionLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <span className="text-xs font-bold uppercase tracking-widest animate-pulse">
            Processing...
          </span>
        </div>
      )}

      {/* Summary failed */}
      {summaryError && !summaryLoading && feedbackData.length > 0 && (
        <div className="text-center py-20 space-y-4">
          <p className="text-red-500 font-medium">Failed to generate summary.</p>
          <p className="text-slate-500 text-sm">{summaryError}</p>
          <button
            onClick={() => fetchSummary(feedbackData, meta)}
            className="text-xs font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {summary && !summaryLoading && (
        <div className="transition-opacity duration-700">

          {/* ── SUMMARY VIEW ── */}
          {viewMode === "summary" && (
            <div className="space-y-16 animate-in fade-in duration-700">
              <header>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">
                  Performance Evaluation
                </p>
                <h2 className="text-5xl font-black tracking-tighter leading-[0.9]">
                  Interview
                  <br />
                  Summary
                </h2>
              </header>

              {/* Verdict + Score */}
              <section className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-3 border-t border-b border-black py-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                    Verdict
                  </p>
                  <p className="text-2xl font-light leading-snug">
                    "{summary.overall_verdict}"
                  </p>
                </div>
                <div className="border border-black flex flex-col items-center justify-center p-8 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Score</p>
                    <p className={`text-5xl font-black ${getRatingColor(summary.overall_score)}`}>
                      {summary.overall_score}
                      <span className="text-xl font-light opacity-50">/10</span>
                    </p>
                  </div>
                  {summary.hire_confidence !== "N/A" && (
                    <div className="text-center border-t border-slate-200 pt-4 w-full">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Hire Confidence</p>
                      <p className={`text-3xl font-black ${getRatingColor(summary.hire_confidence)}`}>
                        {summary.hire_confidence}
                        <span className="text-sm font-light opacity-50">/10</span>
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Strengths + Gaps */}
              <section className="grid md:grid-cols-2 gap-10">
                <div className="border-t pt-6 border-black">
                  <h3 className="text-base font-bold mb-6 uppercase tracking-tight">
                    Strengths
                  </h3>
                  <ul className="space-y-4">
                    {summary.strengths.length > 0
                      ? summary.strengths.map((s, i) => (
                          <li key={i} className="text-xs font-medium border-b border-slate-100 pb-3 tracking-wide">
                            — {s}
                          </li>
                        ))
                      : <li className="text-xs text-slate-400">None recorded.</li>
                    }
                  </ul>
                </div>
                <div className="border-t pt-6 border-black">
                  <h3 className="text-base font-bold mb-6 uppercase tracking-tight">
                    Growth Areas
                  </h3>
                  <ul className="space-y-4">
                    {summary.gaps.length > 0
                      ? summary.gaps.map((g, i) => (
                          <li key={i} className="text-xs font-medium border-b border-slate-100 pb-3 tracking-wide">
                            ○ {g}
                          </li>
                        ))
                      : <li className="text-xs text-slate-400">None recorded.</li>
                    }
                  </ul>
                </div>
              </section>

              {/* Roadmap */}
              <section className="p-12 bg-black text-white">
                <h3 className="text-base font-bold mb-8 uppercase tracking-tight">
                  Improvement Roadmap
                </h3>
                <ol className="space-y-4 text-xs font-light list-decimal list-inside">
                  {summary.improvement_plan.length > 0
                    ? summary.improvement_plan.map((tip, i) => (
                        <li key={i} className="tracking-wide leading-relaxed">{tip}</li>
                      ))
                    : <li className="opacity-50">No specific plan generated.</li>
                  }
                </ol>
              </section>

              {/* Score Progress Chart */}
              {scoreHistory.length >= 1 && (
                <section>
                  <h3 className="text-base font-bold mb-6 uppercase tracking-tight">
                    Score Progress
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={[
                          ...scoreHistory.map((interview, idx) => ({
                            attempt: `Attempt ${idx + 1}`,
                            score: parseFloat(interview.overallScore) || 0,
                          })),
                          {
                            attempt: "Current",
                            score: parseFloat(summary?.overall_score) || 0,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="attempt" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#6366f1" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              <footer className="text-center pt-10">
                <button
                  onClick={() => switchView("questions")}
                  className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] border border-black hover:bg-black hover:text-white transition-all"
                >
                  Deep Dive — {feedbackData.length} Questions
                </button>
              </footer>
            </div>
          )}

          {/* ── QUESTIONS VIEW ── */}
          {viewMode === "questions" && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <button
                onClick={() => switchView("summary")}
                className="text-[10px] font-bold uppercase tracking-widest hover:opacity-50"
              >
                ← Back to Summary
              </button>

              <div>
                <h2 className="text-3xl font-black">Question Deep-Dive</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Click any question to see full feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbackData.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => openQuestion(item)}
                    className="text-left p-8 border border-slate-200 hover:border-black transition-all group space-y-3"
                  >
                    {/* Question number */}
                    <div className="font-mono text-lg font-bold text-slate-300 group-hover:text-black transition-colors">
                      0{index + 1}
                    </div>

                    {/* Question text */}
                    <p className="text-xs font-medium leading-relaxed line-clamp-3 text-slate-700">
                      {item.question ?? "Question unavailable"}
                    </p>

                    {/* Rating badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Rating
                      </span>
                      <span className={`text-sm font-black ${getRatingColor(item.rating)}`}>
                        {item.rating ?? "—"}/10
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SHEET ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="max-w-lg w-full border-l border-black p-10 overflow-y-auto">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-xs font-black uppercase tracking-widest">
              Question Feedback
            </SheetTitle>
          </SheetHeader>

          {selectedQuestion ? (
            <div className="space-y-8">
              {/* Question */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Question
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  {selectedQuestion.question}
                </p>
              </div>

              {/* Your answer */}
              <div className="border-t pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Your Answer
                </p>
                <p className="text-xs leading-relaxed text-slate-600">
                  {selectedQuestion.userAns ?? "No answer recorded."}
                </p>
              </div>

              {/* Rating */}
              <div className="border-t pt-6 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Rating
                </p>
                <p className={`text-2xl font-black ${getRatingColor(selectedQuestion.rating)}`}>
                  {selectedQuestion.rating ?? "—"}
                  <span className="text-sm font-light opacity-50">/10</span>
                </p>
              </div>

              {/* Feedback */}
              <div className="border-t pt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Feedback
                </p>
                {(() => {
                  try {
                    const fb = JSON.parse(selectedQuestion.feedback);
                    return (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold">{fb.feedback}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-green-600 mb-1">Strengths</p>
                            <p className="text-xs">{fb.strengths}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-amber-600 mb-1">Improvements</p>
                            <p className="text-xs">{fb.improvements}</p>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return <p className="text-xs leading-relaxed">{selectedQuestion.feedback}</p>;
                  }
                })()}
              </div>

              {/* Hint used indicator */}
              {selectedQuestion.hintUsed && (
                <div className="border-t pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                    ⚠ Hint was used for this question
                  </p>
                </div>
              )}

              {/* Re-try button */}
              <div className="border-t pt-6">
                <button
                  onClick={() => router.push(`/dashboard/interview/${interviewid}/start?retryQuestion=${selectedQuestion.id}`)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-bold uppercase"
                >
                  Re-try this Question
                </button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Feedback;
