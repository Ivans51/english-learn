# English Learn - Frontend

A Vue.js 3 frontend application for AI-powered English learning, featuring vocabulary management, topic-based learning, and real-time grammar checking with Google Gemini integration.

## Overview

The English Learn frontend is a modern Single Page Application (SPA) built with Vue.js 3, TypeScript, and Tailwind CSS. It provides an interactive learning experience with AI-powered grammar feedback, vocabulary tracking, and topic-based organization.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue.js 3 with Composition API |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Build Tool | Vite |
| Router | Vue Router 4 |
| Authentication | Firebase Auth |
| Database | Firebase Realtime Database |
| Icons | Lucide Vue Next |
| Alerts | SweetAlert2 |
| Markdown | Marked |

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── MainHeader.vue       # Navigation header with theme toggle
│   │   ├── TopicModal.vue       # Add/edit topic modal dialog
│   │   ├── TopicWordsModal.vue  # Topic words management modal
│   │   ├── WordDetailsModal.vue # Word explanation modal
│   │   ├── WordModal.vue        # Vocabulary word modal
│   │   ├── WordTooltip.vue      # Word tooltip component
│   │   └── ToastNotification.vue # Toast notification component
│   │
│   ├── composables/         # Vue composables (shared logic)
│   │   ├── useAuth.ts           # Firebase authentication handling
│   │   ├── useTheme.ts          # Dark/light mode management
│   │   └── useToast.ts          # Toast notification system
│   │
│   ├── services/            # API service classes
│   │   ├── topicService.ts      # Topics and grammar check API
│   │   ├── vocabularyService.ts # Vocabulary CRUD operations
│   │   ├── categoryService.ts   # Category management
│   │   └── sweetAlertService.ts # SweetAlert2 wrapper
│   │
│   ├── views/               # Page components
│   │   ├── HomeView.vue         # Landing page
│   │   ├── LoginView.vue        # User login page
│   │   ├── RegisterView.vue     # User registration page
│   │   ├── LearningByTopicsView.vue  # Main learning interface
│   │   ├── GrammarCheckView.vue # Grammar practice page
│   │   ├── VocabularyView.vue   # Personal vocabulary management
│   │   ├── CategoriesView.vue   # Category management
│   │   ├── ProfileView.vue      # User profile page
│   │   └── NotFoundView.vue     # 404 error page
│   │
│   ├── router/              # Vue Router configuration
│   │   └── index.ts             # Route definitions and auth guards
│   │
│   ├── resources/           # Static resources
│   │   └── css/
│   │       └── style.css        # Global styles
│   │
│   ├── utils/               # Utility functions
│   │   └── swalUtils.ts         # SweetAlert2 utilities
│   │
│   ├── firebase.ts          # Firebase configuration
│   ├── main.ts              # Vue app entry point
│   ├── App.vue              # Root component
│   └── types.ts             # TypeScript interfaces
│
├── public/                  # Static assets
├── package.json
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.ts         # ESLint configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Key Features

### Authentication

- **Firebase Authentication**: Email/password registration and login
- **Anonymous Access**: Users can explore the app without signing in (limited features)
- **Auth Guards**: Protected routes require authentication

### Learning by Topics

- Create, edit, and delete learning topics
- Organize vocabulary by topics
- Track learning progress

### Grammar Practice

- **Real-time AI Feedback**: Get instant grammar corrections using Google Gemini
- **Ctrl+K Shortcut**: Press `Ctrl+K` to generate practice phrases
- **Color-coded Feedback**:
  - Green: Grammar is correct
  - Red: Grammar needs improvement
  - Blue: Practice suggestions

### Vocabulary Management

- Add new vocabulary words with meanings and examples
- Organize words by categories
- Mark words as pending or completed
- Search and filter vocabulary

### Dark Mode

- Full dark mode support with theme toggle
- Persists user preference in localStorage
- Smooth transitions between themes

## Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- pnpm (recommended) or npm
- Firebase project configuration

### Installation

```bash
# Install dependencies
pnpm install

# Or using npm
npm install
```

### Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_URL=http://localhost:8787
```

### Development

```bash
# Start development server (port 5173)
pnpm run dev

# Start only frontend dev server
pnpm run dev:frontend
```

### Production Build

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Linting and Type Checking

```bash
# Run ESLint with auto-fix
pnpm run lint

# Run TypeScript type checking
pnpm run type-check
```

## Routing

| Path | Route Name | Description | Auth Required |
|------|------------|-------------|---------------|
| `/` | home | Landing page | No |
| `/login` | login | Login page | No |
| `/register` | register | Registration page | No |
| `/vocabulary` | vocabulary | Vocabulary management | Yes |
| `/profile` | profile | User profile | Yes |
| `/learning-topics` | learning-topics | Topic-based learning | Yes |
| `/categories` | categories | Category management | Yes |
| `/grammar-check/:topicId/:topicTitle` | grammar-check | Grammar practice | Yes |
| `/:catchAll(.*)` | NotFound | 404 page | No |

## API Services

### Topic Service (`topicService.ts`)

```typescript
// Get all topics for a user
topicService.getTopics(userId: string): Promise<Topic[]>

// Create a new topic
topicService.createTopic({ title, userId }): Promise<Topic>

// Update a topic
topicService.updateTopic(topicId, { title }, userId): Promise<Topic>

// Delete a topic
topicService.deleteTopic(topicId, userId): Promise<void>

// Check grammar with AI
topicService.checkGrammar(topicTitle, userInput, userId): Promise<{ feedback, isCorrect }>

// Generate practice phrase
topicService.generatePracticePhrase(topicTitle, userId): Promise<{ phrase, translation, grammarFocus }>
```

### Vocabulary Service (`vocabularyService.ts`)

```typescript
// CRUD operations for vocabulary words
vocabularyService.getVocabulary(userId): Promise<VocabularyData>
vocabularyService.addWord(word, userId): Promise<void>
vocabularyService.updateWord(wordUid, updates, userId): Promise<void>
vocabularyService.deleteWord(wordUid, userId): Promise<void>
```

### Category Service (`categoryService.ts`)

```typescript
// Category management
categoryService.getCategories(userId): Promise<Category[]>
categoryService.createCategory(name, userId): Promise<{ id, name }>
categoryService.deleteCategory(categoryId, userId): Promise<void>
```

## Composables

### useAuth

Handles Firebase authentication state management.

```typescript
const { user, loading, isAuthenticated } = useAuth()

// user: Ref<User | null>
// loading: Ref<boolean>
// isAuthenticated: () => boolean
```

### useTheme

Manages dark/light mode theme.

```typescript
const { isDark, toggleTheme } = useTheme()

// isDark: Ref<boolean>
// toggleTheme: () => void
```

### useToast

Provides toast notification functionality.

```typescript
const { success, error, info } = useToast()

// success(message, duration?)
// error(message, duration?)
// info(message, duration?)
```

## TypeScript Interfaces

All TypeScript interfaces are defined in `src/types.ts`:

```typescript
interface VocabularyWord {
  term: string
  categoryId: string
  categoryName: string
  meanings: string
  examples: string
  status?: 'pending' | 'completed'
}

interface Topic {
  id: string
  title: string
  createdAt: string
}

interface Category {
  name: string
}
```

## Code Style Guidelines

### Vue Components

All components use `<script setup lang="ts">` syntax:

```vue
<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
}

defineProps<Props>()
defineEmits<{ close: [] }>()
</script>

<template>
  <!-- Component template -->
</template>
```

### Imports

Use absolute imports with the `@/` alias:

```typescript
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { topicService } from '@/services/topicService'
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MainHeader.vue` |
| Variables | camelCase | `userName` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| Interfaces | PascalCase | `Topic` |
| Files | camelCase | `topicService.ts` |

## Firebase Configuration

The app uses Firebase for:

- **Authentication**: Email/password sign-in
- **Realtime Database**: Vocabulary and category storage

Data structure:

```
english-learn/
└── users/
    └── {userId}/
        ├── topics/
        │   └── {topicId}/
        │       └── {topicData}
        ├── vocabulary/
        │   └── {wordUid}/
        │       └── {wordData}
        └── categories/
            └── {categoryId}/
                └── {categoryData}
```

## Development Workflow

1. Create a feature branch from `main`
2. Make changes following code style guidelines
3. Run `pnpm run lint` to fix formatting
4. Run `pnpm run type-check` to verify TypeScript
5. Test in browser at `http://localhost:5173`
6. Commit with descriptive message
7. Push and create a pull request

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run dev:frontend` | Start frontend only |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build |
| `pnpm run lint` | Lint and auto-fix issues |
| `pnpm run type-check` | Run TypeScript type checking |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## PWA Configuration

The app is configured as a Progressive Web App (PWA) with installable support.

### PWA Icons

The PWA uses three icon files located in `frontend/public/`:

| Icon File | Size | Purpose |
|-----------|------|---------|
| `pwa-192x192.png` | 192x192 | Standard PWA icon |
| `pwa-512x512.png` | 512x512 | Maskable icon (adaptive shapes) |
| `apple-touch-icon.png` | 180x180 | iOS home screen icon |

#### Updating Icons

Icons are generated from `frontend/src/resources/images/logo.png`. To update:

```bash
# 1. Replace logo.png with your new logo
cp new-logo.png frontend/src/resources/images/logo.png

# 2. Regenerate PWA icons
python3 << 'EOF'
from PIL import Image

logo_path = 'frontend/src/resources/images/logo.png'
output_dir = 'frontend/public'

def create_icon(size, filename, maskable=False):
    logo = Image.open(logo_path)
    if maskable:
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        logo.thumbnail((size * 0.8, size * 0.8), Image.Resampling.LANCZOS)
        canvas.paste(logo, ((size - logo.width) // 2, (size - logo.height) // 2), logo)
    else:
        logo.thumbnail((size, size), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        canvas.paste(logo, ((size - logo.width) // 2, (size - logo.height) // 2), logo)
    canvas.save(f'{output_dir}/{filename}', 'PNG')

create_icon(192, 'pwa-192x192.png')
create_icon(180, 'apple-touch-icon.png')
create_icon(512, 'pwa-512x512.png', maskable=True)
EOF

# 3. Rebuild frontend
cd frontend && pnpm run build-only
```

#### Icon Requirements

- Format: PNG with transparency (RGBA)
- Recommended size: At least 512x512 pixels for best quality
- Logo should be centered and have some padding for maskable icon
- The 512x512 icon uses `purpose: 'any maskable'` for adaptive shapes

### Theme Color

The PWA status bar color is defined in two places:
- `frontend/vite.config.ts`: `theme_color: '#1F2937'`
- `frontend/index.html`: `<meta name="theme-color" content="#1F2937">`

Change both values to update the installed app's header color.

### Service Worker

The app uses `vite-plugin-pwa` with:
- `registerType: 'autoUpdate'` - Automatic service worker updates
- Offline mode **disabled** - App requires internet connection
- Minimal precaching for update notifications only

To enable full offline support, add to `vite.config.ts`:
```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking
5. Submit a pull request

## License

This project is for personal educational use.
