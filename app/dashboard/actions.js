"use server"
import { db } from "@/utils/db";
import { MockInterview, UserAnswer, InterviewQuestion, InterviewTask } from "@/utils/schema";
import { eq, desc, inArray } from "drizzle-orm";

export async function fetchInterviews(email) {
  if (!email) return [];
  return await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.createdBy, email))
    .orderBy(desc(MockInterview.id));
}

export async function deleteInterview(id) {
  // Delete UserAnswers (children of InterviewQuestions)
  const questions = await db
    .select({ id: InterviewQuestion.id })
    .from(InterviewQuestion)
    .where(eq(InterviewQuestion.interviewId, id));

  if (questions.length > 0) {
    const questionIds = questions.map((q) => q.id);
    await db.delete(UserAnswer).where(inArray(UserAnswer.questionId, questionIds));
  }

  // Delete child records
  await db.delete(InterviewTask).where(eq(InterviewTask.interviewId, id));
  await db.delete(InterviewQuestion).where(eq(InterviewQuestion.interviewId, id));
  
  // Delete parent record
  await db.delete(MockInterview).where(eq(MockInterview.id, id));
}

export async function fetchUserAnalytics(email) {
  if (!email) return [];
  return await db
    .select({
      id: UserAnswer.id,
      rating: UserAnswer.rating,
      questionId: UserAnswer.questionId,
      mockIdRef: MockInterview.mockId,
    })
    .from(UserAnswer)
    .leftJoin(InterviewQuestion, eq(UserAnswer.questionId, InterviewQuestion.id))
    .leftJoin(MockInterview, eq(InterviewQuestion.interviewId, MockInterview.id))
    .where(eq(UserAnswer.userEmail, email));
}
