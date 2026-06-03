import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatSession = {
  generateContent: async (prompt) => {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });
      // Return a structure that mimics the structure used by the API route
      return {
        response: {
          text: () => response.choices[0].message.content
        }
      };
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  },
};

export { chatSession };
