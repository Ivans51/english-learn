# English Learn - AI-Powered Language Learning Platform

A comprehensive full-stack application for learning English through interactive AI conversations, featuring Vue.js frontend, Cloudflare Workers backend, and Firebase Realtime Database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (>= 20.19.0 or >= 22.12.0)
- pnpm
- Cloudflare Workers account
- Firebase account
- Google Gemini API key

### Installation
```bash
# Install all dependencies
pnpm run install:all

# Start development servers
pnpm run dev
```

This will start:
- Vue.js frontend at `http://localhost:5173`
- Cloudflare Workers at `http://localhost:8787`

## 📁 Project Structure

```
english-learn/
├── frontend/          # Vue.js frontend with Tailwind CSS
├── functions/         # Cloudflare Workers API functions
├── package.json       # Root monorepo configuration
└── README.md          # This file
```

## 🎯 Features

### Core Learning Features
- **Interactive AI Chat**: Real-time conversations with Google Gemini AI
- **Contextual Learning**: Topic-based conversations (greetings, daily routines, etc.)
- **Interactive Grammar Practice**: Dedicated grammar learning page with real-time AI feedback
- **Practice Phrase Generation**: Generate topic-specific practice phrases with a single click
- **Visual Feedback Indicators**: Color-coded feedback (green = correct, red = improvement needed, blue = practice phrases)
- **Word Selection Tools**: Click any word for instant definitions and pronunciation
- **Vocabulary Builder**: Save words to your personal learning collection
- **Progress Tracking**: Chat history persistence across sessions

### Technical Features
- **Firebase Integration**: Realtime Database for chat history storage
- **Cloudflare Workers**: Serverless backend with TypeScript
- **Vue.js 3**: Modern frontend framework with Composition API
- **Tailwind CSS**: Utility-first styling with dark mode support
- **Responsive Design**: Mobile-first approach with touch-friendly UI

## 🔧 Development

### Scripts
- `pnpm run dev` - Start both frontend and backend development servers
- `pnpm run dev:frontend` - Start only the Vue.js frontend
- `pnpm run dev:functions` - Start only the Cloudflare Workers
- `pnpm run build` - Build both projects for production
- `pnpm run install:all` - Install dependencies for all projects

### Frontend Stack
- **Vue.js 3** with TypeScript and Composition API
- **Vite** for fast development and building
- **Vue Router** for navigation
- **Tailwind CSS** for styling with dark mode support
- **Firebase** client SDK for realtime features
- **SweetAlert2** for beautiful notifications

### Backend Stack
- **Cloudflare Workers** for serverless functions
- **Firebase Realtime Database** for chat history storage
- **Google Gemini AI** for intelligent conversational responses
- **TypeScript** for type safety
- **Wrangler** for deployment and local development

## 🤖 Gemini AI Integration

### Key Features
- **Contextual AI Responses**: AI adapts responses based on learning topics
- **Chat History Persistence**: Conversations stored in Firebase Realtime Database
- **Real-time Capabilities**: Ready for live chat updates
- **Error Handling**: Graceful fallback when AI service is unavailable
- **User-Friendly Interface**: Clear history, typing indicators, message timestamps

### Setup Guide
1. **Get Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Configure Firebase**: Set up Firebase Realtime Database and authentication
3. **Configure Backend**: Set environment variables for Firebase and Gemini
4. **Environment Variables**: Configure frontend API URL

See `FIREBASE_SETUP.md` for detailed setup instructions.

## 📖 Chat Feature Documentation

### Interactive Chat Interface
- Real-time messaging with AI tutor
- Typing indicators for natural conversation flow
- Message timestamps for session tracking
- Responsive design that works on all devices

### Word Selection & Learning Tools
- **Text Selection**: Click and drag to select any word in conversation
- **Word Tooltip**: Hover over selected text to see learning options
- **Explain Function**: Get instant definitions and explanations
- **Save to Vocabulary**: Add words directly to personal vocabulary list
- **Pronunciation**: Text-to-speech functionality for proper pronunciation

### Tabbed Interface
- **Chat Tab**: Main conversation interface
- **Explanations Tab**: View all word explanations from current session
- **Saved Words Tab**: Access saved vocabulary with definitions

## 📝 Grammar Practice Feature

### Overview
The Grammar Practice feature provides dedicated grammar learning with real-time AI feedback. Navigate to any learning topic and click the practice grammar icon to access this feature.

### Accessing Grammar Practice
1. Go to **Learning Topics** from the main navigation
2. Select a topic (e.g., "Greetings", "Daily Routines")
3. Click the **practice grammar icon** to open the Grammar Practice page

### How It Works
- **Type sentences** in the input field and receive instant AI grammar feedback
- Click **Generate Practice Phrase** to get a new topic-specific practice sentence
- Use **Ctrl+K** keyboard shortcut to quickly generate practice phrases

### Visual Feedback
The interface provides color-coded feedback for grammar responses:
- **Green bold text**: Grammatically correct responses
- **Red bold text**: Areas that need improvement with suggestions
- **Blue bold text**: Practice phrases generated by the AI

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Generate a new practice phrase |
| `Enter` | Send your sentence for grammar check |
| `Shift+Enter` | Add a new line in the input |

## 🔥 Firebase Setup

### Prerequisites
- Google/Firebase account
- Cloudflare Workers account
- Node.js and pnpm installed

### Setup Steps
1. **Create Firebase Project** in Firebase Console
2. **Set Up Realtime Database** with appropriate rules
3. **Get Firebase Configuration** (Database URL and authentication)
4. **Configure Backend** with Wrangler secrets
5. **Deploy and Test** the Cloudflare Worker
6. **Configure Frontend** environment variables

See `FIREBASE_SETUP.md` for complete step-by-step guide.

## 🎨 UI/UX Features

### Dark Mode Support
- Full dark mode compatibility
- Automatic theme detection
- Consistent color schemes across all components

### Responsive Design
- Mobile-first approach
- Adaptive layout for different screen sizes
- Touch-friendly interactions

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast ratios for text readability

## 🚀 Deployment

### Production Checklist
- ✅ Environment variables properly configured
- ✅ Firebase Realtime Database created and configured
- ✅ Firebase database rules set up appropriately
- ✅ API key security using Wrangler secrets
- ✅ CORS configuration for production domains
- ✅ Error handling and logging implemented

### Deployment Commands
```bash
# Build for production
pnpm run build

# Deploy Cloudflare Worker
cd functions && wrangler deploy
```

## 📊 Performance Considerations

### Optimization Strategies
- Lazy loading for large conversation histories
- Debounced text selection events
- Efficient DOM manipulation for highlighting
- Memory management for stored conversations

### Browser Compatibility
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- Progressive enhancement for older browsers
- Graceful degradation of advanced features

## 🔮 Future Enhancements

### Planned Features
1. **Voice Input**: Speech-to-text for speaking practice
2. **Progress Tracking**: Learning analytics and progress reports
3. **Custom Topics**: User-generated conversation topics
4. **Offline Mode**: Downloaded content for offline learning
5. **Social Features**: Share vocabulary lists with other learners

### API Integrations
1. **Dictionary API**: Enhanced word definitions and examples
2. **Translation API**: Multi-language support
3. **TTS API**: Advanced text-to-speech with multiple voices

## 🛠️ Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)

## 📚 Additional Documentation

- `CHAT_FEATURE.md` - Detailed chat feature documentation
- `FIREBASE_SETUP.md` - Complete Firebase setup guide
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `TEST_API.md` - API testing instructions

## 🤝 Support

For technical issues or feature requests, please refer to the project documentation or create an issue in the project repository.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests for any enhancements or bug fixes.

---

**Built with ❤️ for English learners worldwide** 🌍
