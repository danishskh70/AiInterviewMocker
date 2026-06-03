const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  systemInstruction: `You are an expert technical interviewer with 15+ years of experience.
Your role is to provide accurate, constructive, and specific feedback on interview answers.
Focus on:
1. Technical accuracy and depth
2. Communication clarity
3. Problem-solving approach
4. Real-world applicability
Provide scores from 1-10 based on industry standards.`,
});

// Optimized generation config for better accuracy
const generationConfig = {
  temperature: 0.7, // Lower temperature for more consistent/accurate responses
  topP: 0.9, // Slightly lower for focused output
  topK: 40, // Lower K for more deterministic results
  maxOutputTokens: 8192, // Increased to prevent truncation
  responseMimeType: "application/json", // Force structured JSON output
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      // Check for 503 (Overloaded) or 429 (Rate Limit)
      const isOverloaded = err?.status === 503 || err?.message?.includes("503");
      const isRateLimited = err?.status === 429 || err?.message?.includes("429");
      
      if ((isOverloaded || isRateLimited) && i < retries - 1) {
        console.warn(`Retry ${i + 1}/${retries} after ${delay * (i + 1)}ms due to ${err.status}...`);
        await sleep(delay * (i + 1)); // 1s, 2s, 3s
      } else {
        throw err;
      }
    }
  }
};

// Start the chat session and store it
const chatSession = model.startChat({
  generationConfig,
});

// Add a method to generate content with retry logic
chatSession.generateContent = async (prompt) => {
  return retryWithBackoff(() => chatSession.sendMessage(prompt));
};

export { chatSession };
