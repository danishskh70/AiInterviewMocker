// DESIGN SYSTEM APPLIED
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
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  LoaderCircle,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";

function Feedback() {
  const { interviewid } = useParams();
  const [feedbackData, setFeedbackData]         = useState([]);
  const [summary, setSummary]                   = useState(null);
  const [summaryLoading, setSummaryLoading]     = useState(false);
  const [summaryError, setSummaryError]         = useState(null);
  const [initialLoading, setInitialLoading]     = useState(true);
  const [sheetOpen, setSheetOpen]               = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewMode, setViewMode]                 = useState("summary");
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [meta, setMeta]                         = useState(null);
  const [scoreHistory, setScoreHistory]         = useState([]);
  const [tasks, setTasks]                       = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (interviewid) GetFeedback().finally(() => setInitialLoading(false));
  }, [interviewid]);

  useEffect(() => {
    if (!summary?.overall_score || !meta?.jobPosition) return;
    fetch(`/api/score-history?jobPosition=${encodeURIComponent(meta.jobPosition)}`)
      .then((r) => r.json())
      .then(setScoreHistory)
      .catch(console.error);
  }, [summary, meta]);

  // Initialize tasks from improvement_plan
  useEffect(() => {
    if (!summary?.improvement_plan?.length) return;

    setTasks(
      summary.improvement_plan.map((text, index) => ({
        id: index,
        text,
        completed: false,
      }))
    );
  }, [summary?.improvement_plan]);

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
          id:       UserAnswer.id,
          question: InterviewQuestion.question,
          userAns:  UserAnswer.userAns,
          feedback: UserAnswer.feedback,
          rating:   UserAnswer.rating,
          hintUsed: UserAnswer.hintUsed,
        })
        .from(UserAnswer)
        .leftJoin(InterviewQuestion, eq(UserAnswer.questionId, InterviewQuestion.id))
        .where(eq(InterviewQuestion.interviewId, interview.id))
        .orderBy(UserAnswer.id);

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
      const res  = await fetch("/api/generate-summary", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          answers:       data,
          jobPosition:   metadata?.jobPosition   ?? "Software Engineer",
          jobExperience: metadata?.jobExperience ?? "0",
        }),
      });
      const json = await res.json();
      console.log("Summary API Response:", json);
      if (!res.ok) throw new Error(json.error ?? "Summary failed");
      setSummary({
        overall_verdict:  json.overall_verdict  ?? "N/A",
        strengths:        Array.isArray(json.strengths)        ? json.strengths        : [],
        gaps:             Array.isArray(json.gaps)             ? json.gaps             : [],
        improvement_plan: Array.isArray(json.improvement_plan) ? json.improvement_plan : [],
        overall_score:    json.overall_score    ?? "N/A",
        hire_confidence:  json.hire_confidence  ?? "N/A",
      });
    } catch (e) {
      console.error("Summary error:", e);
      setSummaryError(e.message || "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const toggleTask = async (taskId, current) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !current } : t))
    );
    await fetch(`/api/tasks/${taskId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ completed: !current }),
    });
  };

  const openQuestion = (item) => {
    setSelectedQuestion(item);
    setSheetOpen(true);
  };

  const switchView = (mode) => {
    setTransitionLoading(true);
    setTimeout(() => { setViewMode(mode); setTransitionLoading(false); }, 300);
  };

  const getScoreColor = (rating) => {
    const r = parseFloat(rating);
    if (r >= 8) return "text-green-700";
    if (r >= 6) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (rating) => {
    const r = parseFloat(rating);
    if (r >= 8) return "bg-green-50 border-green-200";
    if (r >= 6) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  // ── Loading state ──
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10 animate-fadeSlideUp">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Feedback Report
            </h1>
            {meta?.jobPosition && (
              <p className="text-sm text-zinc-500">{meta.jobPosition}</p>
            )}
          </div>
          <button
            onClick={() => router.replace("/dashboard")}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </div>

        {/* Full-screen processing overlay */}
        {(summaryLoading || transitionLoading) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <LoaderCircle className="h-6 w-6 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">Processing...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {summaryError && !summaryLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              Failed to generate summary
            </p>
            <p className="text-xs text-red-500">{summaryError}</p>
            <button
              onClick={() => fetchSummary(feedbackData, meta)}
              className="flex items-center gap-1.5 mt-1 px-4 py-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {summary && !summaryLoading && (
          <>
            {/* ── SUMMARY VIEW ── */}
            {viewMode === "summary" && (
              <div className="flex flex-col gap-8">

                {/* Score + verdict */}
                <div className="grid md:grid-cols-4 gap-4">

                  {/* Verdict card */}
                  <div className="md:col-span-3 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Overall Verdict
                    </p>
                    <p className="text-base font-medium text-zinc-900 leading-relaxed">
                      {summary.overall_verdict}
                    </p>
                  </div>

                  {/* Score card */}
                  <div className={`border rounded-xl p-6 flex flex-col items-center justify-center gap-3 ${getScoreBg(summary.overall_score)}`}>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Score
                    </p>
                    <p className={`text-4xl font-bold ${getScoreColor(summary.overall_score)}`}>
                      {summary.overall_score}
                      <span className="text-lg font-normal text-zinc-400">/10</span>
                    </p>
                    {summary.hire_confidence !== "N/A" && (
                      <div className="border-t border-zinc-200 pt-3 w-full text-center">
                        <p className="text-xs text-zinc-500 mb-1">Hire Confidence</p>
                        <p className={`text-xl font-bold ${getScoreColor(summary.hire_confidence)}`}>
                          {summary.hire_confidence}
                          <span className="text-sm font-normal text-zinc-400">/10</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deep-dive CTA */}
                <button
                  onClick={() => switchView("questions")}
                  className="w-full py-4 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  View Question Deep-Dive ({feedbackData.length} Questions)
                </button>

                {/* Strengths + Gaps */}
                <div className="grid md:grid-cols-2 gap-6">

                  {/* Strengths */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <h3 className="text-sm font-semibold text-zinc-900">Strengths</h3>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {summary.strengths.length > 0
                        ? summary.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-xs text-zinc-700 leading-relaxed pb-3 border-b border-zinc-100 last:border-0 last:pb-0"
                            >
                              {s}
                            </li>
                          ))
                        : <li className="text-xs text-zinc-400">None recorded.</li>
                      }
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold text-zinc-900">Growth Areas</h3>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {summary.gaps.length > 0
                        ? summary.gaps.map((g, i) => (
                            <li
                              key={i}
                              className="text-xs text-zinc-700 leading-relaxed pb-3 border-b border-zinc-100 last:border-0 last:pb-0"
                            >
                              {g}
                            </li>
                          ))
                        : <li className="text-xs text-zinc-400">None recorded.</li>
                      }
                    </ul>
                  </div>
                </div>

                {/* Roadmap checklist */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Improvement Roadmap
                  </h3>
                  {tasks.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {tasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                            className="mt-0.5 h-4 w-4 accent-zinc-900 rounded"
                          />
                          <span className={`text-xs leading-relaxed ${
                            task.completed
                              ? "line-through text-zinc-400"
                              : "text-zinc-700"
                          }`}>
                            {task.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {summary.improvement_plan.map((tip, i) => (
                        <p key={i} className="text-xs text-zinc-700 leading-relaxed pb-2 border-b border-zinc-100 last:border-0">
                          {tip}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Score progress chart */}
                {scoreHistory.length >= 1 && (
                  <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-zinc-500" />
                      <h3 className="text-sm font-semibold text-zinc-900">Score Progress</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart
                        data={[
                          ...scoreHistory.map((interview, idx) => ({
                            attempt: `Attempt ${idx + 1}`,
                            score:   parseFloat(interview.overallScore) || 0,
                          })),
                          {
                            attempt: "Current",
                            score:   parseFloat(summary?.overall_score) || 0,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                        <XAxis
                          dataKey="attempt"
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
                            background:   "#fff",
                            border:       "1px solid #e4e4e7",
                            borderRadius: "8px",
                            fontSize:     "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#18181b"
                          strokeWidth={2}
                          dot={{ r: 4, fill: "#18181b" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* ── QUESTIONS VIEW ── */}
            {viewMode === "questions" && (
              <div className="flex flex-col gap-8">
                <button
                  onClick={() => switchView("summary")}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors w-fit"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Summary
                </button>

                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-zinc-900">
                    Question Deep-Dive
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Click any question to see full feedback.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feedbackData.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => openQuestion(item)}
                      className="text-left bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-md hover:border-zinc-400 transition-all flex flex-col gap-3"
                    >
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-xs font-medium text-zinc-700 leading-relaxed line-clamp-3">
                        {item.question ?? "Question unavailable"}
                      </p>
                      <div className={`flex items-center justify-between pt-3 border-t mt-auto ${getScoreBg(item.rating)} -mx-6 -mb-6 px-6 py-3 rounded-b-xl`}>
                        <span className="text-xs text-zinc-500">Rating</span>
                        <span className={`text-sm font-bold ${getScoreColor(item.rating)}`}>
                          {item.rating ?? "—"}/10
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SHEET ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="max-w-lg w-full bg-white border-l border-zinc-200 overflow-y-auto p-8">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-sm font-semibold text-zinc-900">
              Question Feedback
            </SheetTitle>
          </SheetHeader>

          {selectedQuestion && (
            <div className="flex flex-col gap-6">

              {/* Question */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Question
                </p>
                <p className="text-sm text-zinc-900 leading-relaxed">
                  {selectedQuestion.question}
                </p>
              </div>

              {/* Rating */}
              <div className={`border rounded-xl px-4 py-3 flex items-center justify-between ${getScoreBg(selectedQuestion.rating)}`}>
                <p className="text-xs font-medium text-zinc-500">Rating</p>
                <p className={`text-xl font-bold ${getScoreColor(selectedQuestion.rating)}`}>
                  {selectedQuestion.rating ?? "—"}
                  <span className="text-sm font-normal text-zinc-400">/10</span>
                </p>
              </div>

              {/* Feedback */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Feedback
                </p>
                {(() => {
                  let fb = selectedQuestion.feedback;
                  if (typeof fb === "string") {
                    try {
                      if (fb.trim().startsWith("{")) fb = JSON.parse(fb);
                    } catch (e) {}
                  }

                  if (typeof fb === "string") {
                    return (
                      <p className="text-sm text-zinc-700 leading-relaxed">{fb}</p>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-zinc-700 leading-relaxed">
                        {fb.feedback}
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                            Strengths
                          </p>
                        </div>
                        <p className="text-xs text-green-800 leading-relaxed">
                          {fb.strengths}
                        </p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                            Improvements
                          </p>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          {fb.improvements}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Hint used */}
              {selectedQuestion.hintUsed && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    Hint was used for this question
                  </p>
                </div>
              )}

              {/* Re-try button */}
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/interview/${interviewid}/start?retryQuestion=${selectedQuestion.id}`
                  )
                }
                className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Re-try this Question
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Feedback;