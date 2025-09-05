# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

English Learn is a full-stack application for learning English with Vue.js frontend and Cloudflare Workers backend. The application features AI-powered conversational practice using Google Gemini API with persistent chat history stored in Firebase Realtime Database.

## Development Commands

### Essential Setup
```bash
# Install all dependencies (root, frontend, functions)
npm run install:all

# Start both frontend and backend development servers
npm run dev

# Start only frontend (Vue.js on port 5173)
npm run dev:frontend

# Start only backend (Cloudflare Workers on port 8787)
npm run dev:functions
```

### Building and Deployment
```bash
# Build both projects for production
npm run build

# Build only frontend
npm run build:frontend

# Deploy functions to Cloudflare Workers
npm run build:functions
# or alternatively:
cd functions && npm run deploy
```

### Testing and Quality
```bash
# Lint frontend code
cd frontend && npm run lint

# Type checking for frontend
cd frontend && npm run type-check

# Development server for functions
cd functions && npm run dev
```

### Single Test Commands
Since this is primarily a frontend application with minimal backend logic, testing is primarily manual:
- Test API endpoints using examples in `TEST_API.md`
- Test frontend functionality through browser interaction
- Use Wrangler dev for local backend testing

## Architecture Overview

### Monorepo Structure
- **Root**: Orchestrates the monorepo with workspace configuration
- **Frontend** (`/frontend`): Vue.js 3 + TypeScript + Tailwind CSS application
- **Functions** (`/functions`): Cloudflare Workers backend with TypeScript

### Key Architectural Patterns

#### Frontend Architecture (Vue.js SPA)
- **Component-based**: Modular Vue components with TypeScript
- **Composables**: Reusable logic in `src/composables/` (auth, theme)
- **Services**: Centralized API communication in `src/services/chatService.ts`
- **Router**: Vue Router with Firebase auth guards protecting routes
- **State Management**: Composables pattern instead of Vuex/Pinia

#### Backend Architecture (Cloudflare Workers)
- **Single Entry Point**: `functions/src/index.ts` handles all API routes
- **RESTful APIs**: `/api/chat`, `/api/chat/history`, `/api/chat/clear`, `/api/explain`
- **External Integrations**: Google Gemini AI API and Firebase Realtime Database
- **Environment-based Configuration**: Development and production environments via Wrangler

#### Data Flow Architecture
1. User interaction → Vue component
2. Component → ChatService
3. ChatService → Cloudflare Worker API
4. Worker → Gemini AI API for responses
5. Worker → Firebase for persistence
6. Response flow reverses back to UI

### Critical Dependencies

#### Frontend Core Stack
- **Vue 3.5+** with Composition API
- **TypeScript 5.8+** for type safety
- **Vite 7.0+** as build tool and dev server
- **Vue Router 4.5+** for SPA navigation
- **Tailwind CSS 4.1+** for styling (using new CSS-first approach)

#### Backend Core Stack
- **Cloudflare Workers** runtime environment
- **Wrangler 3.0+** for local development and deployment
- **@google/generative-ai** for Gemini API integration
- **Firebase Realtime Database** for chat history persistence

#### Authentication & Data
- **Firebase Auth** for user authentication
- **Firebase Realtime Database** for real-time chat history
- **Environment Variables** for API keys and configuration

## Environment Configuration

### Required Environment Variables

#### Backend (Cloudflare Workers Secrets)
Set these using `wrangler secret put` commands:
- `GEMINI_API_KEY` - Google AI Studio API key for Gemini
- `FIREBASE_PROJECT_ID` - Firebase project identifier
- `FIREBASE_DATABASE_URL` - Firebase Realtime Database URL
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase authentication JSON (stringified)

#### Frontend (.env files)
- `VITE_API_URL` - Backend API URL (defaults to localhost:8787 in development)
- Firebase configuration variables (see `.env.example`)

### Environment Setup Commands
```bash
# Backend secrets (run in functions/ directory)
wrangler secret put GEMINI_API_KEY --env development
wrangler secret put FIREBASE_PROJECT_ID --env development
wrangler secret put FIREBASE_DATABASE_URL --env development
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY --env development

# Frontend environment (copy and modify)
cp frontend/.env.example frontend/.env
```

## Key Features & Components

### AI Chat System
- **Contextual Responses**: AI adapts to specific learning topics
- **Persistent History**: Chat conversations stored in Firebase
- **Real-time Capable**: Architecture ready for live updates
- **Word Explanations**: AI-powered word definitions via tooltip interactions

### Authentication Flow
- **Protected Routes**: Most learning features require authentication
- **Firebase Auth Integration**: User management through Firebase
- **Router Guards**: Automatic redirects based on auth state
- **Session Persistence**: Auth state maintained across browser sessions

### Learning Interface
- **Topic-based Navigation**: Different conversation topics for learning
- **Level Progression**: Structured learning paths
- **Interactive Elements**: Word tooltips, definitions, and contextual help
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Development Workflow

### Working with the Frontend
1. Component development in `frontend/src/components/`
2. Views for major pages in `frontend/src/views/`
3. Reusable logic in `frontend/src/composables/`
4. API integration through `frontend/src/services/`
5. Router configuration in `frontend/src/router/index.ts`

### Working with the Backend
1. All API logic in `functions/src/index.ts`
2. Environment configuration in `functions/wrangler.toml`
3. Local testing with `wrangler dev`
4. Deployment with `wrangler deploy`

### Database Operations
- **Chat History**: Stored at `/chatHistory/{userId}/{topicId}`
- **Message Structure**: Arrays of ChatMessage objects with timestamps
- **Retention**: Automatically manages last 50 messages per conversation
- **User Scoping**: Currently uses "anonymous" but ready for real user IDs

### API Integration Patterns
- **Type Safety**: TypeScript interfaces for all API requests/responses
- **Error Handling**: Consistent error patterns with user-friendly messages
- **Service Layer**: Centralized API calls in ChatService class
- **Environment Awareness**: Dynamic API URLs based on environment

## Firebase Integration Details

### Database Structure
```
/chatHistory/{userId}/{topicId}: ChatMessage[]
```

### Authentication
- Uses Firebase service account key for server-side access
- Ready for Firebase Auth SDK integration on frontend
- Database rules configured for controlled access

### Real-time Capabilities
- Architecture supports Firebase listeners for live updates
- Currently using REST API, but ready for WebSocket upgrade
- Offline support potential through Firebase SDK

## Migration Notes

### From Cloudflare KV to Firebase
- Previous versions used Cloudflare KV for storage
- Migrated to Firebase for real-time capabilities and better data structure
- Environment variables changed from KV bindings to Firebase configuration
- Enhanced scalability and integration possibilities

### Node.js Version Requirements
- Frontend requires Node.js 20.19.0+ or 22.12.0+
- Ensure npm workspaces support is available
- Use `.nvmrc` or similar for consistent node versions across team

## Troubleshooting Common Issues

### Development Server Issues
- If ports are occupied, check `frontend/vite.config.ts` and `functions/wrangler.toml`
- CORS issues: Ensure proper origin configuration in Worker
- API connection failures: Verify `VITE_API_URL` in frontend environment

### Authentication Problems
- Firebase configuration missing: Check `.env` files
- Auth guards blocking: Verify Firebase Auth is properly initialized
- Token expiration: Firebase SDK handles token refresh automatically

### AI Integration Issues
- Gemini API key problems: Verify `wrangler secret put` was successful
- Rate limiting: Implement exponential backoff in ChatService
- Context loss: Check Firebase connection and chat history persistence

### Build and Deployment
- TypeScript errors: Run type checking on both frontend and backend
- Missing environment variables: Use `wrangler.toml` for configuration
- Deployment failures: Check Cloudflare account configuration

## Documentation References

- `README.md` - Basic setup and project overview  
- `IMPLEMENTATION_SUMMARY.md` - Detailed technical implementation details
- `FIREBASE_SETUP.md` - Complete Firebase configuration guide
- `TEST_API.md` - API testing procedures and examples
- `GEMINI.md` - Gemini AI integration specifics
- `CHAT_FEATURE.md` - Chat functionality implementation details
