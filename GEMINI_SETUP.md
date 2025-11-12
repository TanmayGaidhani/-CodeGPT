# Google Gemini API Setup Guide

## Step 1: Get Your Gemini API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Select **"Create API key in new project"**
5. Copy the API key (starts with "AIza...")

## Step 2: Add API Key to .env File

Open `.env` file and replace:
```
GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

With your actual key:
```
GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 3: Test Your API Key

Run the test:
```bash
node test-gemini.js
```

You should see:
```
✅ SUCCESS! Gemini API is working!
🤖 Gemini Response: Your ChatGPT clone with Gemini is working perfectly!
```

## Step 4: Start Your Server

```bash
node server.js
```

## Step 5: Open Your Chat

Go to: **http://localhost:3000/chat**

Type a message and you'll get AI responses from Google Gemini!

## Available Models

You can change the model in `.env`:
- `gemini-pro` (default, recommended)
- `gemini-1.5-flash` (faster)
- `gemini-1.5-pro` (more capable)

## Troubleshooting

### Error: API key not valid
- Get a fresh API key from Google AI Studio
- Make sure the key is not restricted

### Error: 404 Model not found
- Try different model names
- Check if the model is available in your region

### Error: Quota exceeded
- Gemini has free tier limits
- Wait a few minutes or upgrade your plan

## Features

✅ Real-time streaming responses
✅ Chat history support
✅ User authentication
✅ PDF file upload
✅ Tools integration
✅ Projects system

Enjoy your ChatGPT clone powered by Google Gemini! 🚀