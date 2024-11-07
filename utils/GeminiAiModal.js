const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Start the chat session and store it
const chatSession = model.startChat({
  generationConfig,
});

// Add a method to generate content
chatSession.generateContent = async (prompt) => {
  try {
    const result = await chatSession.sendMessage(prompt);
    return result;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};

export { chatSession };
