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
    
    Return ONLY a valid JSON object with the following structure. No markdown formatting. IMPORTANT: Ensure each JSON object has only ONE unique key for "question". Do not duplicate keys.
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
    
    // Robust extraction: find first { and last }
    const extractJSON = (raw) => {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON found in response');
      return raw.slice(start, end + 1);
    };

    const jsonResponse = JSON.parse(extractJSON(responseText));

    // Hardened Validation: Drop malformed or suspicious questions
    const validatedQuestions = jsonResponse.questions.filter((q) => {
      const isMalformed = 
        q.question === q.modelAnswer || 
        (q.question?.trim().length < 15) || 
        !q.question || 
        !q.modelAnswer;
      
      if (isMalformed) {
        console.warn("Discarding malformed question:", q);
        return false;
      }
      return true;
    });

    if (validatedQuestions.length === 0) throw new Error("All generated questions were malformed");
    
    // Log if we have fewer than requested
    if (validatedQuestions.length < 5) {
      console.warn(`Warning: Only generated ${validatedQuestions.length} valid questions.`);
    }

    console.log(`JSON parsed and validated successfully. Count: ${validatedQuestions.length}`);

    // Persist to DB using service
    console.log("Persisting to DB...");
    const interview = await createInterviewService({ ...validatedData, userEmail: body.userEmail });
    console.log("Interview created:", interview.id);
    
    await addQuestionsToInterview(interview.id, validatedQuestions);
    console.log("Questions persisted");

    return NextResponse.json({ 
      interviewId: interview.mockId,
      questionCount: validatedQuestions.length 
    });
  } catch (error) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json({ error: "Failed to generate interview", details: error.message }, { status: 500 });
  }
}
