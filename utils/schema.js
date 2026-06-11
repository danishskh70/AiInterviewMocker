import { pgTable, serial, text, varchar, integer, boolean, pgEnum, json } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

export const interviewTypeEnum = pgEnum('interview_type', ['TECHNICAL', 'BEHAVIORAL', 'HR', 'MANAGERIAL']);
export const difficultyEnum = pgEnum('difficulty', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
export const interviewModeEnum = pgEnum('interview_mode', ['PRACTICE', 'EXAM', 'ADAPTIVE']);

export const MockInterview = pgTable('mock_interviews', {
    id: serial('id').primaryKey(),
    mockId: varchar('mock_id'),
    jobPosition: varchar('job_position').notNull(),
    jobDesc: text('job_description').notNull(),
    jobExperience: varchar('job_experience').notNull(),
    createdBy: varchar('created_by'),
    interviewType: interviewTypeEnum('interview_type').default('BEHAVIORAL'),
    difficulty: difficultyEnum('difficulty').default('INTERMEDIATE'),
    mode: interviewModeEnum('mode').default('PRACTICE'),
    createdAt: varchar('created_at'),
    summary: json('summary'), // NEW COLUMN
});

export const InterviewTask = pgTable('interview_tasks', {
    id: serial('id').primaryKey(),
    interviewId: integer('interview_id').references(() => MockInterview.id),
    text: text('text').notNull(),
    completed: boolean('completed').default(false),
});

export const InterviewQuestion = pgTable('interview_questions', {
    id: serial('id').primaryKey(),
    interviewId: integer('interview_id').references(() => MockInterview.id),
    question: text('question').notNull(),
    category: varchar('category'),
    difficulty: difficultyEnum('difficulty'),
    hint: text('hint'),
    modelAnswer: text('model_answer'),
    expectedKeywords: json('expected_keywords'),
});

export const UserAnswer = pgTable('user_answers', {
    id: serial('id').primaryKey(),
    questionId: integer('question_id').references(() => InterviewQuestion.id),
    userAns: text('user_ans'),
    feedback: text('feedback'),
    rating: varchar('rating'),
    hintUsed: boolean('hint_used').default(false),
    userEmail: varchar('user_email'),
});

export const UserProgress = pgTable('user_progress', {
    userId: varchar('user_id').primaryKey(),
    totalInterviews: integer('total_interviews').default(0),
    totalQuestionsAnswered: integer('total_questions_answered').default(0),
    averageScore: integer('average_score').default(0),
    strongestCategory: varchar('strongest_category'),
    weakestCategory: varchar('weakest_category'),
    averageDifficulty: difficultyEnum('average_difficulty'),
});
