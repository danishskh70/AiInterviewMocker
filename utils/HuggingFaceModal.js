import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const chatSession = {
  generateContent: async (prompt) => {
    try {
      const result = await hf.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.1",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });
      return result;
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  },
};

export { chatSession };
