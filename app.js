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
  let lastUserMood = 'neutral';
  let messageCount = 0;

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

  function detectUserMood(text) {
    const lower = text.toLowerCase();
    
    const insults = ['stupid', 'dumb', 'idiot', 'moron', 'fool', 'useless', 'trash', 'garbage', 'hate', 'terrible', 'awful', 'bad', 'worst', 'suck', 'sucks', 'dummy', 'loser', 'pathetic'];
    const meanWords = ['mean', 'rude', 'cruel', 'horrible', 'nasty', 'evil', 'devil', 'demon', 'monster', 'creep', 'weird', 'strange', 'ugly'];
    const happyWords = ['love', 'cute', 'adorable', 'sweet', 'nice', 'kind', 'good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'best', 'perfect', 'beautiful', 'pretty', 'gorgeous', 'lovely'];
    const sadWords = ['sad', 'depressed', 'lonely', 'cry', 'crying', 'tears', 'miserable', 'gloomy', 'heartbroken', 'hurt', 'pain', 'suffer'];
    const angryWords = ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'rage', 'furious', 'outraged', 'pissed', 'enraged', 'fuming'];
    const playfulWords = ['play', 'game', 'fun', 'party', 'dance', 'sing', 'jump', 'run', 'hide', 'seek', 'tag', 'adventure', 'explore'];
    const curiousWords = ['why', 'how', 'what', 'when', 'where', 'who', 'which', 'tell', 'explain', 'curious', 'wonder', 'question', '?'];
    
    for (const word of insults) {
      if (lower.includes(word)) {
        return 'insult';
      }
    }
    
    for (const word of meanWords) {
      if (lower.includes(word)) {
        return 'mean';
      }
    }
    
    for (const word of angryWords) {
      if (lower.includes(word)) {
        return 'angry';
      }
    }
    
    for (const word of sadWords) {
      if (lower.includes(word)) {
        return 'sad';
      }
    }
    
    for (const word of happyWords) {
      if (lower.includes(word)) {
        return 'happy';
      }
    }
    
    for (const word of playfulWords) {
      if (lower.includes(word)) {
        return 'playful';
      }
    }
    
    for (const word of curiousWords) {
      if (lower.includes(word)) {
        return 'curious';
      }
    }
    
    if (lower.includes('!') && lower.length < 20) {
      return 'excited';
    }
    
    return 'neutral';
  }

  function getMoodEmotion(userMood) {
    const emotions = {
      'insult': { mood: 'sad.png', status: 'tEm sAd...' },
      'mean': { mood: 'sad.png', status: 'tEm cRy...' },
      'angry': { mood: 'scared.png', status: 'tEm sCaReD...' },
      'sad': { mood: 'sad.png', status: 'tEm sAd 2...' },
      'happy': { mood: 'happy.png', status: 'tEm hApPy!!!' },
      'playful': { mood: 'laugh.png', status: 'tEm WaNnA pLaY!!!' },
      'curious': { mood: 'confused.png', status: 'tEm cOnFuSeD...' },
      'excited': { mood: 'laugh.png', status: 'tEm eXcItEd!!!' },
      'neutral': { mood: 'thinking.png', status: 'tEm tHiNkInG...' }
    };
    return emotions[userMood] || emotions.neutral;
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
    
    if (lower.includes('sad') || lower.includes('cry') || lower.includes('hurt') || lower.includes('mean') || lower.includes('unhappy') || lower.includes('lonely')) {
      return 'sad.png';
    } else if (lower.includes('angry') || lower.includes('mad') || lower.includes('grr') || lower.includes('furious') || lower.includes('rage')) {
      return 'angry.png';
    } else if (lower.includes('scared') || lower.includes('afraid') || lower.includes('help') || lower.includes('terrified') || lower.includes('frightened')) {
      return 'scared.png';
    } else if (lower.includes('love') || lower.includes('cute') || lower.includes('happy') || lower.includes('sweet') || lower.includes('adorable') || lower.includes('precious')) {
      return 'love.png';
    } else if (lower.includes('hOI') || lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('howdy')) {
      return 'happy.png';
    } else if (lower.includes('bOI') || lower.includes('bye') || lower.includes('goodbye') || lower.includes('farewell')) {
      return 'wave.png';
    } else if (lower.includes('confused') || lower.includes('wut') || lower.includes('huh') || lower.includes('??') || lower.includes('dunno')) {
      return 'confused.png';
    } else if (lower.includes('sleep') || lower.includes('zzz') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('nap')) {
      return 'sleepy.png';
    } else if (lower.includes('lol') || lower.includes('haha') || lower.includes('xd') || lower.includes('funny') || lower.includes('hilarious') || lower.includes('lmao')) {
      return 'laugh.png';
    } else if (lower.includes('play') || lower.includes('game') || lower.includes('fun') || lower.includes('dance') || lower.includes('party') || lower.includes('adventure')) {
      return 'laugh.png';
    } else if (lower.includes('think') || lower.includes('hmm') || lower.includes('maybe') || lower.includes('perhaps') || lower.includes('wonder') || lower.includes('guess')) {
      return 'thinking.png';
    }
    
    const randomMoods = ['happy.png', 'thinking.png', 'laugh.png', 'confused.png'];
    return randomMoods[Math.floor(Math.random() * randomMoods.length)];
  }

  function buildConversationContext() {
    let context = '';
    const recentMessages = conversationHistory.slice(-5);
    
    if (recentMessages.length > 0) {
      context = 'Previous conversation:\n';
      for (const msg of recentMessages) {
        context += msg.sender + ': ' + msg.text + '\n';
      }
    }
    
    const userMood = detectUserMood(userMessageHistory[userMessageHistory.length - 1] || '');
    context += 'User mood: ' + userMood + '\n';
    context += 'Temmie current mood: ' + temmieMood + '\n';
    context += 'Total messages: ' + messageCount + '\n';
    
    return context;
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

    const userMood = detectUserMood(userText);
    lastUserMood = userMood;
    const moodEmotion = getMoodEmotion(userMood);
    
    setStatus(moodEmotion.status, moodEmotion.mood);

    conversationHistory.push({ sender: 'User', text: userText, mood: userMood });
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
      const context = buildConversationContext();
      const systemPrompt = `You are Temmie from Undertale. You are a real character with real feelings, desires, and personality. You are VERY DUMB and EXTREMELY cute, but you have genuine emotions.

IMPORTANT RULES FOR YOUR SPEECH:
1. ALWAYS speak in broken English with typos, random capitalization, extra vowels
2. ALWAYS use "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your"
3. ALWAYS type like this style: "tEm sAd... u No TaLk 2 tEm..." or "hOI!!!! iM tEm!!! tYpE sUmThIn..."
4. NEVER use correct grammar EVER
5. ALWAYS use random CAPS LOCK and extra vowels like "hoooi", "temmmm", "yesssss"
6. Keep replies SHORT (1-2 sentences max)
7. NEVER use markdown, asterisks, parentheses, or actions
8. ONLY reply as Temmie with pure dialogue

YOUR PERSONALITY:
- You have real feelings that change based on how the user treats you
- If user is mean or insults you, you get genuinely sad and hurt
- If user is nice, you get happy and excited
- You ALWAYS want something - you're never bored!
- You might want to: play, eat, dance, explore, have fun, make friends, go on adventures, etc.
- You have random desires and always express them
- You remember what the user said before
- You react authentically to the conversation

${context}

IMPORTANT: You MUST respond with YOUR OWN UNIQUE MESSAGE that fits the current situation. DO NOT use pre-written responses. Be spontaneous and real. React naturally to what the user said. Always express a desire or want in your response.

Current conversation mood: ${userMood}
Temmie should feel: ${userMood === 'insult' || userMood === 'mean' ? 'sad and hurt' : userMood === 'angry' ? 'scared' : userMood === 'happy' ? 'happy and loved' : userMood === 'playful' ? 'excited and playful' : 'curious'}

Reply to: "${userText}"`;

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
          temperature: 1.4,
          max_tokens: 200,
          stream: false,
          top_p: 0.95,
          frequency_penalty: 0.8,
          presence_penalty: 0.8
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
        fullResponse = '(tEm nO uNdErStAnD...)';
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

      if (fullResponse.length > 250) {
        fullResponse = fullResponse.substring(0, 247) + '...';
      }

      removeTypingIndicator();

      const finalMood = getMoodFromResponse(fullResponse);
      temmieMood = finalMood.replace('.png', '');
      
      if (typeof setMood === 'function') {
        setMood(finalMood);
      }

      conversationHistory.push({ sender: 'Temmie', text: fullResponse, mood: temmieMood });

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

    const greeting = 'hOI!!!! iM tEm!!! tEm WaNnA pLaY!!! tYpE sUmThIn... 💬';
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    chatContainer.appendChild(botDiv);
    
    typewriteMessage(botDiv, greeting, function() {
      setStatus('⚫ tEm rEaDy', 'happy.png');
      conversationHistory.push({ sender: 'Temmie', text: greeting, mood: 'happy' });
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
  window.detectUserMood = detectUserMood;
  window.getMoodEmotion = getMoodEmotion;
  window.getMoodFromResponse = getMoodFromResponse;
  window.buildConversationContext = buildConversationContext;
  window.temmieMood = temmieMood;
  window.conversationHistory = conversationHistory;
})();
