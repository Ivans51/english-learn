# Firebase Realtime Database Setup Guide

This guide will help you set up Firebase Realtime Database for chat history storage in the English Learning application.

## Prerequisites

- A Google/Firebase account
- Cloudflare Workers account (for backend deployment)
- Node.js and npm installed

## Step 1: Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "english-learn-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. In your Firebase project console, click on "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose your database location (select the one closest to your users)
4. **Start in test mode** for development (we'll secure it later)
5. Click "Done"

## Step 3: Get Firebase Configuration

### Database URL
1. In the Realtime Database section, you'll see your database URL
2. It will look like: `https://your-project-id-default-rtdb.firebaseio.com/`
3. Copy this URL - you'll need it for `FIREBASE_DATABASE_URL`

### Authentication Setup

You have two options for authentication:

#### Option A: Database Secret (Simpler, Less Secure)
1. Go to Project Settings (gear icon) > Service accounts
2. Click on "Database secrets" tab
3. Copy the existing secret or create a new one
4. Use this secret for `FIREBASE_SERVICE_ACCOUNT_KEY`

#### Option B: Service Account (More Secure, Recommended for Production)
1. Go to Project Settings (gear icon) > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Use the entire JSON content as a string for `FIREBASE_SERVICE_ACCOUNT_KEY`
5. Note: You'll need to implement proper JWT signing in the Worker (more complex)

## Step 4: Configure Database Rules

1. In the Realtime Database console, click on the "Rules" tab
2. For development, use these permissive rules:

```json
{
  "rules": {
    "chatHistory": {
      "$userId": {
        "$topicId": {
          ".read": true,
          ".write": true,
          ".validate": "newData.hasChildren(['id', 'content', 'sender', 'timestamp'])"
        }
      }
    }
  }
}
```

3. For production, consider more restrictive rules:

```json
{
  "rules": {
    "chatHistory": {
      "$userId": {
        "$topicId": {
          ".read": "auth != null",
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['id', 'content', 'sender', 'timestamp'])"
        }
      }
    }
  }
}
```

## Step 5: Backend Configuration (Cloudflare Workers)

### Install Dependencies

Navigate to the `functions` directory:
```bash
cd functions
```
Install the Google Generative AI client library:
```bash
npm install @google/generative-ai
```

### Set Environment Variables

Using Wrangler secrets (recommended for security):

```bash
cd functions

# Set Gemini API key
wrangler secret put GEMINI_API_KEY
# Enter your Gemini API key when prompted

# Set Firebase Project ID
wrangler secret put FIREBASE_PROJECT_ID
# Enter your Firebase project ID

# Set Firebase Database URL
wrangler secret put FIREBASE_DATABASE_URL
# Enter your Firebase database URL (e.g., https://your-project-id-default-rtdb.firebaseio.com)

# Set Firebase Auth (choose one method)
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
# Enter your database secret OR service account JSON
```

### Alternative: Using wrangler.toml (Less secure, for development only)

```toml
[vars]
GEMINI_API_KEY = "your_gemini_api_key_here"
FIREBASE_PROJECT_ID = "your-firebase-project-id"
FIREBASE_DATABASE_URL = "https://your-firebase-project-default-rtdb.firebaseio.com"
FIREBASE_SERVICE_ACCOUNT_KEY = "your_firebase_database_secret"
```

**Warning**: Never commit secrets to version control!

## Step 6: Deploy and Test

1. **Deploy the Worker**:
   ```bash
   # For development
   wrangler dev
   
   # For production
   wrangler deploy
   ```
   
2. **Test Firebase Connection**:
   ```bash
   # Test chat endpoint
   curl -X POST http://localhost:8787/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "topicId": "1", "userId": "test"}'
   
   # Test chat history
   curl "http://localhost:8787/api/chat/history?topicId=1&userId=test"
   ```
   
3. **Verify in Firebase Console**:
   - Go to your Realtime Database in Firebase Console
   - You should see data appearing under `chatHistory/test/1/`

## Step 7: Frontend Configuration

The frontend configuration remains the same as before:

1. **Create Environment File**:
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   ```
   
2. **Update .env.local**:
   ```env
   # For local development
   VITE_API_URL=http://localhost:8787
   
   # For production (use your deployed worker URL)
   # VITE_API_URL=https://english-learn-functions.your-subdomain.workers.dev
   ```
   
## Data Structure in Firebase

Your chat data will be stored in this structure:

```json
{
  "chatHistory": {
    "anonymous": {
      "1": [
        {
          "id": "1234567890",
          "content": "Hello, I want to practice English",
          "sender": "user",
          "timestamp": "2024-01-01T10:00:00.000Z"
        },
        {
          "id": "1234567891",
          "content": "Hello! It's great that you want to practice English...",
          "sender": "ai",
          "timestamp": "2024-01-01T10:00:01.000Z"
        }
      ]
    }
  }
}
```

## Security Best Practices

### For Development
- Use test mode with open rules
- Use database secrets for simplicity
- Monitor usage in Firebase Console

### For Production
- Implement proper authentication rules
- Use service account keys with proper JWT signing
- Set up billing alerts
- Monitor database usage and costs
- Implement rate limiting

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check your database rules
   - Verify authentication is working
   - Ensure the auth token is valid

2. **"Failed to fetch" errors**
   - Verify the database URL is correct
   - Check that the Firebase project is active
   - Ensure CORS is properly configured

3. **Data not persisting**
   - Check Firebase Console to see if data is being written
   - Verify the data structure matches expectations
   - Check for any validation rule failures

4. **Authentication failures**
   - Verify the service account key is correct
   - Check that the secret is properly set in Wrangler
   - Ensure the database secret (if used) is still active

### Testing Database Connection

You can test your Firebase connection directly:

```bash
# Test reading from Firebase
curl "https://your-project-id-default-rtdb.firebaseio.com/test.json?auth=YOUR_SECRET"

# Test writing to Firebase
curl -X PUT "https://your-project-id-default-rtdb.firebaseio.com/test.json?auth=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## Migration from Cloudflare KV

If you're migrating from Cloudflare KV:

1. **Export existing data** (if any) from KV
2. **Transform data format** to match Firebase structure
3. **Import data** to Firebase using the REST API or Admin SDK
4. **Update environment variables** in Wrangler
5. **Deploy updated Worker**
6. **Test thoroughly** before removing KV namespace

## Cost Considerations

Firebase Realtime Database pricing:
- **Spark Plan (Free)**: 1GB storage, 10GB/month data transfer
- **Blaze Plan (Pay-as-you-go)**: $5/GB storage, $1/GB data transfer

For a chat application:
- Each message ~200 bytes
- 1000 messages ≈ 200KB
- Free tier can handle ~5M messages storage + significant transfer

Monitor your usage in the Firebase Console under "Usage and billing".

## Next Steps

1. **Implement user authentication** for individual chat histories
2. **Add real-time listeners** in frontend for instant message updates
3. **Implement message indexing** for better query performance
4. **Add offline support** using Firebase's offline capabilities
5. **Set up backup strategies** for chat data