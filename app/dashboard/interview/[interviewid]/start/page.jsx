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
import dynamic from "next/dynamic";

const RecordAnswerSection = dynamic(
  () => import("./_components/RecordAnswerSection"),
  { ssr: false },
);

function StartInterview({ params }) {
  const [interviewData, setInterviewData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
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

      // 1. Fetch Interview Meta
      const [interview] = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId));

      setInterviewData(interview);

      // 2. Fetch Questions Relationally
      if (interview) {
        const fetchedQuestions = await db
          .select()
          .from(InterviewQuestion)
          .where(eq(InterviewQuestion.interviewId, interview.id));

        setQuestions(fetchedQuestions);

        // 3. Auto-focus retry question if present
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

  if (!interviewData) return <div>Loading interview...</div>;
  if (questions.length === 0) return <div>Loading questions...</div>;

  const allAnswered = answeredQuestions.size === questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ExamHeader
        title={interviewData.jobPosition}
        mode={interviewData.mode}
        answeredCount={answeredQuestions.size}
        totalCount={questions.length}
        timeLeft={timeLeft}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[46%_54%] gap-6">
          <div className="flex flex-col">
            <QuestionSection
              questions={questions}
              activeQuestionIndex={activeQuestionIndex}
              mode={interviewData.mode}
              answeredQuestions={answeredQuestions}
            />
          </div>

          <div className="flex flex-col gap-6">
            <RecordAnswerSection
              question={questions[activeQuestionIndex]}
              activeQuestionIndex={activeQuestionIndex}
              interviewData={interviewData}
              setactiveQuestionIndex={setActiveQuestionIndex}
              questionsLength={questions.length}
              answeredQuestions={answeredQuestions}
              setAnsweredQuestions={setAnsweredQuestions}
              onNextQuestion={() => {
                if (activeQuestionIndex < questions.length - 1) {
                  setActiveQuestionIndex(activeQuestionIndex + 1);
                }
              }}
            />
            {allAnswered && (
              <Button
                onClick={() => setSubmitDialogOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Submit Test
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? You will be redirected to the feedback page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setSubmitDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Confirm Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StartInterview;
