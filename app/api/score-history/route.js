import { db } from "@/utils/db";
import { UserAnswer, InterviewQuestion, MockInterview } from "@/utils/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(req) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobPosition = searchParams.get("jobPosition");

  try {
    const userAnswers = await db
      .select({
        interviewId: MockInterview.id,
        jobPosition: MockInterview.jobPosition,
        createdAt: MockInterview.createdAt,
        rating: UserAnswer.rating,
      })
      .from(UserAnswer)
      .leftJoin(
        InterviewQuestion,
        eq(UserAnswer.questionId, InterviewQuestion.id)
      )
      .leftJoin(
        MockInterview,
        eq(InterviewQuestion.interviewId, MockInterview.id)
      )
      .where(eq(MockInterview.createdBy, userId));

    // Filter by job position if specified
    const filtered = jobPosition
      ? userAnswers.filter(
          (a) =>
            a.jobPosition?.toLowerCase() === jobPosition.toLowerCase()
        )
      : userAnswers;

    // Group by interview and calculate average score
    const interviews = {};
    filtered.forEach((answer) => {
      if (!interviews[answer.interviewId]) {
        interviews[answer.interviewId] = {
          id: answer.interviewId,
          createdAt: answer.createdAt,
          scores: [],
        };
      }
      interviews[answer.interviewId].scores.push(parseInt(answer.rating) || 0);
    });

    // Calculate average score per interview
    const result = Object.values(interviews)
      .map((interview) => ({
        id: interview.id,
        createdAt: interview.createdAt,
        overallScore:
          interview.scores.length > 0
            ? (
                interview.scores.reduce((a, b) => a + b, 0) /
                interview.scores.length
              ).toFixed(1)
            : 0,
      }))
      .sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      )
      .slice(-2); // Get last 2 attempts

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching score history:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
