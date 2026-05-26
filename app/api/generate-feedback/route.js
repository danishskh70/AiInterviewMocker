import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { question, userAnswer } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const feedbackPrompt = `Question: ${question}, User answer: ${userAnswer}. Based on the question and user answer, provide a rating (1-10) and feedback for improvement. Output as raw JSON only, with "rating" (number) and "feedback" (string) fields. No markdown or extra text.`;

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
