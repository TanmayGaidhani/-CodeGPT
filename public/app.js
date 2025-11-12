const chatContainer = document.getElementById('chat-messages') || document.getElementById('chat');
const composer = document.getElementById('composer');
const input = document.getElementById('input');
const stopBtn = document.getElementById('stop');
const regenBtn = document.getElementById('regenerate');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu');
const promptListEl = document.getElementById('prompt-list');
const fileBtn = document.getElementById('file-btn');
const imageBtn = document.getElementById('image-btn');
const voiceBtn = document.getElementById('voice-btn');
const fileInput = document.getElementById('file-input');
const imageInput = document.getElementById('image-input');
const attachmentPreview = document.getElementById('attachment-preview');

/** @type {{role:'user'|'assistant', content:string}[]} */
let messages = [];
let lastUserMessage = '';
let currentAbortController = null;
let attachments = [];
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let pastPrompts = loadPrompts();
renderPrompts();

function appendMessage(role, content, attachmentsToShow = []){
  // Hide welcome screen on first message
  const welcomeScreen = document.getElementById('welcome-screen');
  if(welcomeScreen){
    welcomeScreen.style.display = 'none';
  }
  
  const wrapper = document.createElement('div');
  wrapper.className = `message message--${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message__avatar';
  avatar.textContent = role === 'user' ? '🧑' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'message__bubble';

  const roleLabel = document.createElement('div');
  roleLabel.className = 'message__role';
  roleLabel.textContent = role === 'user' ? 'You' : 'Assistant';

  const contentEl = document.createElement('div');
  contentEl.className = 'message__content';
  
  // Show image attachments inline
  if(attachmentsToShow && attachmentsToShow.length > 0){
    attachmentsToShow.forEach(att => {
      if(att.type === 'image' && att.data){
        const img = document.createElement('img');
        img.src = att.data;
        img.className = 'message-image';
        img.alt = att.name;
        contentEl.appendChild(img);
      }
    });
  }
  
  const textNode = document.createElement('div');
  textNode.textContent = content;
  contentEl.appendChild(textNode);

  bubble.appendChild(roleLabel);
  bubble.appendChild(contentEl);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  requestAnimationFrame(()=>{
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

function setBusy(busy){
  composer.querySelector('.send').disabled = busy;
  stopBtn.disabled = !busy;
  input.disabled = busy;
}

// Redirect to landing if no token (basic gate) - DISABLED FOR TESTING
// try{
//   const token = localStorage.getItem('token');
//   if(!token){
//     location.href = '/';
//   }
// }catch{}

composer.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text && attachments.length === 0) return;
  
  console.log('📤 Sending message:', text);
  input.value = '';

  // Create message with text and attachments
  let displayContent = text;
  if(attachments.length > 0){
    const attNames = attachments.map(a => {
      if(a.type === 'image') return `🖼️ ${a.name}`;
      if(a.type === 'audio') return `🎤 ${a.name}`;
      return `📎 ${a.name}`;
    }).join(', ');
    displayContent += `\n\n[${attNames}]`;
  }
  
  // Keep attachments for API call BEFORE using them
  const currentAttachments = [...attachments];
  
  messages.push({ role: 'user', content: text });
  lastUserMessage = text;
  appendMessage('user', text, currentAttachments);
  
  // Clear attachments UI
  attachments = [];
  renderAttachments();
  
  addPrompt(text); // Save only the text prompt, not attachments
  setBusy(true);

  try{
    // Add an empty assistant bubble to stream into
    const assistantWrapper = document.createElement('div');
    assistantWrapper.className = 'message message--assistant';
    assistantWrapper.innerHTML = `
      <div class="message__avatar">🤖</div>
      <div class="message__bubble">
        <div class="message__role">Assistant</div>
        <div class="message__content" id="stream-target"></div>
      </div>`;
    chatContainer.appendChild(assistantWrapper);
    const target = assistantWrapper.querySelector('#stream-target');

    currentAbortController = new AbortController();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ 
        messages,
        attachments: currentAttachments
      }),
      signal: currentAbortController.signal
    });
    if(!res.ok){
      const data = await res.text();
      throw new Error(data || 'Request failed');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = '';
    console.log('📥 Reading stream...');
    while(true){
      const { done, value } = await reader.read();
      if(done) break;
      const chunk = decoder.decode(value, { stream: true });
      assistantText += chunk;
      target.textContent = assistantText;
      window.scrollTo({ top: document.body.scrollHeight });
    }
    console.log('✅ Response complete:', assistantText.substring(0, 50) + '...');
    messages.push({ role: 'assistant', content: assistantText });
  }catch(err){
    console.error(err);
    appendMessage('assistant', 'Sorry, something went wrong. ' + (err.message || ''));
  }finally{
    setBusy(false);
    currentAbortController = null;
  }
});

// Auto-resize textarea
input.addEventListener('input', ()=>{
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, window.innerHeight * 0.4) + 'px';
});

// Enter to send, Shift+Enter for newline
input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    composer.requestSubmit();
  }
});

// Stop generation
stopBtn.addEventListener('click', ()=>{
  if(currentAbortController){
    currentAbortController.abort();
  }
});

// Regenerate last response
regenBtn.addEventListener('click', ()=>{
  if(!lastUserMessage) return;
  // Remove last assistant message if present
  for(let i = messages.length - 1; i >= 0; i--){
    if(messages[i].role === 'assistant'){
      messages.splice(i, 1);
      break;
    }
  }
  composer.requestSubmit();
});

// Basic markdown rendering using marked when streaming completes
const observer = new MutationObserver(() =>{
  document.querySelectorAll('.message--assistant .message__content').forEach(node=>{
    if(node.dataset.md !== '1' && window.marked){
      node.innerHTML = marked.parse(node.textContent || '');
      node.dataset.md = '1';
    }
  });
});
observer.observe(chatContainer, { childList: true, subtree: true });

// Mobile menu toggle
menuBtn.addEventListener('click', ()=> sidebar.classList.toggle('open'));

// Mobile menu toggle
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

if(menuBtn && sidebar){
  menuBtn.addEventListener('click', ()=>{
    sidebar.classList.toggle('open');
    if(sidebarBackdrop){
      sidebarBackdrop.classList.toggle('active');
    }
  });
  
  // Close sidebar when clicking backdrop
  if(sidebarBackdrop){
    sidebarBackdrop.addEventListener('click', ()=>{
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('active');
    });
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e)=>{
    if(window.innerWidth <= 900){
      if(!sidebar.contains(e.target) && !menuBtn.contains(e.target) && !sidebarBackdrop?.contains(e.target)){
        sidebar.classList.remove('open');
        if(sidebarBackdrop){
          sidebarBackdrop.classList.remove('active');
        }
      }
    }
  });
}

// Theme toggle functionality
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = themeToggleBtn?.querySelector('.theme-icon');

if(themeToggleBtn && window.themeManager){
  // Update icon based on current theme
  function updateThemeIcon(){
    const theme = window.themeManager.getEffectiveTheme();
    if(themeIcon){
      themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }
  
  updateThemeIcon();
  
  themeToggleBtn.addEventListener('click', ()=>{
    window.themeManager.toggleTheme();
    updateThemeIcon();
  });
  
  // Listen for theme changes
  window.addEventListener('themechange', updateThemeIcon);
}

// User menu functionality
const userMenuBtn = document.getElementById('user-menu-btn');
const userMenu = document.getElementById('user-menu');
const logoutMenuBtn = document.getElementById('logout-menu-btn');
const settingsBtn = document.getElementById('settings-btn');

if(userMenuBtn && userMenu){
  userMenuBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', ()=>{
    userMenu.style.display = 'none';
  });
  
  userMenu.addEventListener('click', (e)=>{
    e.stopPropagation();
  });
}

if(logoutMenuBtn){
  logoutMenuBtn.addEventListener('click', ()=>{
    if(confirm('Are you sure you want to logout?')){
      // Clear user-specific data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      location.href = '/';
    }
  });
}

if(settingsBtn){
  settingsBtn.addEventListener('click', ()=>{
    location.href = '/settings.html';
  });
}

// Clear prompts functionality
const clearPromptsBtn = document.getElementById('clear-prompts');
if(clearPromptsBtn){
  clearPromptsBtn.addEventListener('click', ()=>{
    if(confirm('Clear all recent prompts?')){
      pastPrompts = [];
      savePrompts();
      renderPrompts();
    }
  });
}

// Past prompts persistence and UI (User-specific)
function getUserStorageKey(key){
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id ? `${key}_${user.id}` : key;
}

function loadPrompts(){
  try{ 
    const storageKey = getUserStorageKey('prompts');
    return JSON.parse(localStorage.getItem(storageKey)||'[]'); 
  }catch{ return []; }
}

function savePrompts(){
  const storageKey = getUserStorageKey('prompts');
  localStorage.setItem(storageKey, JSON.stringify(pastPrompts.slice(0,50)));
}
function addPrompt(text){
  if(!text) return;
  pastPrompts.unshift({ id: crypto.randomUUID?.() || String(Date.now()), text, ts: Date.now() });
  // Deduplicate identical adjacent prompts
  pastPrompts = pastPrompts.filter((p,i,arr)=> i===0 || p.text !== arr[i-1].text);
  pastPrompts = pastPrompts.slice(0,50);
  savePrompts();
  renderPrompts();
}
function renderPrompts(){
  if(!promptListEl) return;
  promptListEl.innerHTML='';
  
  if(pastPrompts.length === 0){
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-icon">💬</div>
      <div class="empty-text">No recent prompts</div>
      <div class="empty-subtext">Your prompts will appear here</div>
    `;
    promptListEl.appendChild(emptyState);
    return;
  }
  
  pastPrompts.forEach(p=>{
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className='prompt-item';
    btn.innerHTML = `<span class="text" title="${p.text}">${p.text}</span>`;
    btn.addEventListener('click', ()=>{
      input.value = p.text;
      input.focus();
      // Auto-resize textarea
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, window.innerHeight * 0.4) + 'px';
    });
    li.appendChild(btn);
    promptListEl.appendChild(li);
  });
}

// Attachment handling
function renderAttachments(){
  attachmentPreview.innerHTML = '';
  attachments.forEach((att, index) => {
    const item = document.createElement('div');
    item.className = `attachment-item ${att.type}`;
    
    if (att.type === 'image') {
      item.innerHTML = `
        <img src="${att.data}" alt="${att.name}" class="attachment-preview-img">
        <div class="attachment-item-header">
          <div class="attachment-item-info">
            <span>🖼️</span>
            <span class="attachment-item-name">${att.name}</span>
          </div>
          <button class="remove" onclick="removeAttachment(${index})">×</button>
        </div>
      `;
    } else {
      item.innerHTML = `
        <div class="attachment-item-header">
          <div class="attachment-item-info">
            <span>${att.type === 'audio' ? '🎵' : '📄'}</span>
            <span>${att.name}</span>
          </div>
          <button class="remove" onclick="removeAttachment(${index})">×</button>
        </div>
      `;
    }
    attachmentPreview.appendChild(item);
  });
}

function removeAttachment(index){
  attachments.splice(index, 1);
  renderAttachments();
}

function addAttachment(file, type = 'file'){
  const reader = new FileReader();
  reader.onload = (e) => {
    attachments.push({
      name: file.name,
      type: type,
      data: e.target.result,
      size: file.size
    });
    renderAttachments();
  };
  reader.readAsDataURL(file);
}

// File attachment handlers
fileBtn.addEventListener('click', () => fileInput.click());
imageBtn.addEventListener('click', () => imageInput.click());

fileInput.addEventListener('change', (e) => {
  Array.from(e.target.files).forEach(file => addAttachment(file, 'file'));
  e.target.value = '';
});

imageInput.addEventListener('change', (e) => {
  Array.from(e.target.files).forEach(file => addAttachment(file, 'image'));
  e.target.value = '';
});

// Voice recording with speech-to-text
let recognition = null;
let isListening = false;

// Initialize Web Speech API if available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  let finalTranscript = '';
  
  recognition.onstart = () => {
    finalTranscript = input.value; // Keep existing text
  };
  
  recognition.onresult = (event) => {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update input with transcript
    input.value = finalTranscript + interimTranscript;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, window.innerHeight * 0.4) + 'px';
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isListening = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.title = 'Voice input';
  };
  
  recognition.onend = () => {
    if (isListening) {
      // Restart if still supposed to be listening
      try {
        recognition.start();
      } catch (err) {
        console.error('Error restarting recognition:', err);
      }
    }
  };
}

voiceBtn.addEventListener('click', async () => {
  if (recognition) {
    // Use speech-to-text
    if (!isListening) {
      try {
        recognition.start();
        isListening = true;
        voiceBtn.classList.add('recording');
        voiceBtn.title = 'Stop listening (click to stop)';
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        alert('Could not start speech recognition. Please try again.');
      }
    } else {
      recognition.stop();
      isListening = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.title = 'Voice input';
    }
  } else {
    // Fallback to audio recording
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });
          addAttachment(audioFile, 'audio');
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        voiceBtn.classList.add('recording');
        voiceBtn.title = 'Stop recording';
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    } else {
      mediaRecorder.stop();
      isRecording = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.title = 'Voice input';
    }
  }
});

// Make removeAttachment globally accessible
window.removeAttachment = removeAttachment;



// ===== TOOLS & ASSISTANTS SYSTEM =====

// Tools Panel Toggle
const toolsPanel = document.getElementById('tools-panel');
const toolsToggleBtn = document.getElementById('tools-toggle-btn');
const closeToolsBtn = document.getElementById('close-tools');

if(toolsToggleBtn && toolsPanel){
  toolsToggleBtn.addEventListener('click', ()=>{
    toolsPanel.classList.toggle('open');
  });
}

if(closeToolsBtn && toolsPanel){
  closeToolsBtn.addEventListener('click', ()=>{
    toolsPanel.classList.remove('open');
  });
}

// Tool Integration Functions
const tools = {
  'web-search': async (query) => {
    return `🔍 Searching the web for: "${query}"\n\nI'll search for the latest information about ${query}. Let me provide you with relevant results and insights.`;
  },
  
  'weather': async (location) => {
    // Redirect to AccuWeather
    window.open('https://www.accuweather.com/en/in/india-weather', '_blank');
    return `🌤️ Opening AccuWeather for India...\n\nI've opened AccuWeather in a new tab where you can check the latest weather information.`;
  },
  
  'news': async (topic) => {
    // News will be fetched from Gemini API
    return `📰 Latest News${topic ? ` about ${topic}` : ''}\n\nLet me get the latest news for you using AI...`;
  },
  
  'stocks': async (symbol) => {
    return `📈 Stock Information${symbol ? ` for ${symbol}` : ''}\n\nFetching stock data...\n\nNote: To get real stock prices, integrate with Alpha Vantage or Yahoo Finance API.`;
  },
  
  'calculator': async (expression) => {
    try {
      // Safe eval alternative
      const result = Function('"use strict"; return (' + expression + ')')();
      return `🧮 Calculator\n\nExpression: ${expression}\nResult: ${result}`;
    } catch(e) {
      return `🧮 Calculator\n\nError: Invalid expression. Please provide a valid mathematical expression.`;
    }
  },
  
  'code-exec': async (code) => {
    // Redirect to CodeChef IDE
    window.open('https://www.codechef.com/ide', '_blank');
    return `⚡ Opening CodeChef IDE...\n\nI've opened CodeChef IDE in a new tab where you can run your code.\n\nYou can paste and execute your code there.`;
  }
};

// Tool Buttons
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tool = btn.getAttribute('data-tool');
    const toolName = btn.querySelector('.tool-name').textContent;
    
    switch(tool) {
      case 'web-search':
        // Directly open Google
        window.open('https://www.google.com/', '_blank');
        toolsPanel.classList.remove('open');
        return; // Don't submit to chat
      case 'weather':
        // Directly open AccuWeather
        window.open('https://www.accuweather.com/en/in/india-weather', '_blank');
        toolsPanel.classList.remove('open');
        return; // Don't submit to chat
      case 'news':
        // Directly open BBC News
        window.open('https://www.bbc.com/', '_blank');
        toolsPanel.classList.remove('open');
        return; // Don't submit to chat
      case 'stocks':
        // Directly open NSE India
        window.open('https://www.nseindia.com/', '_blank');
        toolsPanel.classList.remove('open');
        return; // Don't submit to chat
      case 'calculator':
        // Directly open Desmos Calculator
        window.open('https://www.desmos.com/scientific', '_blank');
        toolsPanel.classList.remove('open');
        return; // Don't submit to chat
      case 'code-exec':
        // Directly open CodeChef IDE
        window.open('https://www.codechef.com/ide', '_blank');
        toolsPanel.classList.remove('open');
        return; // Don't submit to chat
    }
    
    toolsPanel.classList.remove('open');
    input.focus();
    composer.requestSubmit();
  });
});

// AI Assistants
const assistants = {
  'resume': {
    name: 'Resume Builder',
    url: 'https://www.resumebuilder.com/'
  },
  'image-to-pdf': {
    name: 'Image to PDF Converter',
    url: 'https://www.ilovepdf.com/jpg_to_pdf'
  },
  'word-to-pdf': {
    name: 'Word to PDF Converter',
    url: 'https://www.ilovepdf.com/word_to_pdf'
  },
  'doc-compressor': {
    name: 'Document Compressor',
    url: 'https://image.pi7.org/'
  }
};

// Assistant Buttons
document.querySelectorAll('.assistant-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const assistantId = btn.getAttribute('data-assistant');
    const assistant = assistants[assistantId];
    
    if(assistant){
      // Check if it's a URL redirect
      if(assistant.url){
        window.open(assistant.url, '_blank');
        toolsPanel.classList.remove('open');
      } else if(assistant.prompt){
        // Use prompt-based assistant
        input.value = assistant.prompt;
        toolsPanel.classList.remove('open');
        input.focus();
        composer.requestSubmit();
      }
    }
  });
});

// ===== PROJECTS SYSTEM =====

let projects = loadProjects();
renderProjects();

function loadProjects(){
  try{
    return JSON.parse(localStorage.getItem('projects') || '[]');
  }catch{
    return [];
  }
}

function saveProjects(){
  localStorage.setItem('projects', JSON.stringify(projects));
}

function renderProjects(){
  const projectsList = document.getElementById('projects-list');
  if(!projectsList) return;
  
  // Keep the create button
  const createBtn = projectsList.querySelector('.create-project-btn');
  projectsList.innerHTML = '';
  
  projects.forEach(project => {
    const projectBtn = document.createElement('button');
    projectBtn.className = 'project-item';
    projectBtn.innerHTML = `
      <span class="project-icon">${project.icon}</span>
      <div class="project-info">
        <span class="project-name">${project.name}</span>
        <span class="project-count">${project.chats?.length || 0} chats</span>
      </div>
      <button class="project-delete" data-id="${project.id}">×</button>
    `;
    
    projectBtn.addEventListener('click', (e) => {
      if(!e.target.classList.contains('project-delete')){
        loadProject(project.id);
      }
    });
    
    const deleteBtn = projectBtn.querySelector('.project-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(confirm(`Delete project "${project.name}"?`)){
        deleteProject(project.id);
      }
    });
    
    projectsList.appendChild(projectBtn);
  });
  
  if(createBtn){
    projectsList.appendChild(createBtn);
  }
}

// Create Project
const createProjectBtn = document.getElementById('create-project-btn');
if(createProjectBtn){
  createProjectBtn.addEventListener('click', () => {
    const name = prompt('Project name:');
    if(!name) return;
    
    const icons = ['📁', '💼', '🎯', '🚀', '💡', '📊', '🔬', '🎨'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    
    const project = {
      id: Date.now().toString(),
      name: name.trim(),
      icon: icon,
      chats: [],
      createdAt: new Date().toISOString()
    };
    
    projects.unshift(project);
    saveProjects();
    renderProjects();
  });
}

function loadProject(projectId){
  const project = projects.find(p => p.id === projectId);
  if(!project) return;
  
  // Clear current chat
  chatContainer.innerHTML = '';
  messages = [];
  
  // Load project chats
  if(project.chats && project.chats.length > 0){
    project.chats.forEach(chat => {
      appendMessage(chat.role, chat.content);
      messages.push(chat);
    });
  }
  
  // Show notification
  showProjectNotification(`Loaded project: ${project.name}`);
  toolsPanel.classList.remove('open');
}

function deleteProject(projectId){
  projects = projects.filter(p => p.id !== projectId);
  saveProjects();
  renderProjects();
}

function showProjectNotification(message){
  const notification = document.createElement('div');
  notification.className = 'project-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Save current chat to project
function saveToProject(){
  if(messages.length === 0) return;
  
  const projectId = prompt('Enter project ID or name:');
  if(!projectId) return;
  
  let project = projects.find(p => p.id === projectId || p.name === projectId);
  
  if(!project){
    // Create new project
    project = {
      id: Date.now().toString(),
      name: projectId,
      icon: '📁',
      chats: [],
      createdAt: new Date().toISOString()
    };
    projects.unshift(project);
  }
  
  project.chats = [...messages];
  project.updatedAt = new Date().toISOString();
  
  saveProjects();
  renderProjects();
  showProjectNotification(`Saved to project: ${project.name}`);
}

// Add save to project button (optional)
window.saveToProject = saveToProject;
