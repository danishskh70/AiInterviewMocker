import { db } from "../../utils/db";
import { MockInterview, InterviewQuestion } from "../../utils/schema";
import { v4 as uuidv4 } from 'uuid';

export const createInterviewService = async (data) => {
  // 1. Insert Interview
  const [newInterview] = await db.insert(MockInterview).values({
    mockId: uuidv4(),
    jobPosition: data.jobPosition,
    jobDesc: data.jobDesc,
    jobExperience: data.jobExperience,
    interviewType: data.interviewType,
    difficulty: data.difficulty,
    mode: data.mode,
    createdBy: data.userEmail,
    createdAt: new Date().toISOString(),
  }).returning();

  return newInterview;
};

export const addQuestionsToInterview = async (interviewId, questions) => {
  const preparedQuestions = questions.map(q => ({
    interviewId,
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
    hint: q.hint,
    modelAnswer: q.modelAnswer,
    expectedKeywords: q.expectedKeywords,
  }));

  await db.insert(InterviewQuestion).values(preparedQuestions);
};
