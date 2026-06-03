import { db } from "../../utils/db";
import { UserAnswer, InterviewQuestion, MockInterview } from "../../utils/schema";
import { eq, sql } from "drizzle-orm";

export const getUserAnalytics = async (userEmail) => {
  // 1. Get all answers for user
  const userAnswers = await db
    .select({
      rating: UserAnswer.rating,
      category: InterviewQuestion.category,
      difficulty: InterviewQuestion.difficulty,
    })
    .from(UserAnswer)
    .leftJoin(InterviewQuestion, eq(UserAnswer.questionId, InterviewQuestion.id))
    .where(eq(UserAnswer.userEmail, userEmail));

  // 2. Aggregate
  const totalQuestions = userAnswers.length;
  if (totalQuestions === 0) return null;

  const totalScore = userAnswers.reduce((sum, a) => sum + (parseInt(a.rating) || 0), 0);
  
  const categoryStats = userAnswers.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = { sum: 0, count: 0 };
    acc[a.category].sum += (parseInt(a.rating) || 0);
    acc[a.category].count += 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryStats).map(([cat, stats]) => ({
    category: cat,
    avg: stats.sum / stats.count
  }));

  const strongestCategory = categories.reduce((prev, curr) => (prev.avg > curr.avg ? prev : curr)).category;
  const weakestCategory = categories.reduce((prev, curr) => (prev.avg < curr.avg ? prev : curr)).category;

  return {
    totalQuestionsAnswered: totalQuestions,
    averageScore: (totalScore / totalQuestions).toFixed(1),
    strongestCategory,
    weakestCategory,
    categoryBreakdown: categories
  };
};
