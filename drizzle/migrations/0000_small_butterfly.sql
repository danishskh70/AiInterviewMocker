DO $$ BEGIN
    CREATE TYPE "public"."difficulty" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."interview_mode" AS ENUM('PRACTICE', 'EXAM', 'ADAPTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."interview_type" AS ENUM('REACT', 'NODEJS', 'SQL', 'SYSTEM_DESIGN', 'JAVA', 'BEHAVIORAL', 'HR', 'FULL_STACK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" integer,
	"question" text NOT NULL,
	"category" varchar,
	"difficulty" "difficulty",
	"hint" text,
	"model_answer" text,
	"expected_keywords" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"mock_id" varchar,
	"job_position" varchar NOT NULL,
	"job_description" text NOT NULL,
	"job_experience" varchar NOT NULL,
	"created_by" varchar,
	"interview_type" "interview_type" DEFAULT 'BEHAVIORAL',
	"difficulty" "difficulty" DEFAULT 'INTERMEDIATE',
	"mode" "interview_mode" DEFAULT 'PRACTICE',
	"created_at" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer,
	"user_ans" text,
	"feedback" text,
	"rating" varchar,
	"hint_used" boolean DEFAULT false,
	"user_email" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"total_interviews" integer DEFAULT 0,
	"total_questions_answered" integer DEFAULT 0,
	"average_score" integer DEFAULT 0,
	"strongest_category" varchar,
	"weakest_category" varchar,
	"average_difficulty" "difficulty"
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_interview_id_mock_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."mock_interviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
