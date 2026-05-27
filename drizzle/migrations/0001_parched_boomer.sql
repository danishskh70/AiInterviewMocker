CREATE TABLE IF NOT EXISTS "userAnswer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mock_id" varchar,
	"question" varchar NOT NULL,
	"correctAns" varchar,
	"userAns" text,
	"feedback" text,
	"rating" varchar,
	"userEmail" varchar,
	"createdAt" varchar,
	"fillerWordsCount" varchar,
	"speakingRateScore" varchar
);
