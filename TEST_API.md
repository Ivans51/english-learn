# API Testing Guide

This document provides simple tests to verify the Gemini AI integration is working correctly.

## Prerequisites

1. Backend is running (either via `wrangler dev` or deployed)
2. Gemini API key is properly configured
3. KV namespace is set up

## Manual API Testing

### 1. Test Basic Connectivity

```bash
curl -X GET http://localhost:8787/api/hello
```

Expected response:
```json
{
  "message": "Hello from English Learn API!",
  "timestamp": "2024-01-XX..."
}
```

### 2. Test Chat Endpoint

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I want to practice English",
    "topicId": "1",
    "userId": "test-user"
  }'
```

Expected response:
```json
{
  "message": "Hello! It's great that you want to practice English...",
  "messageId": "1234567890",
  "timestamp": "2024-01-XX..."
}
```

### 3. Test Chat History

```bash
curl "http://localhost:8787/api/chat/history?topicId=1&userId=test-user"
```

Expected response:
```json
{
  "messages": [
    {
      "id": "1234567890",
      "content": "Hello, I want to practice English",
      "sender": "user",
      "timestamp": "2024-01-XX..."
    },
    {
      "id": "1234567891",
      "content": "Hello! It's great that you want to practice English...",
      "sender": "ai",
      "timestamp": "2024-01-XX..."
    }
  ]
}
```

### 4. Test Clear History

```bash
curl -X DELETE http://localhost:8787/api/chat/clear \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": "1",
    "userId": "test-user"
  }'
```

Expected response:
```json
{
  "success": true
}
```

## Frontend Testing Checklist

1. **Navigate to Chat View**
   - Go to any topic and open the chat
   - Verify initial AI greeting appears

2. **Send Messages**
   - Type a message and send it
   - Verify typing indicator appears
   - Verify AI response is received
   - Check that message timestamps are correct

3. **Chat History**
   - Send multiple messages
   - Refresh the page
   - Verify chat history is preserved
   - Check that messages appear in correct order

4. **Clear History**
   - Click the clear history button (trash icon)
   - Verify confirmation toast appears
   - Check that only initial greeting remains
   - Refresh page to confirm history is cleared

5. **Word Selection Features**
   - Select words in AI responses
   - Verify tooltip appears with explain/save/pronounce options
   - Test each tooltip function

6. **Error Handling**
   - Turn off backend server
   - Try sending a message
   - Verify error message appears
   - Check that fallback message is shown

## Common Issues and Solutions

### Backend Issues

1. **"GEMINI_API_KEY not found"**
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

2. **"CHAT_HISTORY is not defined"**
   - Check KV namespace ID in `wrangler.toml`
   - Recreate KV namespace if needed

3. **CORS Errors**
   - Verify CORS headers are properly set
   - Check that OPTIONS requests are handled

### Frontend Issues

1. **API Connection Failed**
   - Check `VITE_API_URL` in `.env.local`
   - Verify backend is running on correct port

2. **Chat History Not Loading**
   - Check browser network tab for API errors
   - Verify API response format matches expected structure

3. **Environment Variables Not Working**
   - Restart Vite dev server after changing `.env.local`
   - Check that file is named correctly (not `.env.local.txt`)

## Production Testing

When testing in production:

1. Update API URLs to use your deployed worker URL
2. Test with actual domain (not localhost)
3. Verify HTTPS is working correctly
4. Test with different browsers and devices
5. Monitor Cloudflare Worker logs for errors
6. Check KV storage usage in Cloudflare dashboard

## Performance Testing

1. **Response Time**
   - Measure time from message send to AI response
   - Should be under 5 seconds for most queries

2. **Chat History Loading**
   - Test with large chat histories (30+ messages)
   - Verify loading is still fast

3. **Concurrent Users**
   - Test multiple users chatting simultaneously
   - Check for any race conditions or conflicts

## Security Testing

1. **API Key Protection**
   - Verify API key is not exposed in client-side code
   - Check that secrets are properly configured

2. **Input Validation**
   - Try sending empty messages
   - Test with very long messages (>1000 chars)
   - Send malformed JSON to API endpoints

3. **Rate Limiting**
   - Send many requests quickly
   - Verify appropriate error handling

## Success Criteria

✅ All API endpoints respond correctly  
✅ Gemini AI generates relevant responses  
✅ Chat history persists across sessions  
✅ Clear history function works  
✅ Error handling is graceful  
✅ CORS is properly configured  
✅ Environment variables work correctly  
✅ Frontend integrates seamlessly with backend  

When all items are checked, the Gemini AI integration is ready for use!