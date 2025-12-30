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
    //const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

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

export function generateGrammarCheckPrompt(input: string, topic: string): string {
  return `You are an English grammar teacher. Please check the grammar of the following sentence and provide feedback as a JSON response.

Sentence: "${input}"
Topic: ${topic}

Please respond with a JSON object containing:
- "isCorrect": true/false (boolean indicating if the grammar is correct)
- "feedback": A constructive feedback message explaining what's correct or what needs improvement
- "suggestions": An array of specific suggestions for improvement (only if there are errors)

Be encouraging and educational in your feedback. Focus on grammar, sentence structure, and word usage appropriate for the topic: ${topic}.`;
}

export function generatePracticePhrasePrompt(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): string {
  return `Generate a practice sentence for English learners focused on the topic "${topic}". The sentence should be at ${difficulty} difficulty level.

Please respond with a JSON object containing:
- "phrase": The practice sentence
- "translation": A simple translation if the topic is in another language (or empty if English)
- "grammarFocus": The main grammar point this sentence helps practice

Make the sentence engaging and relevant to the topic: ${topic}. For ${difficulty} difficulty, use appropriate vocabulary and sentence complexity.`;
}

export function addHTMLMarkup(geminiResponse: string, userInput: string): string {
  // Add HTML markup to highlight important parts in red
  let markedUpText = geminiResponse;
  
  // Highlight important grammar terms
  const grammarTerms = [
    'subject', 'verb', 'object', 'predicate', 'noun', 'adjective', 'adverb', 
    'preposition', 'conjunction', 'pronoun', 'article', 'tense', 'mood',
    'sentence structure', 'grammar', 'syntax', 'punctuation', 'capitalization'
  ];
  
  grammarTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    markedUpText = markedUpText.replace(regex, `<span style="color: red; font-weight: bold;">${term}</span>`);
  });
  
  // Highlight suggestions and recommendations
  markedUpText = markedUpText.replace(/\b(should|could|must|recommend|suggest|consider|try|avoid)\b/gi, 
    '<span style="color: red; font-weight: bold;">$1</span>');
  
  // Highlight common mistakes
  const mistakeTerms = ['incorrect', 'wrong', 'error', 'mistake', 'problem', 'issue'];
  mistakeTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    markedUpText = markedUpText.replace(regex, `<span style="color: red; font-weight: bold;">${term}</span>`);
  });
  
  return `I analyzed your sentence: "${userInput}". Here are my thoughts: ${markedUpText}`;
}