import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { jobPosition, jobDescription, jobExperience } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const inputPrompt = `Job Position: ${jobPosition}, Description: ${jobDescription}, Experience: ${jobExperience} years. Please generate exactly 5 interview questions, each with at least 4-5 lines in the question and its corresponding answer in a JSON format. Each question should have a "Question" field and its corresponding "Answer" field. Provide the output as raw JSON.`;

  try {
    const result = await model.generateContent(inputPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Simple cleaning of markdown backticks
    const cleanJson = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
