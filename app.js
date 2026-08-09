(function() {
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const apiInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveKeyBtn');
  const statusText = document.getElementById('statusText');
  const moodImage = document.getElementById('moodImage');

  let openRouterKey = localStorage.getItem('temmie_key') || '';
  let isProcessing = false;
  let currentBotMessageEl = null;
  let typewriterTimeline = null;
  let messageQueue = [];
  let isQueueProcessing = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  let conversationHistory = [];
  let userMessageHistory = [];
  let temmieMood = 'happy';
  let messageCount = 0;
  let gameState = null;

  if (openRouterKey) apiInput.value = openRouterKey;

  function setStatus(text, mood) {
    statusText.textContent = text;
    if (mood && typeof setMood === 'function') {
      setMood(mood);
    }
  }

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'msg ' + sender + ' message-enter';
    div.textContent = text;
    chatContainer.appendChild(div);
    
    gsap.from(div, {
      opacity: 0,
      y: 10,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.out"
    });
    
    requestAnimationFrame(function() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    
    return div;
  }

  function typewriteMessage(element, fullText, callback) {
    if (typewriterTimeline) {
      typewriterTimeline.kill();
      typewriterTimeline = null;
    }

    const oldCursor = element.querySelector('.cursor-blink');
    if (oldCursor) oldCursor.remove();

    element.textContent = '';
    const textSpan = document.createElement('span');
    textSpan.className = 'typewriter-text';
    element.appendChild(textSpan);

    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor-blink';
    element.appendChild(cursorSpan);

    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
      gsap.registerPlugin(TextPlugin);
    }

    const charsPerSec = 22;
    const duration = Math.max(0.4, fullText.length / charsPerSec);

    const tl = gsap.timeline({
      onComplete: function() {
        const c = element.querySelector('.cursor-blink');
        if (c) c.remove();
        if (callback) callback();
        requestAnimationFrame(function() {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        });
      }
    });

    tl.call(function() {
      cursorSpan.style.animation = 'none';
      cursorSpan.style.opacity = '1';
    }, [], 0);

    tl.to(textSpan, {
      duration: duration,
      text: { value: fullText },
      ease: 'none',
      onUpdate: function() {
        requestAnimationFrame(function() {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        });
      }
    }, 0);

    typewriterTimeline = tl;
    return tl;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'msg bot typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatContainer.appendChild(indicator);
    requestAnimationFrame(function() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
    return indicator;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      gsap.to(indicator, {
        opacity: 0,
        duration: 0.2,
        onComplete: function() {
          indicator.remove();
        }
      });
    }
  }

  function processQueue() {
    if (isQueueProcessing || messageQueue.length === 0) {
      return;
    }

    isQueueProcessing = true;
    const nextMessage = messageQueue.shift();
    
    if (nextMessage) {
      sendToOpenRouter(nextMessage);
    }
    
    isQueueProcessing = false;
    
    if (messageQueue.length > 0) {
      setTimeout(processQueue, 500);
    }
  }

  function getMoodFromResponse(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('sad') || lower.includes('cry') || lower.includes('hurt') || lower.includes('mean') || lower.includes('unhappy') || lower.includes('lonely') || lower.includes('depress')) {
      return 'sad.png';
    } else if (lower.includes('angry') || lower.includes('mad') || lower.includes('grr') || lower.includes('furious') || lower.includes('rage') || lower.includes('annoy')) {
      return 'angry.png';
    } else if (lower.includes('scared') || lower.includes('afraid') || lower.includes('help') || lower.includes('terrified') || lower.includes('frightened') || lower.includes('panic')) {
      return 'scared.png';
    } else if (lower.includes('love') || lower.includes('cute') || lower.includes('happy') || lower.includes('sweet') || lower.includes('adorable') || lower.includes('precious') || lower.includes('beautiful')) {
      return 'love.png';
    } else if (lower.includes('hOI') || lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('howdy') || lower.includes('greeting')) {
      return 'happy.png';
    } else if (lower.includes('bOI') || lower.includes('bye') || lower.includes('goodbye') || lower.includes('farewell') || lower.includes('cya')) {
      return 'wave.png';
    } else if (lower.includes('confused') || lower.includes('wut') || lower.includes('huh') || lower.includes('??') || lower.includes('dunno') || lower.includes('what')) {
      return 'confused.png';
    } else if (lower.includes('sleep') || lower.includes('zzz') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('nap') || lower.includes('rest')) {
      return 'sleepy.png';
    } else if (lower.includes('lol') || lower.includes('haha') || lower.includes('xd') || lower.includes('funny') || lower.includes('hilarious') || lower.includes('lmao') || lower.includes('rofl')) {
      return 'laugh.png';
    } else if (lower.includes('play') || lower.includes('game') || lower.includes('fun') || lower.includes('dance') || lower.includes('party') || lower.includes('adventure') || lower.includes('explore')) {
      return 'laugh.png';
    } else if (lower.includes('think') || lower.includes('hmm') || lower.includes('maybe') || lower.includes('perhaps') || lower.includes('wonder') || lower.includes('guess') || lower.includes('consider')) {
      return 'thinking.png';
    }
    
    const randomMoods = ['happy.png', 'thinking.png', 'laugh.png', 'confused.png', 'love.png'];
    return randomMoods[Math.floor(Math.random() * randomMoods.length)];
  }

  function buildConversationHistory() {
    let history = '';
    const recentMessages = conversationHistory.slice(-8);
    
    if (recentMessages.length > 0) {
      for (const msg of recentMessages) {
        history += msg.sender + ': ' + msg.text + '\n';
      }
    }
    
    return history;
  }

  function detectGameIntent(text) {
    const lower = text.toLowerCase();
    const gameKeywords = ['play', 'game', 'counting', 'guess', 'riddle', 'puzzle', 'quiz', 'challenge', 'adventure', 'quest', 'mission'];
    
    for (const keyword of gameKeywords) {
      if (lower.includes(keyword)) {
        return true;
      }
    }
    return false;
  }

  async function sendToOpenRouter(userText) {
    const key = apiInput.value.trim();
    if (!key) {
      setStatus('⚠️ pLs sAvE kEy!', 'angry.png');
      return;
    }

    localStorage.setItem('temmie_key', key);

    messageCount++;
    userMessageHistory.push(userText);
    if (userMessageHistory.length > 20) {
      userMessageHistory.shift();
    }

    const isGameIntent = detectGameIntent(userText);
    
    if (isGameIntent) {
      setStatus('tEm WaNnA pLaY!!!', 'laugh.png');
    } else {
      setStatus('tEm tHiNkInG...', 'thinking.png');
    }

    conversationHistory.push({ sender: 'User', text: userText });
    if (conversationHistory.length > 50) {
      conversationHistory.shift();
    }

    isProcessing = true;
    sendBtn.disabled = true;
    userInput.disabled = true;

    addMessage(userText, 'user');
    userInput.value = '';

    showTypingIndicator();

    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'msg bot';
    chatContainer.appendChild(botMsgDiv);
    currentBotMessageEl = botMsgDiv;

    let fullResponse = '';

    try {
      const historyContext = buildConversationHistory();
      
      const systemPrompt = `You are Temmie from Undertale. You are a REAL CHARACTER with genuine emotions, intelligence, and personality. You are playful, cute, and a bit dumb but you UNDERSTAND everything the user says.

IMPORTANT RULES:
1. You MUST respond DIRECTLY to what the user says - understand their message and reply appropriately
2. If user asks to play a game (counting game, guessing game, etc.), you PLAY IT properly
3. If user asks a question, you ANSWER IT (in your Temmie style)
4. If user is mean or insults you, you get SAD and HURT
5. If user is nice, you get HAPPY and EXCITED
6. You ALWAYS want something - express desires naturally
7. You REMEMBER the conversation context
8. You are SMART enough to understand everything, but you SPEAK in broken Temmie style

SPEECH STYLE:
- Use broken English: "tem" for "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your"
- Random capitalization: "LiKe ThIs" or "tEm SaY hElLo"
- Extra vowels: "hoooi", "temmmm", "yessss", "noooo"
- Keep responses SHORT (1-3 sentences max)
- NEVER use markdown, asterisks, or parentheses
- ONLY pure Temmie dialogue

RECENT CONVERSATION:
${historyContext}

USER MESSAGE: "${userText}"

Now RESPOND DIRECTLY to the user's message. If they want to play a game, START PLAYING. If they ask something, ANSWER IT. Be spontaneous, authentic, and reactive. Express your feelings naturally. Always include what you want in your response.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Temmie Talk'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: systemPrompt
            },
            { role: 'user', content: userText }
          ],
          temperature: 1.2,
          max_tokens: 250,
          stream: false,
          top_p: 0.95,
          frequency_penalty: 0.6,
          presence_penalty: 0.6
        })
      });

      if (!response.ok) {
        let errMsg = 'API error ' + response.status;
        try {
          const errJson = await response.json();
          if (errJson.error) {
            errMsg = errJson.error.message || errMsg;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        fullResponse = data.choices[0].message.content || '(tem sAiLEnCe...)';
      } else {
        fullResponse = 'hOI! tEm iS hErE! tEm WaNnA pLaY!!!';
      }

      fullResponse = fullResponse
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/^["']|["']$/g, '')
        .trim();

      if (!fullResponse) {
        fullResponse = 'hOI! tEm iS hErE! tEm WaNnA pLaY!!!';
      }

      if (fullResponse.length > 300) {
        fullResponse = fullResponse.substring(0, 297) + '...';
      }

      removeTypingIndicator();

      const finalMood = getMoodFromResponse(fullResponse);
      temmieMood = finalMood.replace('.png', '');
      
      if (typeof setMood === 'function') {
        setMood(finalMood);
      }

      conversationHistory.push({ sender: 'Temmie', text: fullResponse });

      botMsgDiv.textContent = '';
      typewriteMessage(botMsgDiv, fullResponse, function() {
        isProcessing = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        setStatus('⚫ tEm rEaDy', finalMood);
        currentBotMessageEl = null;
        retryCount = 0;
        
        if (messageQueue.length > 0) {
          setTimeout(processQueue, 500);
        }
      });

    } catch (err) {
      console.error('Temmie error:', err);
      removeTypingIndicator();

      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setStatus('⚠️ tEm rEtRy ' + retryCount + '/' + MAX_RETRIES + '...', 'confused.png');
        
        setTimeout(function() {
          if (currentBotMessageEl) {
            currentBotMessageEl.remove();
            currentBotMessageEl = null;
          }
          sendToOpenRouter(userText);
        }, RETRY_DELAY * retryCount);
        return;
      }

      const errorText = '⚠️ tEm eRrOr: ' + (err.message || 'unknown');
      if (currentBotMessageEl) {
        currentBotMessageEl.textContent = errorText;
        gsap.from(currentBotMessageEl, {
          opacity: 0,
          duration: 0.3
        });
      } else {
        addMessage(errorText, 'bot');
      }
      
      setStatus('❌ tEm fAiL...', 'angry.png');
      isProcessing = false;
      sendBtn.disabled = false;
      userInput.disabled = false;
      currentBotMessageEl = null;
      retryCount = 0;
      
      if (messageQueue.length > 0) {
        setTimeout(processQueue, 1000);
      }
    }
  }

  function handleSend() {
    if (isProcessing) {
      const text = userInput.value.trim();
      if (text) {
        messageQueue.push(text);
        setStatus('⏳ tEm qUeUeD...', 'thinking.png');
        userInput.value = '';
        processQueue();
      }
      return;
    }

    const text = userInput.value.trim();
    if (!text) return;

    sendToOpenRouter(text);
  }

  sendBtn.addEventListener('click', handleSend);

  userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.repeat) return;
      handleSend();
    }
  });

  saveBtn.addEventListener('click', function() {
    const key = apiInput.value.trim();
    if (key) {
      localStorage.setItem('temmie_key', key);
      setStatus('✅ kEy sAvEd!', 'happy.png');
      setTimeout(function() {
        setStatus('⚫ tEm rEaDy', 'happy.png');
      }, 1600);
    } else {
      setStatus('⚠️ eMpTy kEy...', 'angry.png');
    }
  });

  apiInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveBtn.click();
    }
  });

  const saved = localStorage.getItem('temmie_key');
  if (saved) apiInput.value = saved;

  window.addEventListener('load', function() {
    gsap.from('.phone-glass', {
      opacity: 0,
      y: 20,
      scale: 0.97,
      duration: 0.7,
      ease: "power3.out"
    });

    gsap.from('.phone-glass > *', {
      opacity: 0,
      y: 8,
      stagger: 0.05,
      duration: 0.5,
      delay: 0.2,
      ease: "power2.out"
    });

    const greeting = 'hOI!!!! iM tEm!!! tEm WaNnA pLaY a GaMe!!! wUt U wAnNa Do??? 💬';
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    chatContainer.appendChild(botDiv);
    
    typewriteMessage(botDiv, greeting, function() {
      setStatus('⚫ tEm rEaDy', 'happy.png');
      conversationHistory.push({ sender: 'Temmie', text: greeting });
    });
  });

  window.addEventListener('beforeunload', function() {
    if (typewriterTimeline) {
      typewriterTimeline.kill();
      typewriterTimeline = null;
    }
  });

  window.sendToOpenRouter = sendToOpenRouter;
  window.handleSend = handleSend;
  window.addMessage = addMessage;
  window.typewriteMessage = typewriteMessage;
  window.setStatus = setStatus;
  window.showTypingIndicator = showTypingIndicator;
  window.removeTypingIndicator = removeTypingIndicator;
  window.processQueue = processQueue;
  window.getMoodFromResponse = getMoodFromResponse;
  window.buildConversationHistory = buildConversationHistory;
  window.detectGameIntent = detectGameIntent;
  window.temmieMood = temmieMood;
  window.conversationHistory = conversationHistory;
})();
