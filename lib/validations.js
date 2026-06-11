import { z } from 'zod';

export const interviewInputSchema = z.object({
  jobPosition: z.string().min(2).max(100),
  jobDesc: z.string().min(10).max(5000),
  jobExperience: z.string().min(1),
  interviewType: z.enum(['TECHNICAL', 'BEHAVIORAL', 'HR', 'MANAGERIAL']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  mode: z.enum(['PRACTICE', 'EXAM', 'ADAPTIVE']),
});
