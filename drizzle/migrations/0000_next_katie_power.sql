CREATE TABLE IF NOT EXISTS "mock_interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"mock_id" varchar,
	"json_response" text NOT NULL,
	"job_position" varchar NOT NULL,
	"job_description" text NOT NULL,
	"job_experience" varchar NOT NULL,
	"created_by" varchar,
	"created_at" varchar
);
