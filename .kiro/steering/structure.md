# Project Structure

## Monorepo Organization
```
english-learn/
├── frontend/          # Vue.js frontend application
├── functions/         # Cloudflare Workers backend
├── package.json       # Root monorepo configuration
└── .kiro/            # Kiro AI assistant configuration
```

## Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── App.vue        # Root Vue component
│   ├── main.ts        # Application entry point
│   ├── router/        # Vue Router configuration
│   └── style.css      # Global styles with Tailwind imports
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.ts     # Vite build configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Frontend dependencies
```

## Backend Structure (`functions/`)
```
functions/
├── src/
│   └── index.ts       # Main Worker entry point with API routes
├── wrangler.toml      # Cloudflare Workers configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Backend dependencies
```

## Key Conventions

### Frontend
- Use `@/` alias for `src/` directory imports
- Vue components use `<script setup lang="ts">` syntax
- Tailwind classes for styling (no CSS modules)
- Router configuration in dedicated `router/` folder

### Backend
- API routes prefixed with `/api/`
- CORS headers included in all responses
- Environment interface defined for type safety
- Separate handler functions for different route groups

### File Naming
- Vue components: PascalCase (e.g., `MyComponent.vue`)
- TypeScript files: camelCase (e.g., `apiHandler.ts`)
- Configuration files: lowercase with dots (e.g., `vite.config.ts`)

### Import Patterns
- Use ES modules (`import/export`)
- Relative imports for local files
- Absolute imports with `@/` alias in frontend
- Type-only imports when appropriate (`import type`)