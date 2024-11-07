import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

export const MockInterview = pgTable('mock_interviews', {
    id: serial('id').primaryKey(),
    mockId: varchar('mock_id').default(uuidv4),
    jsonResponse: text('json_response').notNull(),
    jobPosition: varchar('job_position').notNull(),
    jobDesc: text('job_description').notNull(),
    jobExperience: varchar('job_experience').notNull(),
    createdBy: varchar('created_by'),
    createdAt: varchar('created_at'),
});

export const UserAnswer = pgTable('userAnswer', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mock_id').default(uuidv4),
    question: varchar('question').notNull(),
    correctAns: varchar('correctAns'),
    userAns: text('userAns'),
    feedback: text('feedback'),
    rating: varchar('rating'),
    userEmail: varchar('userEmail'),
    createdAt: varchar('createdAt')
}
)
