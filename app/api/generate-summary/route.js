import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { MockInterview, InterviewTask } from "@/utils/schema";
import { eq } from "drizzle-orm";

const generateFallbackSummary = (answers = [], jobPosition = "Software Engineer", jobExperience = "2") => {
  const avgRating = answers.length > 0
    ? (answers.reduce((sum, a) => sum + (parseInt(a.rating) || 0), 0) / answers.length).toFixed(1)
    : 0;

  return {
    overall_verdict: "Your interview responses have been recorded. Review the detailed feedback for each question to identify areas for improvement.",
    strengths: [
      "Completed all interview questions",
      "Provided thoughtful responses to interview topics",
    ],
    gaps: [
      "Review technical concepts from the feedback provided",
      "Work on answering questions more concisely",
    ],
    improvement_plan: [
      "Review the detailed feedback for each question",
      `Practice explaining concepts clearly in ${jobExperience} years of experience context`,
      "Focus on articulating key technical concepts more confidently",
    ],
    overall_score: Math.min(10, Math.max(1, (avgRating || 5))),
    hire_confidence: Math.min(10, Math.max(1, (avgRating || 5))),
  };
};

export async function POST(req) {
  const { interviewId, answers, jobPosition, jobExperience } = await req.json();

  // 1. Check if summary already exists
  const [existing] = await db
    .select({ summary: MockInterview.summary })
    .from(MockInterview)
    .where(eq(MockInterview.mockId, interviewId));

  if (existing?.summary) {
    return NextResponse.json(existing.summary);
  }

  // 2. If not, generate
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

  const answerBlock = answers.map((a, i) =>
    `Q${i + 1} [${a.type ?? 'general'}]: ${a.question}
    Candidate: ${a.userAns}
    Rating: ${a.rating}/10`
  ).join("\n\n");

  const summaryPrompt = `You are a senior ${jobPosition} interviewer. You just finished interviewing a candidate with ${jobExperience} years experience.

Here are all their answers with ratings:

${answerBlock}

Write a complete interview debrief. Output raw JSON only, no markdown.

Rules:
- overall_verdict: one blunt sentence — hire / maybe / no hire and why
- strengths: array of 2-3 specific strengths you actually saw in answers (not generic)
- gaps: array of 2-3 specific weak areas with exact question reference (e.g. "In Q3, you missed...")
- improvement_plan: array of 3 concrete actions candidate should do before next interview (specific resources or practice types)
- overall_score: weighted average you would give as interviewer (not just math average)
- hire_confidence: number 1-10

Output:
{
  "overall_verdict": "string",
  "strengths": ["string", "string"],
  "gaps": ["string", "string"],
  "improvement_plan": ["string", "string", "string"],
  "overall_score": number,
  "hire_confidence": number
}`;

  try {
    const result = await model.generateContent(summaryPrompt);
    const text = result.response.text();
    const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const summaryData = JSON.parse(clean);

    // 3. Save summary
    await db.update(MockInterview)
      .set({ summary: summaryData })
      .where(eq(MockInterview.mockId, interviewId));

    // 4. Save tasks
    if (summaryData.improvement_plan?.length > 0) {
      // Fetch ID first (await is fine here)
      const rows = await db.select({ id: MockInterview.id }).from(MockInterview).where(eq(MockInterview.mockId, interviewId));
      const interviewRow = rows[0];
      
      if (interviewRow) {
        // Map *synchronously* to an array of objects
        const tasksToInsert = summaryData.improvement_plan.map(text => ({
          interviewId: interviewRow.id,
          text
        }));
        
        // Insert in one go
        await db.insert(InterviewTask).values(tasksToInsert);
      }
    }

    return NextResponse.json(summaryData);
  } catch (err) {
    console.error("Summary Error:", err);
    return NextResponse.json(
        { error: "Failed to generate summary", details: err.message, ...generateFallbackSummary(answers, jobPosition, jobExperience), isFallback: true },
        { status: 500 }
    );
  }
}
