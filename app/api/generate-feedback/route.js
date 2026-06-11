import { chatSession } from "../../../utils/GeminiAiModal";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { question, userAnswer, modelAnswer, expectedKeywords } = await req.json();

    const feedbackPrompt = `You are a senior technical interviewer.

MODEL ANSWER (reference only — extract core concepts from this, do not require word-for-word match):
${modelAnswer}

REQUIRED CONCEPTS (candidate must cover these):
${expectedKeywords?.join(', ') || 'N/A'}

CANDIDATE ANSWER:
"${userAnswer}"

EVALUATION STEPS:
1. Extract 3-5 core concepts from the model answer. Extract concepts at the STEP level. Credit implicit prerequisites: if a candidate describes step N, and step N is impossible without step N-1, credit step N-1 unless the candidate explicitly shows they don't know it exists.
2. Check which core concepts the candidate covered — accept any valid explanation, not just the model's wording. Treat synonymous technical terms as equivalent.
3. Check coverage of required concepts.
4. Apply the RUBRIC and PENALTY CALIBRATION:
   - 1-3: Missed core concepts or factually wrong.
   - 4-6: Covered some concepts, missing depth or minor points.
   - 7-8: Solid, accurate, and professional (covered all core concepts).
   - 9-10: Exceptional, covered all concepts + added valid depth/examples.

PENALTY GUIDELINES:
   - Terminology gap (missing algorithm name, missing formal term): -1 point max. Do not deduct more than 1 point for terminology alone.
   - Concept gap (missing a required step, wrong complexity): -2 to -3 points.
   - Wrong information: -2 to -3 points.
   - Incomplete algorithm (missing a required step): -3 to -4 points.
   - OVERRIDE EXCEPTION: If the candidate's answer is functionally complete despite different ordering or phrasing, do not apply the major deduction for "missing step". The override only applies when a REQUIRED step produces no output without it.
   - IMPORTANT: For algorithm questions: candidate must explain EVERY step including data structure initialization. Missing a required step is a major deduction regardless of whether later steps are correct.
   - Do not compound penalties for the same missing concept.

OUTPUT ONLY valid JSON:
{
  "reasoning": "which concepts were covered, which were missed, and justification for the final score based on penalty guidelines.",
  "coreConcepts": ["concept1", "concept2"],
  "coveredConcepts": ["concept1"],
  "rating": 7,
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
    
    // Ensure rating is an integer
    jsonData.rating = parseInt(jsonData.rating, 10);

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
