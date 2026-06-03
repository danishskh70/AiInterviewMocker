import { NextResponse } from "next/server";
import { chatSession } from "@/utils/GeminiAiModal";
import { interviewInputSchema } from "../../../lib/validations";
import { createInterviewService, addQuestionsToInterview } from "../../../lib/services/interviewService";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("API Body received:", body);
    
    const validatedData = interviewInputSchema.parse(body);
    console.log("Validated Data:", validatedData);

    const prompt = `Generate 5 high-quality interview questions for a ${validatedData.jobPosition} role.
    Role Description: ${validatedData.jobDesc}
    Experience: ${validatedData.jobExperience}
    Difficulty: ${validatedData.difficulty}
    Interview Type: ${validatedData.interviewType}
    
    Return ONLY a valid JSON object with the following structure. No markdown formatting:
    {
      "questions": [{
        "question": "string",
        "category": "string",
        "difficulty": "${validatedData.difficulty}",
        "hint": "string",
        "modelAnswer": "string",
        "expectedKeywords": ["string", "string"]
      }]
    }`;

    console.log("Prompt generated, calling Gemini...");
    const result = await chatSession.generateContent(prompt);
    const responseText = result.response.text();
    console.log("Gemini Response:", responseText);
    
    const cleanJson = responseText.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(cleanJson);
    console.log("JSON parsed successfully");

    // Persist to DB using service
    console.log("Persisting to DB...");
    const interview = await createInterviewService({ ...validatedData, userEmail: body.userEmail });
    console.log("Interview created:", interview.id);
    
    await addQuestionsToInterview(interview.id, jsonResponse.questions);
    console.log("Questions persisted");

    return NextResponse.json({ interviewId: interview.mockId });
  } catch (error) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json({ error: "Failed to generate interview", details: error.message }, { status: 500 });
  }
}
