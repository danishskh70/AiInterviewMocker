CREATE TABLE IF NOT EXISTS "mock_interviews" (
	"mock_id" varchar(255) PRIMARY KEY NOT NULL,
	"json_response" text,
	"job_position" varchar(255),
	"job_description" text,
	"job_experience" varchar(255),
	"created_by" varchar(255),
	"created_at" varchar(255)
);
