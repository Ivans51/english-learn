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
- TypeScript for type safety
- Wrangler for deployment

## API Endpoints

- `GET /api/hello` - Test endpoint that returns a greeting message

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).
