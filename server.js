require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Define routes BEFORE static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static('public'));

// ===== MONGODB CONNECTION =====
const MONGO_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Chatgptclone";

const userSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true, required: true, trim: true },
  passwordHash: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Chat History Schema
const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  title: { type: String, default: 'New Chat' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("📁 MongoDB: Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

main();

// ===== GOOGLE GEMINI SETUP =====
let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = require("@google/generative-ai"));
  console.log('✅ Google Gemini SDK loaded');
} catch (err) {
  console.error('❌ Missing @google/generative-ai. Run: npm install @google/generative-ai');
}

// Verify Gemini API key
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
console.log('🔑 Gemini Key loaded:', !!geminiKey);
console.log('🧠 Gemini model:', process.env.GEMINI_MODEL || 'gemini-2.5-flash');

// ===== AUTH FUNCTIONS =====
async function findUserByEmail(email) {
  return await User.findOne({ email: email.toLowerCase() });
}

async function createUser(userData) {
  const user = new User(userData);
  return await user.save();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function authMiddleware(req, _res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) { req.user = null; return next(); }
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    req.user = jwt.verify(token, secret);
  } catch { req.user = null; }
  next();
}

app.use(authMiddleware);

// ===== HELPER FUNCTIONS =====
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return null;
  }
}

// ===== API ROUTES =====
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    
    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    
    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Check if email already exists
    const emailExists = await findUserByEmail(email);
    if (emailExists) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await createUser({
      id: String(Date.now()),
      name: name.trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      profilePicture: ''
    });
    
    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password required' });
    }
    
    const user = await findUserByEmail(email);
    if (!user) { 
      return res.status(401).json({ error: 'Invalid credentials' }); 
    }
    
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) { 
      return res.status(401).json({ error: 'Invalid credentials' }); 
    }
    
    const token = signToken({ id: user._id, email: user.email });
    res.json({ 
      token, 
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: { id: req.user.id, email: req.user.email } });
});

// ===== GOOGLE GEMINI CHAT ENDPOINT (STREAMING) =====
app.post('/api/chat/stream', async (req, res) => {
  try {
    console.log('📨 Chat request received');
    const { messages } = req.body || {};
    
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('❌ No messages in request');
      return res.status(400).end('messages array required');
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log('🔑 API Key length:', apiKey ? apiKey.length : 'MISSING');
    
    if (!apiKey) {
      console.error('❌ Gemini API key not found in .env');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.write('❌ Google Gemini API key missing.\n\n');
      res.write('Please add GOOGLE_GEMINI_API_KEY to your .env file.\n');
      res.write('Get it from: https://aistudio.google.com/app/apikey');
      return res.end();
    }
    
    if (!GoogleGenerativeAI) {
      console.error('❌ Gemini SDK not loaded');
      return res.status(500).end('Server not configured');
    }

    console.log('✅ Initializing Google Gemini...');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.5-flash'; // Using Gemini 2.5 Flash
    console.log('🤖 Using model:', modelName);
    
    const model = genAI.getGenerativeModel({ 
      model: modelName
    });
    console.log('💬 Messages count:', messages.length);

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      console.error('❌ Last message is not from user');
      return res.end('Invalid message format');
    }

    const userMessage = lastMessage.content;
    console.log('📤 Sending to Gemini API...');

    try {
      const result = await model.generateContentStream(userMessage);
      console.log('✅ Got stream from Gemini');
      
      let charCount = 0;
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          res.write(text);
          charCount += text.length;
        }
      }
      
      console.log(`✅ Response completed (${charCount} characters)`);
    } catch (apiError) {
      console.error('❌ Gemini API Error:', apiError.message);
      console.error('Error details:', apiError);
      res.write('\n\n[Gemini API Error: ' + apiError.message + ']');
      
      if (apiError.message.includes('API key')) {
        res.write('\n\nGet a valid API key from: https://aistudio.google.com/app/apikey');
      }
    }
    
    res.end();
  } catch (error) {
    console.error('❌ Stream error:', error.message);
    console.error('Stack:', error.stack);
    try { 
      res.write('\n\n[Server Error: ' + (error.message || 'Failed to generate response') + ']');
    } catch(_) {}
    res.end();
  }
});

// PDF extraction endpoint
app.post('/api/extract-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    if (text) {
      res.json({ text, success: true });
    } else {
      res.status(500).json({ error: 'Failed to extract text from PDF' });
    }
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// Tool endpoints
app.post('/api/tools/search', async (req, res) => {
  const { query } = req.body;
  res.json({ 
    success: true, 
    results: `Search results for: ${query}`,
    note: 'Integrate with search API'
  });
});

app.post('/api/tools/weather', async (req, res) => {
  const { location } = req.body;
  res.json({ 
    success: true, 
    data: `Weather for ${location}`,
    note: 'Integrate with weather API'
  });
});

app.post('/api/tools/calculate', async (req, res) => {
  try {
    const { expression } = req.body;
    const result = Function('"use strict"; return (' + expression + ')')();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// ===== CHAT HISTORY ENDPOINTS =====

// Save chat history
app.post('/api/chat/history/save', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { messages, title } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const chatHistory = new ChatHistory({
      userId: req.user.id,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      })),
      title: title || 'New Chat',
      updatedAt: new Date()
    });

    await chatHistory.save();
    res.json({ success: true, chatId: chatHistory._id });
  } catch (error) {
    console.error('Save chat history error:', error);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

// Get user's chat history list
app.get('/api/chat/history/list', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chats = await ChatHistory.find({ userId: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({ chats });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Get specific chat
app.get('/api/chat/history/:chatId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chat = await ChatHistory.findOne({
      _id: req.params.chatId,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to get chat' });
  }
});

// Delete chat
app.delete('/api/chat/history/:chatId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await ChatHistory.deleteOne({
      _id: req.params.chatId,
      userId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🤖 Using Google Gemini for text generation`);
  console.log(`🛠️  Tools & Assistants enabled`);
  console.log(`📁 Projects system enabled`);
});