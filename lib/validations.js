import { z } from 'zod';

export const interviewInputSchema = z.object({
  jobPosition: z.string().min(2).max(100),
  jobDesc: z.string().min(10).max(5000),
  jobExperience: z.string().min(1),
  interviewType: z.enum(['REACT', 'NODEJS', 'SQL', 'SYSTEM_DESIGN', 'JAVA', 'BEHAVIORAL', 'HR', 'FULL_STACK']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  mode: z.enum(['PRACTICE', 'EXAM', 'ADAPTIVE']),
});
