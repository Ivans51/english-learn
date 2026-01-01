import {GoogleGenerativeAI} from '@google/generative-ai';

// CORS headers for consistent use across the application
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function callGeminiAPI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Calling Gemini API with prompt:');
    console.log('=== PROMPT START ===');
    console.log(prompt);
    console.log('=== PROMPT END ===');

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use a reliable Gemini model with fallback
    let model = genAI.getGenerativeModel({model: "gemma-3-27b-it"});

    // Enhanced generation config for maximum creativity
    const generationConfig = {
      temperature: 1.2, // Even higher temperature for more creativity
      topK: 60,         // More diversity in word choice
      topP: 0.98,       // Higher probability distribution
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

export async function callOpenRouterAPI(prompt: string, apiKey: string, siteUrl: string = 'http://localhost:3000', siteName: string = 'English Learning App'): Promise<string | null> {
  try {
    console.log('Calling OpenRouter API with prompt:');
    console.log('=== PROMPT START ===');
    console.log(prompt);
    console.log('=== PROMPT END ===');

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "kwaipilot/kat-coder-pro:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 1.2,
        "top_p": 0.98,
        "max_tokens": 2048
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

export function generateExplanationPrompt(word: string): string {
  return `Please provide multiple meanings for the English word "${word}". For each meaning, include a simple definition and an example sentence. The definitions should be easy for an English learner to understand. Format your response as JSON with two keys: "definition" and "examples". The "definition" field should contain bullet-point formatted definitions (without examples) separated by semicolons, like: "- To do something, simple definition; - To be something, simple definition; - To have something, simple definition". The "examples" field should contain bullet-point formatted example sentences that correspond to each meaning separated by semicolons, like: "- Example sentence for the first meaning; - Example sentence for the second meaning; - Example sentence for the third meaning". Provide 2-4 different meanings where applicable. For example: { "definition": "- To do something, simple definition; - To be something, simple definition", "examples": "- Example sentence for the first meaning; - Example sentence for the second meaning" }.`;
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

    For each word, provide multiple meanings and examples to help English learners understand the word thoroughly.
    
    Please respond with a JSON array where each word object has this structure:
    {
      "term": "word",
      "meanings": "Formatted string containing multiple meanings",
      "examples": "Formatted string containing multiple example sentences"
    }
    
    **Formatting Guidelines:**
    - **IMPORTANT**: Do NOT use **bold text** in the "term" field - just provide the plain word
    - Use **bold text** for important vocabulary terms and concepts in meanings and examples only
    - Provide 2-4 different meanings for each word when applicable
    - Include 2-3 example sentences per word that demonstrate different contexts
    - Make definitions clear and easy for English learners to understand
    - Focus on practical, commonly used meanings
    
    **Format Examples:**
    - Meanings: "1. First meaning with definition; 2. Second meaning with definition; 3. Third meaning with definition"
    - Examples: "1. First example sentence; 2. Second example sentence; 3. Third example sentence"
    
    Example structure for topic "fruits":
    [
      {
        "term": "apple",
        "meanings": "1. A round fruit with red, green, or yellow skin and crisp flesh; 2. A company that makes computers and other electronic devices; 3. To hit or strike something",
        "examples": "1. I eat an apple every day for breakfast.; 2. She bought a new Apple laptop for work.; 3. He apple the ball against the wall."
      }
    ]
    
    Generate words for the topic: ${topic}
    
    Respond only with the JSON array, no additional text or explanations.`;
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