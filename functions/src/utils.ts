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
  return `Please provide multiple meanings for the English word "${word}". For each meaning, include a simple definition and an example sentence. The definitions should be easy for an English learner to understand. Format your response as JSON with two keys: "definition" and "examples". The "definition" field should contain bullet-point formatted definitions (without examples) separated by semicolons, like: "- To do something, simple definition; - To be something, simple definition; - To have something, simple definition". The "examples" field should contain bullet-point formatted example sentences that correspond to each meaning separated by semicolons, like: "- Example sentence for the first meaning; - Example sentence for the second meaning; - Example sentence for the third meaning". Provide 2-4 different meanings where applicable. For example: { "definition": "- To do something, simple definition; - To be something, simple definition", "examples": "- Example sentence for the first meaning; - Example sentence for the second meaning" }.`;
}