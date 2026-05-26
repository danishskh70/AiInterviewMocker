import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { jobPosition, jobDescription, jobExperience } = await req.json();

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.5-flash"
  });

  const inputPrompt = `Job Details:
- Position: ${jobPosition}
- Description: ${jobDescription}
- Experience Required: ${jobExperience} years

Generate exactly 5 interview questions.

Requirements per question:
- Question: 3-4 sentences, 80-120 words
- Answer: 150-200 words, practical example included
- Focus: Rotate between behavioral, technical, and system design.

Output: Valid JSON only. No markdown, no explanation.
Format:
{
  "questions": [
    {
      "question": "...",
      "answer": "...",
      "type": "behavioral|technical|system_design"
    }
  ]
}`;

  try {
    console.log("Input Prompt:", inputPrompt);
    const result = await model.generateContent(inputPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw response from Gemini:", text);

    if (!text) {
       throw new Error("Gemini returned empty text.");
    }
    
    const cleanJson = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    
    // Check if it's a valid JSON string
    try {
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json(parsed.questions || parsed);
    } catch (e) {
        console.error("Failed to parse JSON. Raw text:", cleanJson);
        return NextResponse.json({ error: "Invalid JSON format from AI", details: cleanJson }, { status: 500 });
    }
  } catch (error) {
    console.error("DETAILED AI Generation Error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: "Failed to generate questions", details: error.message }, { status: 500 });
  }
}
