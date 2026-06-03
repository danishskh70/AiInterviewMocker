"use server"
import { db } from "@/utils/db";
import { MockInterview, UserAnswer, InterviewQuestion } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";

export async function fetchInterviews(email) {
  if (!email) return [];
  return await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.createdBy, email))
    .orderBy(desc(MockInterview.id));
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
