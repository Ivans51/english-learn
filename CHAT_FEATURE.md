# Chat Feature Documentation

## Overview

The Chat Feature is a comprehensive conversational practice interface designed to help English learners improve their language skills through interactive AI conversations. Users can select topics from different difficulty levels and engage in contextual discussions while learning new vocabulary.

## Features

### 1. Interactive Chat Interface
- Real-time messaging with AI tutor
- Typing indicators for natural conversation flow
- Message timestamps for session tracking
- Responsive design that works on all devices

### 2. Word Selection & Learning Tools
- **Text Selection**: Click and drag to select any word in the conversation
- **Word Tooltip**: Hover over selected text to see learning options
- **Explain Function**: Get instant definitions and explanations for selected words
- **Save to Vocabulary**: Add words directly to your personal vocabulary list
- **Pronunciation**: Text-to-speech functionality for proper pronunciation

### 3. Tabbed Interface
- **Chat Tab**: Main conversation interface
- **Explanations Tab**: View all word explanations from the current session
- **Saved Words Tab**: Access your saved vocabulary with definitions

### 4. Smart Notifications
- Toast notifications for user actions (word saved, explained, etc.)
- Visual feedback for successful operations
- Error handling with user-friendly messages

## Usage Guide

### Starting a Chat Session

1. Navigate to any level (A1, A2, B1, B2, C1, C2)
2. Click on a topic card to open the chat interface
3. The AI tutor will greet you with context-specific conversation starters

### Learning from Conversations

1. **Reading**: Messages appear with selectable text
2. **Selection**: Click and drag to highlight any word or phrase
3. **Learning Options**: Choose from the tooltip menu:
   - **Explain**: Get detailed word definitions
   - **Save**: Add to your vocabulary collection
   - **Pronounce**: Hear correct pronunciation

### Managing Your Learning

- **Explanations Tab**: Review all words you've asked about
- **Saved Words Tab**: Access your personal vocabulary list
- **Remove Words**: Delete words from your saved collection when needed

## Technical Implementation

### Components

- **ChatView.vue**: Main chat interface component
- **WordTooltip.vue**: Reusable tooltip for word interactions
- **ToastNotification.vue**: User feedback system

### Key Features

#### Word Highlighting
```typescript
const highlightSelectableText = (content: string): string => {
  return content.replace(/\b(\w+)\b/g, 
    '<span class="selectable-word cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 rounded px-1 transition-colors">$1</span>')
}
```

#### Text Selection Handling
- Detects user text selection in real-time
- Positions tooltip dynamically based on selection bounds
- Supports keyboard and mouse interactions

#### Speech Synthesis
- Web Speech API integration for pronunciation
- Configurable voice settings (rate, volume, language)
- Fallback handling for unsupported browsers

### Data Structures

#### Message Interface
```typescript
interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}
```

#### Word Explanation Interface
```typescript
interface WordExplanation {
  id: string
  word: string
  definition: string
  timestamp: Date
}
```

#### Saved Word Interface
```typescript
interface SavedWord {
  id: string
  word: string
  definition: string
  timestamp: Date
}
```

## Styling & Theming

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

## Future Enhancements

### Planned Features
1. **Voice Input**: Speech-to-text for speaking practice
2. **Progress Tracking**: Learning analytics and progress reports
3. **Custom Topics**: User-generated conversation topics
4. **Offline Mode**: Downloaded content for offline learning
5. **Social Features**: Share vocabulary lists with other learners

### API Integrations
1. **Dictionary API**: Enhanced word definitions and examples
2. **Translation API**: Multi-language support
3. **Grammar API**: Real-time grammar correction
4. **TTS API**: Advanced text-to-speech with multiple voices

## Performance Considerations

### Optimization Strategies
- Lazy loading for large conversation histories
- Debounced text selection events
- Efficient DOM manipulation for highlighting
- Memory management for stored conversations

### Browser Compatibility
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- Progressive enhancement for older browsers
- Graceful degradation of advanced features

## Configuration

### Environment Variables
```env
VITE_AI_API_URL=your-ai-service-url
VITE_DICTIONARY_API_KEY=your-dictionary-api-key
VITE_TTS_API_KEY=your-text-to-speech-api-key
```

### Default Settings
- Auto-save explanations: `true`
- Toast notification duration: `3000ms`
- Speech synthesis rate: `0.8`
- Max conversation history: `100 messages`

## Getting Started

1. Ensure you have the latest version of the application
2. Navigate to any topic from the level selection
3. Start chatting and selecting words to learn
4. Use the tabs to review your learning progress

## Support

For technical issues or feature requests, please refer to the main project documentation or create an issue in the project repository.