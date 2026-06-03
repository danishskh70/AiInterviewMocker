// DESIGN SYSTEM APPLIED
"use client";
import { db } from "@/utils/db";
import { MockInterview, InterviewQuestion } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionSection from "./_components/QuestionSection";
import ExamHeader from "./_components/ExamHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";

const RecordAnswerSection = dynamic(
  () => import("./_components/RecordAnswerSection"),
  { ssr: false }
);

function StartInterview({ params }) {
  const [interviewData, setInterviewData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(1800);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const retryQuestionId = searchParams.get("retryQuestion");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      const interviewId = resolvedParams.interviewid;

      const [interview] = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId));

      setInterviewData(interview);

      if (interview) {
        const fetchedQuestions = await db
          .select()
          .from(InterviewQuestion)
          .where(eq(InterviewQuestion.interviewId, interview.id));

        setQuestions(fetchedQuestions);

        if (retryQuestionId) {
          const idx = fetchedQuestions.findIndex(
            (q) => String(q.id) === retryQuestionId
          );
          if (idx !== -1) setActiveQuestionIndex(idx);
        }
      }
    })();
  }, [params, retryQuestionId]);

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      const interviewId = (await params).interviewid;
      router.push(`/dashboard/interview/${interviewId}/feedback`);
    } catch (error) {
      console.error("Error submitting test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading states
  if (!interviewData)
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading interview...</p>
        </div>
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading questions...</p>
        </div>
      </div>
    );

  const allAnswered = answeredQuestions.size === questions.length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <ExamHeader
        title={interviewData.jobPosition}
        mode={interviewData.mode}
        answeredCount={answeredQuestions.size}
        totalCount={questions.length}
        timeLeft={timeLeft}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[46%_54%] gap-6">

          {/* Question panel */}
          <div className="flex flex-col">
            <QuestionSection
              questions={questions}
              activeQuestionIndex={activeQuestionIndex}
              mode={interviewData.mode}
              answeredQuestions={answeredQuestions}
            />
          </div>

          {/* Answer panel */}
          <div className="flex flex-col gap-4">
            <RecordAnswerSection
              question={questions[activeQuestionIndex]}
              activeQuestionIndex={activeQuestionIndex}
              interviewData={interviewData}
              setactiveQuestionIndex={setActiveQuestionIndex}
              questionsLength={questions.length}
              answeredQuestions={answeredQuestions}
              setAnsweredQuestions={setAnsweredQuestions}
              onNextQuestion={() => {
                if (activeQuestionIndex < questions.length - 1)
                  setActiveQuestionIndex(activeQuestionIndex + 1);
              }}
            />

            {/* Submit test — only when all answered */}
            {allAnswered && (
              <Button
                onClick={() => setSubmitDialogOpen(true)}
                size="lg"
                className="w-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Submit Test
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="bg-white border border-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900">
              Submit Test
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Are you sure you want to submit? You will be redirected to the feedback page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setSubmitDialogOpen(false)}
              disabled={isSubmitting}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                  Submitting...
                </>
              ) : (
                "Confirm Submit"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StartInterview;