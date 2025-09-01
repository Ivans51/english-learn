# Technology Stack

## Frontend
- **Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: Vue Router 4
- **Development**: Vue DevTools, ESLint

## Backend
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Deployment**: Wrangler CLI
- **API**: RESTful endpoints with CORS support

## Development Environment
- **Node.js**: >= 20.19.0 or >= 22.12.0
- **Package Manager**: npm with workspaces
- **Monorepo**: Root package.json manages both frontend and functions

## Common Commands

### Setup
```bash
npm run install:all    # Install dependencies for all projects
```

### Development
```bash
npm run dev            # Start both frontend and backend servers
npm run dev:frontend   # Start only Vue.js frontend (localhost:5173)
npm run dev:functions  # Start only Cloudflare Workers (localhost:8787)
```

### Building
```bash
npm run build          # Build both projects for production
npm run build:frontend # Build frontend only
npm run build:functions # Deploy functions to Cloudflare
```

### Frontend Specific
```bash
cd frontend
npm run type-check     # TypeScript type checking
npm run lint           # ESLint with auto-fix
npm run preview        # Preview production build
```

### Backend Specific
```bash
cd functions
wrangler dev          # Local development server
wrangler deploy       # Deploy to Cloudflare Workers
```

## Code Style
- TypeScript strict mode enabled
- ESLint configuration for Vue.js and TypeScript
- Composition API preferred over Options API
- ES2022 target for modern JavaScript features