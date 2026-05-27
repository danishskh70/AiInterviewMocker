import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { question, userAnswer, idealAnswer } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

  const feedbackPrompt = `You are a senior technical interviewer with 10+ years experience. Give honest, mentor-style feedback.

Question: ${question}
Ideal Answer (reference only): ${idealAnswer}
Candidate's Answer: ${userAnswer}

Evaluate by comparing candidate answer against ideal answer.

Feedback string rules:
- Use "you/your" — talk to candidate directly
- Sentence 1: one genuine strength
- Sentence 2: biggest gap vs ideal answer (be specific, not generic)
- Sentence 3: one actionable fix for next time
- Max 3 sentences. No bullets inside string.

Scoring rules:
- rating (1-10): accuracy + depth + relevance vs ideal answer
- speakingRateScore (1-10): fluency, coherence, penalize rambling/incomplete thoughts
- fillerWordsCount: exact count of (um, uh, ah, like, you know, so, basically, right) in candidate answer

Output raw JSON only:
{"rating": number, "feedback": string, "fillerWordsCount": number, "speakingRateScore": number}`;

  try {
    const result = await model.generateContent(feedbackPrompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
