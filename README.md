# English Learn

A full-stack application for learning English with Vue.js frontend and Cloudflare Workers backend.

## Project Structure

```
english-learn/
├── frontend/          # Vue.js frontend with Tailwind CSS
├── functions/         # Cloudflare Workers API functions
└── package.json       # Root monorepo configuration
```

## Development

### Prerequisites

- Node.js (>= 20.19.0 or >= 22.12.0)
- npm

### Getting Started

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

   This will start:
   - Vue.js frontend at http://localhost:5173
   - Cloudflare Workers at http://localhost:8787

### Scripts

- `npm run dev` - Start both frontend and backend development servers
- `npm run dev:frontend` - Start only the Vue.js frontend
- `npm run dev:functions` - Start only the Cloudflare Workers
- `npm run build` - Build both projects for production
- `npm run install:all` - Install dependencies for all projects

## Frontend

The frontend is built with:
- Vue.js 3 with TypeScript
- Vite for development and building
- Vue Router for navigation
- Tailwind CSS for styling

## Backend

The backend uses:
- Cloudflare Workers for serverless functions
- Firebase Realtime Database for chat history storage
- TypeScript for type safety
- Wrangler for deployment

## API Endpoints

### Chat API (Gemini AI Integration)
- `POST /api/chat` - Send a message and get AI response
- `GET /api/chat/history?topicId=X&userId=Y` - Get chat history for a topic and user
- `DELETE /api/chat/clear` - Clear chat history for a specific topic and user

### Utility
- `GET /api/hello` - Test endpoint that returns a greeting message

## Gemini AI Integration

This application includes Google Gemini AI integration for conversational practice. The AI provides contextual responses based on the learning topic and maintains conversation history using Firebase Realtime Database.

### Setup

1. **Get Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Configure Firebase**: Set up Firebase Realtime Database and authentication
3. **Configure Backend**: Set environment variables for Firebase and Gemini
4. **Environment Variables**: Configure frontend API URL

See `FIREBASE_SETUP.md` for detailed setup instructions.

### Features

- **Contextual AI Responses**: AI adapts responses based on the learning topic
- **Chat History Persistence**: Conversations stored in Firebase Realtime Database
- **Real-time Capabilities**: Ready for real-time chat updates
- **Error Handling**: Graceful fallback when AI service is unavailable
- **User-Friendly Interface**: Clear history, typing indicators, and message timestamps

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).
