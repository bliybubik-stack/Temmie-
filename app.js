// ============================================
// APP.JS - Main Application Logic
// ============================================

// ===== DOM REFERENCES =====
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const apiInput = document.getElementById('apiKeyInput');
const saveBtn = document.getElementById('saveKeyBtn');
const statusText = document.getElementById('statusText');
const statusImage = document.getElementById('temmieStatusImg');

// ===== STATE =====
let openRouterKey = localStorage.getItem('temmie_key') || '';
let isProcessing = false;
let currentBotMessageEl = null;
let typewriterTimeline = null;

// ===== INITIALIZE =====
if (openRouterKey) {
    apiInput.value = openRouterKey;
}

// ===== STATUS IMAGE MAP =====
const TEM_IMAGES = {
    happy: 'assets/tem-happy.png',
    thinking: 'assets/tem-thinking.png',
    talking: 'assets/tem-talking.png',
    angry: 'assets/tem-angry.png',
    sad: 'assets/tem-sad.png',
    excited: 'assets/tem-excited.png',
    confused: 'assets/tem-confused.png',
    shy: 'assets/tem-shy.png',
    sleepy: 'assets/tem-sleepy.png'
};

// ===== UPDATE STATUS =====
function updateStatus(text, imageKey = 'happy') {
    statusText.textContent = text;
    if (imageKey && TEM_IMAGES[imageKey]) {
        statusImage.src = TEM_IMAGES[imageKey];
        statusImage.alt = `Temmie is ${imageKey}`;
    }
}

// ===== ADD MESSAGE TO CHAT =====
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.textContent = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return div;
}

// ===== TYPEWRITER EFFECT =====
function typewriteMessage(element, fullText, callback) {
    // Kill any ongoing animation
    if (typewriterTimeline) {
        typewriterTimeline.kill();
        typewriterTimeline = null;
    }
    
    // Remove old cursor
    const oldCursor = element.querySelector('.cursor-blink');
    if (oldCursor) oldCursor.remove();

    // Clear and prepare
    element.textContent = '';
    const textSpan = document.createElement('span');
    textSpan.className = 'typewriter-text';
    element.appendChild(textSpan);
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor-blink';
    element.appendChild(cursorSpan);

    // Register GSAP plugin
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        gsap.registerPlugin(TextPlugin);
    }

    // Calculate duration (chars per second)
    const charsPerSec = 20;
    const duration = Math.max(0.4, fullText.length / charsPerSec);

    // Create timeline
    const tl = gsap.timeline({
        onComplete: () => {
            const c = element.querySelector('.cursor-blink');
            if (c) c.remove();
            if (callback) callback();
            updateStatus('tEm dOnE!', 'happy');
        }
    });

    // Lock cursor during typing
    tl.call(() => {
        cursorSpan.style.animation = 'none';
        cursorSpan.style.opacity = '1';
    }, [], 0);

    // Type out text
    tl.to(textSpan, {
        duration: duration,
        text: { value: fullText },
        ease: 'none',
    }, 0);

    typewriterTimeline = tl;
    return tl;
}

// ===== SEND MESSAGE TO AI =====
async function sendToAI(userText) {
    const key = apiInput.value.trim();
    if (!key) {
        updateStatus('⚠️ pLs sAvE kEy FiRsT!', 'angry');
        return;
    }
    
    // Save key
    localStorage.setItem('temmie_key', key);

    // Disable UI
    isProcessing = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    updateStatus('tEm tHiNkInG...', 'thinking');

    // Add user message
    addMessage(userText, 'user');
    userInput.value = '';

    // Create bot message container
    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'msg bot';
    chatContainer.appendChild(botMsgDiv);
    currentBotMessageEl = botMsgDiv;

    let fullResponse = '';

    try {
        // Build prompt from prompt.js
        const systemPrompt = buildSystemPrompt();
        const userPrompt = buildUserPrompt(userText);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Temmie Talk'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 1.1,
                max_tokens: 180,
                stream: false
            })
        });

        if (!response.ok) {
            let errMsg = `API error ${response.status}`;
            try {
                const errJson = await response.json();
                if (errJson.error) errMsg = errJson.error.message || errMsg;
            } catch (_) {}
            throw new Error(errMsg);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            fullResponse = data.choices[0].message.content || '(tEm sAiLEnCe...)';
        } else {
            fullResponse = '(tEm nO uNdErStAnD...)';
        }

        // Clean up
        fullResponse = fullResponse.replace(/\*\*/g, '').replace(/\*/g, '').trim();
        if (!fullResponse) fullResponse = 'hOI! tEm iS hErE!';

        // Set status based on response
        const mood = detectMood(fullResponse);
        updateStatus('tEm tAlKiNg...', mood);

        // Typewrite the response
        botMsgDiv.textContent = '';
        typewriteMessage(botMsgDiv, fullResponse, () => {
            isProcessing = false;
            sendBtn.disabled = false;
            userInput.disabled = false;
            userInput.focus();
            updateStatus('tEm iS rEaDy', 'happy');
            currentBotMessageEl = null;
        });

    } catch (err) {
        const errorText = `⚠️ tEm eRrOr: ${err.message || 'unknown'}`;
        if (currentBotMessageEl) {
            currentBotMessageEl.textContent = errorText;
        } else {
            addMessage(errorText, 'bot');
        }
        updateStatus('❌ tEm fAiL...', 'sad');
        isProcessing = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        currentBotMessageEl = null;
    }
}

// ===== DETECT MOOD FROM TEXT =====
function detectMood(text) {
    const lower = text.toLowerCase();
    if (lower.includes('hOI') || lower.includes('hi') || lower.includes('hey')) return 'excited';
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('>(')) return 'angry';
    if (lower.includes('sad') || lower.includes('cry') || lower.includes(':(')) return 'sad';
    if (lower.includes('lol') || lower.includes('haha') || lower.includes('xd')) return 'excited';
    if (lower.includes('sleep') || lower.includes('zzz') || lower.includes('tired')) return 'sleepy';
    if (lower.includes('confused') || lower.includes('??') || lower.includes('what')) return 'confused';
    if (lower.includes('shy') || lower.includes('blush') || lower.includes('uwu')) return 'shy';
    if (lower.includes('bye') || lower.includes('bOI')) return 'shy';
    return 'happy';
}

// ===== HANDLE SEND =====
function handleSend() {
    if (isProcessing) return;
    const text = userInput.value.trim();
    if (!text) return;
    sendToAI(text);
}

// ===== EVENT LISTENERS =====
sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

saveBtn.addEventListener('click', () => {
    const key = apiInput.value.trim();
    if (key) {
        localStorage.setItem('temmie_key', key);
        updateStatus('✅ kEy sAvEd!', 'happy');
        setTimeout(() => {
            updateStatus('tEm iS rEaDy', 'happy');
        }, 1600);
    } else {
        updateStatus('⚠️ eMpTy kEy...', 'angry');
    }
});

// ===== INITIAL GREETING =====
window.addEventListener('load', () => {
    const greeting = 'hOI!!!! iM tEm!!!  tYpE sUmThIn...  💬';
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    chatContainer.appendChild(botDiv);
    updateStatus('tEm iS rEaDy', 'happy');
    typewriteMessage(botDiv, greeting, () => {
        updateStatus('tEm iS rEaDy', 'happy');
    });
});

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    if (typewriterTimeline) typewriterTimeline.kill();
});

// ===== EXPOSE FOR DEBUGGING =====
window.temmie = {
    updateStatus,
    addMessage,
    typewriteMessage,
    sendToAI,
    detectMood
};
