"use server"
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
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
    .select()
    .from(UserAnswer)
    .where(eq(UserAnswer.userEmail, email))
    .orderBy(desc(UserAnswer.createdAt));
}
