require('dotenv').config();

async function checkAPIStatus() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
  console.log('📋 Project ID: gen-lang-client-0242795193');
  console.log('🔍 Checking API status...\n');
  
  // Try to list available models
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    console.log('📤 Fetching available models...');
    const response = await fetch(listUrl);
    const data = await response.json();
    
    if (response.ok && data.models) {
      console.log('✅ API is enabled! Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
      });
      
      // Test with the first available model
      if (data.models.length > 0) {
        const modelName = data.models[0].name;
        console.log(`\n🧪 Testing with ${modelName}...`);
        
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
        const testBody = {
          contents: [{
            parts: [{ text: "Say 'Hello! Your Gemini API is working!' if you can read this." }]
          }]
        };
        
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testBody)
        });
        
        const testData = await testResponse.json();
        
        if (testResponse.ok && testData.candidates) {
          console.log('✅ SUCCESS!');
          console.log('🤖 Response:', testData.candidates[0].content.parts[0].text);
          console.log(`\n🎉 Update your .env file:`);
          console.log(`GEMINI_MODEL=${modelName.replace('models/', '')}`);
          console.log('\n🚀 Start your server: node server.js');
        } else {
          console.log('❌ Test failed:', testData.error?.message);
        }
      }
      
    } else {
      console.log('❌ API Error:', data.error?.message);
      
      if (data.error?.code === 403) {
        console.log('\n💡 API is not enabled. Enable it here:');
        console.log('🔗 https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=gen-lang-client-0242795193');
      } else if (data.error?.message?.includes('API key')) {
        console.log('\n💡 API key is invalid. Get a new one:');
        console.log('🔗 https://aistudio.google.com/app/apikey');
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

checkAPIStatus();