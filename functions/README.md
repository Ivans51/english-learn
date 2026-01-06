# English Learn Backend

Serverless API backend for the English Learn application, built with Cloudflare Workers, TypeScript, and AI-powered features.

## Overview

This backend provides a RESTful API for vocabulary management, grammar checking, and AI-assisted learning features. It integrates with Firebase Realtime Database for data persistence and Google Gemini/OpenRouter APIs for AI capabilities.

## Project Structure

```
functions/
├── src/
│   ├── index.ts         # Cloudflare Worker entry point
│   ├── router.ts        # API routing configuration
│   ├── handlers.ts      # Request handlers for all endpoints
│   ├── database.ts      # Firebase Realtime Database operations
│   ├── types.ts         # TypeScript interfaces and types
│   ├── utils.ts         # AI service integration, prompts, helpers
│   └── errors.ts        # Error response helpers
├── .dev.vars.example    # Environment variables template
├── wrangler.toml        # Cloudflare Workers configuration
└── package.json
```

## Technology Stack

- **Runtime**: Cloudflare Workers (serverless)
- **Language**: TypeScript (strict mode)
- **Database**: Firebase Realtime Database
- **AI Services**: Google Gemini API, OpenRouter API
- **Deployment**: Wrangler CLI

## API Endpoints

### Vocabulary Words

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vocabulary-words` | Create a new vocabulary word |
| GET | `/api/vocabulary-words` | Get all vocabulary words for a user |
| PUT | `/api/vocabulary-words/:uid` | Update a vocabulary word |
| DELETE | `/api/vocabulary-words/:uid` | Delete a vocabulary word |

**Query Parameters (GET)**: `userId` - User identifier (defaults to 'anonymous')

**Request Body (POST)**:
```typescript
{
  term: string;
  meanings: string;
  examples: string;
  categoryName: string;
  userId?: string;
}
```

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/categories` | Create a new category |
| PUT | `/api/categories/:id` | Update a category name |
| DELETE | `/api/categories/:id` | Delete a category (cascades to vocabulary words) |

**Request Body (POST)**:
```typescript
{
  name: string;
  userId?: string;
}
```

### Topics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/topics` | Create a new topic |
| GET | `/api/topics` | Get all topics for a user |
| PUT | `/api/topics/:id` | Update a topic |
| DELETE | `/api/topics/:id` | Delete a topic |

**Query Parameters (GET)**: `userId` - User identifier (defaults to 'anonymous')

**Request Body (POST)**:
```typescript
{
  title: string;
  userId?: string;
}
```

### AI-Powered Features

| Method | Endpoint | Description | AI Provider |
|--------|----------|-------------|-------------|
| POST | `/api/explain` | Get word explanations with examples | Google Gemini |
| POST | `/api/grammar-check` | Check grammar and provide feedback | OpenRouter |
| POST | `/api/practice-phrase` | Generate practice sentences | OpenRouter |
| POST | `/api/create-topic-words` | Generate vocabulary for a topic | Google Gemini |

**Explain Request**:
```typescript
{
  word: string;
}
```

**Grammar Check Request**:
```typescript
{
  input: string;  // Sentence to check
  topic: string;  // Grammar topic context
  userId?: string;
}
```

**Practice Phrase Request**:
```typescript
{
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId?: string;
}
```

**Create Topic Words Request**:
```typescript
{
  topic: string;       // Topic to generate words for
  categoryName: string;
  userId?: string;
}
```

## Core Modules

### handlers.ts

Request handlers for all API endpoints. Each handler:

1. Validates request body and parameters
2. Calls appropriate database or AI service functions
3. Returns standardized success or error responses
4. Includes CORS headers in all responses

**Key handlers:**
- `handleExplainWordRequest` - Generates word explanations using Gemini
- `handleGrammarCheck` - Analyzes grammar using OpenRouter AI
- `handleGeneratePracticePhrase` - Creates practice sentences
- `handleCreateTopicWords` - Batch creates vocabulary from a topic
- CRUD handlers for vocabulary, categories, and topics

### database.ts

Firebase Realtime Database operations with user-scoped data access.

**Vocabulary Operations:**
- `storeVocabularyWord` - Save new word with auto-generated UID
- `getVocabularyWords` - Retrieve all words for a user
- `updateVocabularyWord` - Modify existing word
- `deleteVocabularyWord` - Remove word by UID

**Category Operations:**
- `storeCategory` - Save category with custom ID
- `getCategories` - Retrieve all categories
- `updateCategory` - Modify category
- `deleteCategory` - Remove category
- `findOrCreateCategory` - Get existing or create new category

**Topic Operations:**
- `storeTopic` - Save topic with auto-generated ID
- `getTopics` - Retrieve all topics
- `updateTopic` - Modify topic
- `deleteTopic` - Remove topic

All operations default to 'anonymous' user when no userId is provided.

### utils.ts

Utility functions including AI service integration and prompt generation.

**AI Service Functions:**
- `callGeminiAPI` - Calls Google Gemini API with prompts
- `callOpenRouterAPI` - Calls OpenRouter API for grammar checking

**Prompt Generation:**
- `generateExplanationPrompt(word)` - Creates structured prompt for word explanations
- `generateGrammarCheckPrompt(input, topic)` - Creates grammar analysis prompt
- `generatePracticePhrasePrompt(topic, difficulty)` - Creates practice sentence prompt
- `generateTopicWordsPrompt(topic)` - Creates vocabulary generation prompt

**Helper Functions:**
- `corsHeaders` - Standard CORS configuration
- `addHTMLMarkup(text, input)` - Adds markdown formatting to AI responses

### types.ts

TypeScript interfaces defining all data structures.

**Data Models:**
```typescript
interface VocabularyWord {
  term: string;
  categoryId: string;
  categoryName: string;
  meanings: string;
  examples: string;
  status?: 'pending' | 'completed';
}

interface Category {
  name: string;
}

interface Topic {
  title: string;
  createdAt: string;
}
```

**Request Types:**
- `CreateVocabularyWordRequest`
- `ExplainRequest`
- `GrammarCheckRequest`
- `PracticePhraseRequest`
- `CreateTopicWordsRequest`

### errors.ts

Standardized error handling utilities.

**Error Response Factory:**
```typescript
createErrorResponse(error: string, status: number, corsHeaders)
```

**Common Error Responses:**
- `badRequest(message)` - 400
- `notFound(message)` - 404
- `internalServerError(message)` - 500
- `invalidRequestBody` - 400
- `missingRequiredField(field)` - 400

**Success Responses:**
- `created(data)` - 201
- `ok(data)` - 200

**Validation:**
- `validateRequiredFields(body, requiredFields, corsHeaders)` - Validates request body

## AI Integration

### Google Gemini API

Used for word explanations and vocabulary generation.

**Model**: `gemma-3-27b-it`

**Configuration**:
- Temperature: 1.2 (high creativity)
- TopK: 60
- TopP: 0.98
- Max Output Tokens: 2048

**Use Cases**:
1. Word explanations with multiple meanings and examples
2. Batch vocabulary generation from topics

### OpenRouter API

Used for grammar checking and practice phrase generation.

**Model**: `kwaipilot/kat-coder-pro:free`

**Configuration**:
- Temperature: 1.2
- TopP: 0.98
- Max Tokens: 2048

**Use Cases**:
1. Grammar analysis with feedback
2. Practice sentence generation with varied difficulty levels

### Prompt Engineering

Prompts are designed to:
- Return structured JSON responses
- Include markdown formatting for readability
- Provide educational, encouraging feedback
- Support multiple difficulty levels

## Environment Setup

### Prerequisites

- Node.js 18+
- pnpm (for monorepo management)
- Cloudflare account
- Firebase project with Realtime Database enabled
- Google Gemini API key
- OpenRouter API key

### Local Development

1. Navigate to functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment template:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

4. Configure environment variables in `.dev.vars`:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   GEMINI_API_KEY=your-gemini-key
   OPENROUTER_API_KEY=your-openrouter-key
   ```

### Environment Secrets

For production, use Wrangler secrets instead of `.dev.vars`:

```bash
# Development environment
npx wrangler secret put GEMINI_API_KEY --env development
npx wrangler secret put OPENROUTER_API_KEY --env development
npx wrangler secret put FIREBASE_PROJECT_ID --env development
npx wrangler secret put FIREBASE_DATABASE_URL --env development
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY --env development

# Production environment
npx wrangler secret put GEMINI_API_KEY --env production
# ... repeat for other secrets
```

## Development Commands

```bash
# Start development server (port 8787)
pnpm run dev

# Deploy to Cloudflare Workers
pnpm run deploy

# Deploy to specific environment
pnpm run deploy --env production
```

### Wrangler Commands

```bash
# Start dev server with live reload
npx wrangler dev

# Deploy to production
npx wrangler deploy

# View deployed workers
npx wrangler tail

# Check configuration
npx wrangler validate
```

## Firebase Database Structure

Data is organized by user ID for isolation:

```
firebase-project/
├── vocabulary/
│   └── {userId}/
│       ├── word_uid_123...: {VocabularyWord}
│       └── word_uid_456...: {VocabularyWord}
├── categories/
│   └── {userId}/
│       ├── cat_123...: {Category}
│       └── cat_456...: {Category}
└── topics/
    └── {userId}/
        ├── topic_123...: {Topic}
        └── topic_456...: {Topic}
```

## Error Handling Patterns

All handlers follow a consistent pattern:

1. **Try-Catch Block**: Wrap async operations
2. **Validation**: Check required fields before processing
3. **User-Friendly Errors**: Return descriptive error messages
4. **Logging**: Log errors with context for debugging
5. **CORS Headers**: Always include CORS in responses

Example handler structure:
```typescript
export async function handlerName(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate required fields
    const validationError = validateRequiredFields(body, ['field1', 'field2'], corsHeaders);
    if (validationError) return validationError;

    // 3. Process request (database or AI)
    const result = await processData(env, body);

    // 4. Return success response
    return SuccessResponses.ok(result, corsHeaders);

  } catch (error) {
    // 5. Log and return error
    logError('handlerName', error);
    return ErrorResponses.internalServerError('Message', corsHeaders);
  }
}
```

## CORS Configuration

All responses include CORS headers for cross-origin requests:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

OPTIONS requests receive a 200 response with CORS headers for preflight handling.

## Adding New Endpoints

1. **Define Types** (types.ts): Add request/response interfaces
2. **Add Database Functions** (database.ts): Add CRUD operations
3. **Create Handler** (handlers.ts): Implement request handling logic
4. **Add Route** (router.ts): Register endpoint in the routing table
5. **Test**: Verify with development server

## Troubleshooting

### Common Issues

**CORS Errors**:
- Ensure CORS headers are included in all responses
- Handle OPTIONS preflight requests in index.ts

**Firebase Errors**:
- Verify FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON
- Ensure Firebase Realtime Database rules allow write access

**AI API Errors**:
- Check API keys are correctly set
- Review rate limits for Gemini/OpenRouter APIs

### Debug Mode

Enable detailed logging by checking console output in Wrangler terminal. All AI prompts and responses are logged for debugging.

## Deployment

### Production Checklist

1. Set all secrets using `wrangler secret put`
2. Test all endpoints locally with `pnpm run dev`
3. Verify Firebase security rules
4. Deploy with `pnpm run deploy`

### Monitoring

Check Cloudflare Workers dashboard for:
- Function logs
- Invocation metrics
- Error tracking
