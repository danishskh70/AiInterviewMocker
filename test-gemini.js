require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
model.generateContent("Say hello").then(r => console.log("SUCCESS:", r.response.text())).catch(e => console.error("FAIL:", e.message));
