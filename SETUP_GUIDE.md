# 🚀 Quick Setup Guide - CodeGPT

## ✅ What's Already Done

Everything is built and ready! You just need to add your API key.

---

## 📝 Step-by-Step Setup

### **Step 1: Get Your Google Gemini API Key**

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the API key (starts with `AIza...`)

### **Step 2: Add API Key to .env File**

Open the file: `gptcurser-main/.env`

Replace this line:
```env
GOOGLE_GEMINI_API_KEY=your-gemini-api-key-here
```

With your actual key:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### **Step 3: Server is Already Running!**

Visit: **http://localhost:3000**

---

## 🎯 Test All Features

### **1. Create Account**
- Click "Get Started" on landing page
- Fill in name, email, password
- Click "Create Account"

### **2. Test Text Chat**
- Type a message: "Hello, who are you?"
- Press Enter
- AI will respond with streaming text

### **3. Test Image Upload**
- Click 🖼️ button
- Select an image
- Type: "What's in this image?"
- Send - AI will analyze the image

### **4. Test PDF Upload**
- Click 📎 button
- Select a PDF file
- Type: "Summarize this document"
- Send - AI will read and summarize

### **5. Test Voice-to-Text**
- Click 🎤 button
- Start speaking
- Your speech converts to text
- Click 🎤 again to stop
- Send the message

---

## 🔧 Troubleshooting

### **"Missing API Key" Error**
- Make sure you added your key to `.env` file
- Restart the server (I'll do this for you)

### **Voice-to-Text Not Working**
- Allow microphone permissions in browser
- Works best in Chrome/Edge
- If unavailable, it will record audio instead

### **PDF Not Processing**
- Make sure file is under 50MB
- Only PDF files are supported for text extraction
- Other files will be sent as attachments

### **Image Not Showing**
- Supported formats: JPG, PNG, GIF, WebP
- Max size: 50MB
- Image will show inline in chat

---

## 📊 Feature Status

| Feature | Status | How to Test |
|---------|--------|-------------|
| Text Chat | ✅ Ready | Type and send message |
| Image Analysis | ✅ Ready | Upload image + ask question |
| PDF Reading | ✅ Ready | Upload PDF + ask about content |
| Voice-to-Text | ✅ Ready | Click mic + speak |
| Streaming | ✅ Ready | Watch text appear word-by-word |
| Stop Generation | ✅ Ready | Click ⏹ while AI is typing |
| Regenerate | ✅ Ready | Click 🔄 to retry response |
| Recent Prompts | ✅ Ready | Click any prompt to reuse |

---

## 🎨 UI Features

- **Welcome Screen**: Suggestions to get started
- **Recent Prompts**: Quick access to past queries
- **User Menu**: Settings and logout (top-right 👤)
- **Responsive**: Works on mobile and desktop
- **Dark Theme**: Easy on the eyes
- **Animations**: Smooth and professional

---

## 🔑 Important Files

- `.env` - **ADD YOUR API KEY HERE**
- `server.js` - Backend with all features
- `public/app.js` - Frontend chat logic
- `public/index.html` - Chat interface
- `FEATURES.md` - Complete feature list

---

## 💡 Tips

1. **For best results**: Use clear, specific questions
2. **Image analysis**: Ask "What do you see?" or "Describe this image"
3. **PDF questions**: Ask specific questions about the content
4. **Voice input**: Speak clearly and pause between sentences
5. **Multiple files**: You can attach multiple images at once

---

## 🚀 You're All Set!

**Current Status:**
- ✅ Server running on http://localhost:3000
- ✅ All features implemented
- ⚠️ Waiting for your API key

**Next Step:** Add your Gemini API key to `.env` and start chatting!

---

## 📞 Need Help?

If something doesn't work:
1. Check if API key is correct in `.env`
2. Make sure server is running
3. Check browser console for errors (F12)
4. Try refreshing the page

**Enjoy your AI chatbot!** 🎉
