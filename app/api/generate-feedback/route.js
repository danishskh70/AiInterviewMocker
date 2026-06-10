import { chatSession } from "../../../utils/GeminiAiModal";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { question, userAnswer, modelAnswer, expectedKeywords } = await req.json();

    const feedbackPrompt = `You are a senior technical interviewer. Evaluate this interview answer.

QUESTION: ${question}
EXPECTED MODEL ANSWER: ${modelAnswer}
REQUIRED KEY CONCEPTS: ${expectedKeywords?.join(', ') || 'N/A'}
CANDIDATE'S ANSWER: "${userAnswer}"

Evaluate across: technical accuracy, completeness, clarity, depth, practical value.

OUTPUT ONLY valid JSON (no markdown):
{
  "rating": "number 1-10",
  "feedback": "specific actionable feedback, 2-3 sentences",
  "strengths": "what they did well",
  "improvements": "specific areas to improve"
}`;

    const result = await chatSession.generateContent(feedbackPrompt);
    const responseText = result.response.text();
    
    // Robust extraction
    const extractJSON = (raw) => {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON found in response');
      return raw.slice(start, end + 1);
    };

    const jsonData = JSON.parse(extractJSON(responseText));

    return NextResponse.json(jsonData);

  } catch (error) {
    console.error("Feedback generation failed:", error);

    // 503 — AI overloaded, tell frontend to retry
    if (error?.status === 503) {
      return NextResponse.json(
        { error: "AI temporarily unavailable. Please retry." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
