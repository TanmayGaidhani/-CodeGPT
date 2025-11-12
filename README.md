# 🤖 CodeGPT - AI Chatbot with Gemini API

A modern, feature-rich AI chatbot application similar to ChatGPT, Claude, and DeepSeek, powered by Google Gemini API.

![Status](https://img.shields.io/badge/Status-Ready-success)
![API](https://img.shields.io/badge/API-Google%20Gemini-blue)
![Features](https://img.shields.io/badge/Features-Complete-brightgreen)

---

## ✨ Key Features

### 🎯 Core Functionality
- **AI Chat**: Real-time streaming responses with typing effect
- **Multimodal**: Text, images, PDFs, and voice input
- **Smart**: Context-aware conversations
- **Fast**: Streaming responses for instant feedback

### 📁 File Support
- **🖼️ Images**: Upload and analyze images (AI vision)
- **📄 PDFs**: Automatic text extraction and analysis
- **🎤 Voice**: Speech-to-text conversion (real-time)

### 🎨 User Experience
- Beautiful dark theme with purple-blue gradients
- Responsive design (mobile + desktop)
- Welcome screen with quick suggestions
- Recent prompts history
- User authentication
- Smooth animations

---

## 🚀 Quick Start

### 1. Get API Key
Visit: https://makersuite.google.com/app/apikey

### 2. Add to .env
```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

### 3. Access Application
```
http://localhost:3000
```

**That's it!** Server is already running.

---

## 📋 Complete Feature List

### ✅ Implemented Features

| Category | Features |
|----------|----------|
| **Chat** | Streaming responses, Stop generation, Regenerate, Markdown support |
| **Images** | Upload, Preview, AI analysis, Inline display |
| **PDFs** | Upload, Text extraction, Content analysis |
| **Voice** | Speech-to-text (real-time), Audio recording |
| **UI** | Dark theme, Animations, Responsive, Welcome screen |
| **Auth** | Register, Login, JWT tokens, User menu |
| **History** | Recent prompts (50), Click to reuse |

---

## 🎯 How to Use

### Text Chat
1. Type your message
2. Press Enter
3. Watch AI respond in real-time

### Image Analysis
1. Click 🖼️ button
2. Select image
3. Ask: "What's in this image?"
4. Get AI description

### PDF Questions
1. Click 📎 button
2. Select PDF
3. Ask: "Summarize this document"
4. AI reads and answers

### Voice Input
1. Click 🎤 button
2. Speak your question
3. Text appears automatically
4. Click 🎤 to stop
5. Send message

---

## 🛠️ Technical Stack

### Backend
- **Node.js** + Express
- **Google Gemini API** (AI)
- **pdf-parse** (PDF extraction)
- **multer** (File uploads)
- **JWT** (Authentication)
- **bcrypt** (Password hashing)

### Frontend
- **Vanilla JavaScript** (No framework)
- **Web Speech API** (Voice-to-text)
- **Marked.js** (Markdown rendering)
- **CSS3** (Animations & gradients)

---

## 📁 Project Structure

```
gptcurser-main/
├── .env                    # API keys (ADD YOUR KEY)
├── server.js              # Backend server
├── package.json           # Dependencies
├── README.md              # This file
├── FEATURES.md            # Detailed features
├── SETUP_GUIDE.md         # Setup instructions
└── public/
    ├── landing.html       # Landing page
    ├── login.html         # Auth page
    ├── index.html         # Chat interface
    ├── settings.html      # User settings
    ├── app.js             # Chat logic
    ├── styles.css         # Chat styles
    ├── auth.css           # Auth styles
    └── landing.css        # Landing styles
```

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/stream` | POST | Streaming chat with multimodal |
| `/api/extract-pdf` | POST | Extract text from PDF |
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | User login |
| `/api/me` | GET | Get user info |

---

## 🎨 Screenshots

### Landing Page
- Modern design with animations
- Feature showcase
- Call-to-action buttons

### Chat Interface
- Clean, ChatGPT-like layout
- Sidebar with recent prompts
- Multimodal input (text, image, PDF, voice)
- Real-time streaming responses

### Authentication
- Beautiful glassmorphism design
- Login and signup forms
- Smooth transitions

---

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ File size limits (50MB)
- ✅ CORS enabled
- ✅ Secure API key storage

---

## 📱 Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Text Chat | ✅ | ✅ | ✅ | ✅ |
| Image Upload | ✅ | ✅ | ✅ | ✅ |
| PDF Upload | ✅ | ✅ | ✅ | ✅ |
| Voice-to-Text | ✅ | ✅ | ✅ | ⚠️ Limited |
| Streaming | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Requirements Met

✅ **1. AI Chatbot** - Like ChatGPT/Claude/DeepSeek using Gemini
✅ **2. Query & API** - Streaming responses with Gemini API
✅ **3. File Upload** - Images, PDFs, and voice messages
✅ **4. All Features** - Complete ChatGPT-like functionality
✅ **5. Page Flow** - Landing → Login → Chat
✅ **6. API Integration** - Ready for your Gemini API key

---

## 📊 Status

| Component | Status |
|-----------|--------|
| Backend | ✅ Complete |
| Frontend | ✅ Complete |
| Image Support | ✅ Complete |
| PDF Support | ✅ Complete |
| Voice Support | ✅ Complete |
| Authentication | ✅ Complete |
| UI/UX | ✅ Complete |
| API Integration | ⚠️ Needs your key |

---

## 🚀 Next Steps

1. **Add your Gemini API key** to `.env`
2. **Visit** http://localhost:3000
3. **Create account** and start chatting
4. **Test all features** (text, image, PDF, voice)
5. **Enjoy your AI chatbot!**

---

## 📚 Documentation

- **SETUP_GUIDE.md** - Step-by-step setup instructions
- **FEATURES.md** - Complete feature documentation
- **README.md** - This file (overview)

---

## 💡 Tips

- **Clear questions** get better answers
- **Image analysis**: Ask "What do you see?"
- **PDF questions**: Be specific about what you want
- **Voice input**: Speak clearly, pause between sentences
- **Multiple files**: Attach multiple images at once

---

## 🎉 You're Ready!

**Server Status:** ✅ Running on http://localhost:3000

**What to do now:**
1. Add your API key to `.env`
2. Open http://localhost:3000
3. Start chatting!

---

## 📞 Support

If you encounter issues:
1. Check API key in `.env`
2. Verify server is running
3. Check browser console (F12)
4. Try refreshing the page

---

**Built with ❤️ using Google Gemini API**

*Last Updated: 2025*
