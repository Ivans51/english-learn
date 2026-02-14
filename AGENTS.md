# AGENTS.md

Guidelines for AI agents working on the English Learn project.

## Project Overview

Full-stack monorepo: Vue.js 3 frontend (TypeScript, Tailwind CSS v4) + Cloudflare Workers backend. Features AI-powered English learning with vocabulary management, PWA support, and Firebase Realtime Database.

## Commands

### Root (monorepo)

```bash
pnpm run dev                    # Both frontend + backend
pnpm run dev:frontend           # Vue.js only (port 5173)
pnpm run dev:functions          # Workers only (port 8787)
pnpm run build                  # Build for production
pnpm run lint                   # ESLint + auto-fix for all
pnpm run format                 # Prettier format for all
pnpm run test                   # Run tests for frontend + functions
pnpm run test:coverage          # Coverage for all
pnpm run install:all            # Install all dependencies
```

### Frontend (`frontend/`)

```bash
pnpm run dev                    # Vite dev server
pnpm run build                  # Production build + type-check
pnpm run preview                # Preview production build
pnpm run type-check             # vue-tsc only
pnpm run lint                   # ESLint + auto-fix
pnpm run format                 # Prettier format
pnpm test                       # Vitest watch mode
pnpm run test:run               # Single test run
pnpm run test:coverage          # With coverage report
```

**Run single test file:**

```bash
cd frontend && pnpm vitest run src/services/categoryService.test.ts
cd functions && pnpm vitest run src/index.test.ts
```

### Backend (`functions/`)

```bash
pnpm run dev                    # Wrangler dev server
pnpm run deploy                 # Deploy to Cloudflare
pnpm run lint                   # ESLint + auto-fix
pnpm run format                 # Prettier format
pnpm test                       # Vitest watch mode
pnpm run test:run               # Single test run
pnpm run test:coverage          # With coverage report
```

### Backend (`functions/`)

```bash
pnpm run dev                    # Wrangler dev server
pnpm run deploy                 # Deploy to Cloudflare
pnpm run lint                   # ESLint + auto-fix
pnpm run format                 # Prettier format
pnpm test                       # Vitest watch mode
pnpm run test:run               # Single test run
pnpm run test:coverage          # With coverage report
```

## Code Style

### TypeScript

- `strict: true` in tsconfig
- Define interfaces for all data structures (`frontend/src/types.ts`)
- Proper typing for refs: `const foo = ref<Type>(initialValue)`
- Avoid `any` - use `unknown` with type guards
- Prefer `interface` over `type` for objects

### Vue Components

- Use `<script setup lang="ts">`
- Define Props/Emits with TypeScript:
  ```typescript
  interface Props {
    visible: boolean;
  }
  defineProps<Props>();
  defineEmits<{ close: [] }>();
  ```
- Composition API: `ref`, `computed`, `watch`, lifecycle hooks

### Imports

- Use `@/` alias for internal modules
- Sort alphabetically within groups
- Separate third-party from local imports
- Singleton pattern for services: `export const service = new Service()`

Example:

```typescript
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Mic } from "lucide-vue-next";
import VoiceModal from "@/components/VoiceModal.vue";
import { useAuth } from "@/composables/useAuth";
import { voiceService } from "@/services/voiceService";
```

### Naming

- Files: PascalCase (`.vue`), camelCase (`.ts`)
- Vars/functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Interfaces: PascalCase
- CSS classes: kebab-case (Tailwind)

### Error Handling

- Wrap async in try/catch
- Log with `console.error()` for debugging
- Show user-friendly messages via `useToast`
- Always provide loading states

### API Services

```typescript
class VocabService {
  private apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

  async fetchWords(userId: string): Promise<Word[]> {
    const res = await fetch(`${this.apiBaseUrl}/api/words?userId=${userId}`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }
}
export const vocabService = new VocabService();
```

### PWA Configuration

- Icons located in `frontend/public/`: `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`
- Icons generated from `frontend/src/resources/images/logo.png`
- Theme color: `#1F2937` (configured in `vite.config.ts` and `index.html`)
- Offline mode disabled (no `workbox.globPatterns`)
- Service worker configured with `registerType: 'autoUpdate'`

### Cloudflare Workers

- Define Env type in `functions/src/types.ts`
- Use CORS helpers from `utils.ts`
- Handle OPTIONS preflight
- Return JSON responses

### Styling

- Tailwind CSS v4 exclusively
- Dark mode: `dark:bg-gray-800`, `dark:text-gray-100`
- Responsive: `sm:`, `md:`, `lg:` prefixes
- Use standard Tailwind colors (gray-500, indigo-600, etc.)

### Firebase

- Client SDK for auth, Realtime Database for storage
- `useAuth` composable for authentication
- Default userId: `'anonymous'` when not authenticated
- Scope all operations by `userId`

### File Structure

```
frontend/src/
├── components/     # Reusable Vue components
├── composables/    # Vue composables
├── services/       # API service classes
├── views/          # Page components
├── router/         # Vue Router
├── types.ts        # TypeScript interfaces
├── types/          # TypeScript declaration files (.d.ts)
├── utils/          # Utilities
├── firebase.ts     # Firebase config
└── resources/      # Static resources (images, etc.)
```

### Git Commits

Follow Conventional Commits:

- `feat(view): add pronunciation practice modal`
- `fix(service): resolve audio upload timeout`
- `docs: update setup instructions`

### Workflow

1. Create branch: `feature/short-description`
2. Make changes following guidelines
3. Run `pnpm run lint` then `pnpm run type-check`
4. Test at http://localhost:5173
5. Commit with descriptive message
