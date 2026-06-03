import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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
  const { answers, jobPosition, jobExperience } = await req.json();

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
    console.log("Gemini raw output for summary:", text);
    const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err) {
    console.error("Summary Error:", err);

    // Check if it's a rate limit error
    if (err.status === 429) {
      console.log("Rate limit exceeded for summary, using fallback");
      return NextResponse.json(generateFallbackSummary(answers, jobPosition, jobExperience));
    }

    // For other errors, also use fallback
    return NextResponse.json(generateFallbackSummary(answers, jobPosition, jobExperience));
  }
}
