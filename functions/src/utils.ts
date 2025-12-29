import { GoogleGenerativeAI } from '@google/generative-ai';

// CORS headers for consistent use across the application
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function callGeminiAPI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Calling Gemini API with prompt.');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

export function generateExplanationPrompt(word: string): string {
  return `Please provide a simple definition for the English word "${word}" and one example sentence. The definition should be easy for an English learner to understand. Respond in JSON format with two keys: "definition" and "example". For example: { "definition": "...", "example": "..." }.`;
}