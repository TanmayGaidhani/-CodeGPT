require('dotenv').config();

async function testWorkingGemini() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
  console.log('🧪 Testing Gemini 2.5 Flash...\n');
  
  const modelName = 'models/gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{
      parts: [{ text: "Hello! Please respond with 'Your ChatGPT clone with Gemini is working perfectly!' if you can read this." }]
    }]
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (response.ok && data.candidates) {
      console.log('✅ SUCCESS! Gemini API is working!');
      console.log('🤖 Gemini Response:', data.candidates[0].content.parts[0].text);
      console.log('\n🎉 Your ChatGPT clone is ready!');
      console.log('\n📝 Update your .env file:');
      console.log('GEMINI_MODEL=gemini-2.5-flash');
      console.log('\n🚀 Start your server:');
      console.log('node server.js');
      console.log('\n🌐 Open in browser:');
      console.log('http://localhost:3000/chat');
    } else {
      console.log('❌ Error:', data.error?.message);
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testWorkingGemini();