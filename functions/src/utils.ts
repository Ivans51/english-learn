import {GoogleGenerativeAI} from '@google/generative-ai';
import {Env} from './types';

let globalEnv: Env | null = null;

export function setGlobalEnv(env: Env): void {
  globalEnv = env;
}

function getApiKeys(): { gemini: string; mistral: string; openrouter: string } {
  if (!globalEnv) {
    throw new Error('Global env not initialized. Call setGlobalEnv() first.');
  }
  return {
    gemini: globalEnv.GEMINI_API_KEY,
    mistral: globalEnv.MISTRAL_API_KEY,
    openrouter: globalEnv.OPENROUTER_API_KEY
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function callGeminiAPI(prompt: string): Promise<string | null> {
  try {
    const {gemini: apiKey} = getApiKeys();
    console.log('Calling Gemini API with prompt:');
    console.log('=== PROMPT START ===');
    console.log(prompt);
    console.log('=== PROMPT END ===');

    const genAI = new GoogleGenerativeAI(apiKey);
    let model = genAI.getGenerativeModel({model: "gemma-3-27b-it"});

    const generationConfig = {
      temperature: 1.2,
      topK: 60,
      topP: 0.98,
      maxOutputTokens: 2048,
      candidateCount: 1,
    };

    const result = await model.generateContent({
      contents: [{role: "user", parts: [{text: prompt}]}],
      generationConfig
    });
    const response = result.response;
    const responseText = response.text();

    console.log('=== GEMINI RESPONSE START ===');
    console.log(responseText);
    console.log('=== GEMINI RESPONSE END ===');

    return responseText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

export async function callOpenRouterAPI(prompt: string): Promise<string | null> {
  try {
    const {openrouter: apiKey} = getApiKeys();
    console.log('Calling OpenRouter API with prompt:');
    console.log('=== PROMPT START ===');
    console.log(prompt);
    console.log('=== PROMPT END ===');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-3-nano-30b-a3b:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const responseText = data.choices?.[0]?.message?.content;

    console.log('=== OPENROUTER RESPONSE START ===');
    console.log(responseText);
    console.log('=== OPENROUTER RESPONSE END ===');

    return responseText || null;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return null;
  }
}

export async function callMistralAPI(prompt: string): Promise<string | null> {
  try {
    const {mistral: apiKey} = getApiKeys();
    console.log('Calling Mistral API with prompt:');
    console.log('=== PROMPT START ===');
    console.log(prompt);
    console.log('=== PROMPT END ===');

    const response = await fetch("https://codestral.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "model": "codestral-latest",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const responseText = data.choices?.[0]?.message?.content;

    console.log('=== MISTRAL RESPONSE START ===');
    console.log(responseText);
    console.log('=== MISTRAL RESPONSE END ===');

    return responseText || null;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    return null;
  }
}

export function generateExplanationPrompt(word: string): string {
  return `Please provide a comprehensive explanation for the English word "${word}" for Spanish-speaking learners.
    Format the response as plain text with bold headers (no JSON). Use this structure:

**Meaning:**
• First meaning (category): brief definition
• Second meaning (category): brief definition
• Third meaning (category): brief definition

**Usage:**
Brief explanation of when/how to use this word. Include any nuances between different meanings.

**Examples:**
- "First example sentence."
  → "Spanish translation."
- "Second example sentence."
  → "Spanish translation."
- "Third example sentence."
  → "Spanish translation."

**Common Alternatives:**
• For first meaning: "Spanish equivalent" - explanation
• For second meaning: "Spanish equivalent" - explanation

Guidelines:
- List 2-4 meanings with categories in parentheses
- Provide 2-3 example sentences as a markdown list
- Always use → for Spanish translations (on a new line, indented)
- List common alternatives for each meaning
- Make definitions clear and easy for English learners to understand
- Use bold English headers: **Meaning:**, **Usage:**, **Examples:**, **Common Alternatives:**
- Use • bullet points for lists

Respond only with the formatted explanation, no JSON or code blocks.`;
}

export function generateGrammarCheckPrompt(input: string, topic: string): string {
  return `You are an English grammar teacher. Please check the grammar of the following sentence and provide feedback as a JSON response.

    Sentence: "${input}"
    Topic: ${topic}
    
    Please respond with a JSON object containing:
    - "isCorrect": true/false (boolean indicating if the grammar is correct)
    - "feedback": A constructive feedback message explaining what's correct or what needs improvement. Use **bold text** for important terms, emphasis, and key points. Structure your feedback with clear headings using ## for sections when helpful.
    - "suggestions": An array of specific suggestions for improvement (only if there are errors)
    
    Be encouraging and educational in your feedback. Use markdown formatting to make your response visually appealing:
    - Use **bold** for important grammar terms, rules, and key concepts
    - Use *italics* for subtle emphasis
    - Format suggestions as plain text items (not markdown lists) that will be numbered automatically
    - Use headings (##) for different sections of feedback when appropriate
    
    Focus on grammar, sentence structure, and word usage appropriate for the topic: ${topic}.`;
}

export function generatePracticePhrasePrompt(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): string {
  const timestamp = Date.now();
  const randomVariation = timestamp % 10000;
  const randomTopics = [
    "education", "career", "travel", "cooking", "sports", "technology", "environment", "culture", "health", "finance",
    "entertainment", "science", "art", "nature", "business", "relationships", "hobbies", "history", "food", "music"
  ];

  const randomWords = [
    "creative", "dynamic", "innovative", "exciting", "challenging", "fascinating", "interesting", "surprising", "unexpected", "unique",
    "vibrant", "colorful", "adventurous", "mysterious", "wonderful", "amazing", "brilliant", "spectacular", "extraordinary", "remarkable"
  ];

  // Pick random elements to force variation
  const randomModifier = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
  const randomSentenceStarters = [
    "Have you ever wondered", "What if I told you", "Imagine a world where", "Did you know that", "Picture this:",
    "Consider this scenario:", "Think about the time when", "Here's an interesting thought:", "Let me ask you this:", "Here's something surprising:"
  ];

  const randomStarter = randomSentenceStarters[Math.floor(Math.random() * randomSentenceStarters.length)];

  return `CRITICAL: Generate a COMPLETELY DIFFERENT practice sentence for English learners. Topic: "${topic}" at ${difficulty} difficulty.

ABSOLUTE REQUIREMENTS:
1. Create a sentence that is fundamentally different from any previous responses
2. Use completely different context, vocabulary, and structure
3. Vary the sentence type: sometimes make it a question, sometimes a statement, sometimes conditional
4. Use different tenses: present, past, future, perfect tenses
5. Change the grammar focus entirely: sometimes focus on prepositions, sometimes on verb tenses, sometimes on sentence structure

Current request ID: ${randomVariation}
Random modifier to ensure uniqueness: ${randomModifier}
Random word injection: ${randomWord}
Sentence starter pattern: ${randomStarter}

Example of what NOT to do (these are too similar):
- "In order to qualify for the scholarship..."
- "In order to get the job..."

Example of what TO do (completely different):
- "${randomStarter} ${topic} might change in the next decade?"
- "When I was younger, I never imagined that ${topic} would become so ${randomWord}."
- "If someone offered you a chance to study ${topic} abroad, would you take it?"

JSON response format:
{
  "phrase": "Your unique practice sentence here",
  "translation": "Simple translation if needed (or empty for English)",
  "grammarFocus": "Main grammar point this sentence practices"
}

Make each response completely unique and engaging. The more different from previous responses, the better! Force yourself to be creative and use completely different approaches each time.`;
}

export function generateTopicWordsPrompt(topic: string): string {
  return `You are an English vocabulary teacher. Generate 20-30 common English words related to the topic "${topic}".

    For each word, provide a comprehensive description including Spanish translation, meanings, and English examples.

    Please respond with a JSON array where each word object has this structure:
    {
      "term": "word",
      "description": "Comprehensive description with Spanish translation, meanings, and examples"
    }

    **Formatting Guidelines:**
    - **IMPORTANT**: Do NOT use **bold text** in the "term" field - just provide the plain word
    - Use **bold text** for section headers (**Traducción:**, **Meanings:**, **Examples:**)
    - Use bullet dots (•) for all lists
    - Include Spanish translation at the beginning using **Traducción:** format
    - Add line breaks between sections
    - Provide 2-4 meanings with categories in parentheses
    - Provide 2-4 example sentences in English only, with meaning category in parentheses

    **Description Format:**
    **Traducción:** [spanish translation]

    **Meanings:**
    • [first meaning] ([category])
    • [second meaning] ([category])
    • [third meaning] ([category])

    **Examples:**
    • ([category]) [English example sentence]
    • ([category]) [English example sentence]

    Example structure for topic "fruits":
    [
      {
        "term": "apple",
        "description": "**Traducción:** manzana\\n\\n**Meanings:**\\n• A round fruit with red, green, or yellow skin and crisp flesh (Food)\\n• A company that makes computers and other electronic devices (Business)\\n• To hit or strike something (Informal)\\n\\n**Examples:**\\n• (Food) I eat an apple every day for breakfast.\\n• (Business) She bought a new Apple laptop for work.\\n• (Informal) He appleed the ball against the wall."
      }
    ]

    Generate words for the topic: ${topic}

    Respond only with the JSON array, no additional text or explanations.`;
}

export function generateCategorySuggestionPrompt(term: string): string {
  return `Suggest a single, concise category name (1-2 words max) for the English word "${term}". Consider common vocabulary categories like: Business, Travel, Technology, Food, Health, Sports, Entertainment, Education, Nature, Finance, Relationships, Hobbies, etc.

Respond with ONLY the category name, no explanation, no markdown, no quotes.`;
}

export function addHTMLMarkup(geminiResponse: string, userInput: string): string {
  // Add Markdown formatting to highlight important parts
  let markedUpText = geminiResponse;

  // Format important grammar terms with **bold**
  const grammarTerms = [
    'subject', 'verb', 'object', 'predicate', 'noun', 'adjective', 'adverb',
    'preposition', 'conjunction', 'pronoun', 'article', 'tense', 'mood',
    'sentence structure', 'grammar', 'syntax', 'punctuation', 'capitalization'
  ];

  grammarTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    markedUpText = markedUpText.replace(regex, `**${term}**`);
  });

  // Format suggestions and recommendations with **bold**
  markedUpText = markedUpText.replace(/\b(should|could|must|recommend|suggest|consider|try|avoid)\b/gi,
    '**$1**');

  // Format common mistakes with emphasis
  const mistakeTerms = ['incorrect', 'wrong', 'error', 'mistake', 'problem', 'issue'];
  mistakeTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    markedUpText = markedUpText.replace(regex, `*${term}*`);
  });

  // Format the response with Markdown structure
  return `## Grammar Analysis\n\nI analyzed your sentence: "${userInput}".\n\n## Feedback\n\n${markedUpText}`;
}