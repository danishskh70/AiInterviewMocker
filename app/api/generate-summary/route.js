import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
