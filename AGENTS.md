# AGENTS.md

This file provides guidelines for AI coding agents working on the English Learn project.

## Project Overview

English Learn is a full-stack monorepo with Vue.js 3 frontend (TypeScript, Tailwind CSS) and Cloudflare Workers backend. The application provides AI-powered English learning with Google Gemini integration, vocabulary management, and Firebase Realtime Database.

## Build, Lint, and Test Commands

### Root Commands (Monorepo)

```bash
npm run dev                    # Start both frontend and backend dev servers
npm run dev:frontend           # Start only Vue.js frontend (port 5173)
npm run dev:functions          # Start only Cloudflare Workers (port 8787)
npm run build                  # Build both projects for production
npm run install:all            # Install all dependencies
```

### Frontend Commands (in `frontend/` directory)

```bash
npm run dev                    # Vite development server
npm run build                  # Production build with type-checking
npm run preview                # Preview production build
npm run type-check             # Run vue-tsc type-checking only
npm run lint                   # Run ESLint and auto-fix issues
```

### Backend Commands (in `functions/` directory)

```bash
npm run dev                    # Start Wrangler dev server
npm run deploy                 # Deploy to Cloudflare Workers
```

## Code Style Guidelines

### General Principles

- Write clean, self-documenting code with minimal comments
- Prefer explicit over implicit
- Keep functions small and focused on single responsibility
- Use descriptive variable and function names
- Handle errors gracefully with user-friendly messages

### TypeScript Usage

- Enable `strict: true` in tsconfig
- Define interfaces for all data structures (see `frontend/src/types.ts`)
- Use explicit return types for functions where beneficial
- Prefer `interface` over `type` for object shapes
- Use proper typing for Vue refs: `const foo = ref<Type>(initialValue)`
- Avoid `any` - use `unknown` with proper type guards if needed

### Vue.js Components

- Use `<script setup lang="ts">` for all components
- Define Props and Emits with TypeScript:
  ```typescript
  interface Props {
    visible: boolean;
    selectedWord: string;
  }
  defineProps<Props>();
  defineEmits<{ explain: [word: string]; close: [] }>();
  ```
- Use Composition API with `ref`, `computed`, `watch`, lifecycle hooks

### Imports and Module Organization

- Use absolute imports with `@/` alias for internal modules
- Sort imports alphabetically within groups
- Separate third-party imports from local imports
- Singleton pattern for services (`export const categoryService = new CategoryService()`)

Example:

```typescript
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Plus } from "lucide-vue-next";
import MainHeader from "@/components/MainHeader.vue";
import { useAuth } from "@/composables/useAuth";
import { categoryService } from "@/services/categoryService";
```

### Naming Conventions

- **Files**: PascalCase for components (`.vue`), camelCase for utilities (`.ts`)
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE for values
- **Interfaces**: PascalCase (`interface VocabularyWord`)
- **Components**: PascalCase in templates (`<MainHeader />`)
- **CSS classes**: kebab-case with Tailwind utility classes

### Error Handling

- Wrap async operations in try/catch blocks
- Log errors with `console.error()` for debugging
- Show user-friendly error messages via toast notifications
- Use the `useToast` composable for feedback
- Always provide loading states for async operations

### API Services Pattern

```typescript
class CategoryService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";
  }

  async createCategory(
    name: string,
    userId?: string,
  ): Promise<{ id: string; name: string }> {
    const url = `${this.apiBaseUrl}/api/categories`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const categoryService = new CategoryService();
```

### Cloudflare Workers Pattern

- Define Env type in `functions/src/types.ts` with required bindings
- Use CORS headers helper from `utils.ts` for all responses
- Handle OPTIONS preflight requests for CORS
- Return JSON responses with proper error handling

### CSS and Styling

- Use Tailwind CSS utility classes exclusively
- Follow dark mode pattern: `dark:bg-primary-800`, `dark:text-primary-100`
- Use `primary-*` and `secondary-*` color palette
- Responsive classes: `sm:`, `md:`, `lg:` prefixes for breakpoints
- Use `transition-colors` for hover effects

### Firebase Integration

- Use Firebase client SDK for frontend authentication
- Firebase Realtime Database for data storage
- Auth pattern via `useAuth` composable
- User ID defaults to 'anonymous' when not authenticated
- All database operations scoped by `userId`

### API Endpoints Pattern

- `POST /api/resource` - Create
- `GET /api/resource` - List
- `PUT /api/resource/:id` - Update
- `DELETE /api/resource/:id` - Delete
- Query params: `?userId=xxx` for user scoping

### File Structure to Follow

```
frontend/src/
├── components/     # Reusable Vue components
├── composables/    # Vue composables (useAuth, useTheme, useToast)
├── services/       # API service classes
├── views/          # Page components
├── router/         # Vue Router configuration
├── types.ts        # TypeScript interfaces
├── utils/          # Utility functions
└── firebase.ts     # Firebase configuration
```

### Linting and Formatting

- Run `npm run lint` before committing to auto-fix issues
- ESLint uses Vue 3 + TypeScript recommended rules
- Prettier handles code formatting (integrated with ESLint)

### Git Commit Messages

Follow Conventional Commits:

- `feat(view): add new category management view`
- `fix(service): resolve category deletion cascade issue`
- `docs: update README with new setup instructions`

### Development Workflow

1. Create feature branch: `feature/short-description`
2. Make changes following these guidelines
3. Run `npm run lint` to fix formatting issues
4. Run `npm run type-check` to verify TypeScript
5. Test in browser at `http://localhost:5173`
6. Commit changes with descriptive message
