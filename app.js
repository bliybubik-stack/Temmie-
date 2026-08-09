(function() {
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const apiInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveKeyBtn');
  const statusText = document.getElementById('statusText');
  const moodImage = document.getElementById('moodImage');
  const moodLabel = document.getElementById('moodLabel');
  const temName = document.getElementById('temName');

  let openRouterKey = localStorage.getItem('temmie_key') || '';
  let isProcessing = false;
  let currentBotMessageEl = null;
  let typewriterTimeline = null;
  let messageQueue = [];
  let isQueueProcessing = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  let temmiePersonality = {
    energy: 100,
    happiness: 100,
    anger: 0,
    sadness: 0,
    love: 50
  };

  if (openRouterKey) apiInput.value = openRouterKey;

  function setStatus(text, mood) {
    statusText.textContent = text;
    if (mood && typeof setMood === 'function') {
      setMood(mood);
    }
  }

  function scrollToBottom() {
    setTimeout(function() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
  }

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'msg ' + sender + ' message-enter msg-pop';
    div.textContent = text;
    chatContainer.appendChild(div);
    scrollToBottom();
    
    gsap.from(div, {
      opacity: 0,
      y: 15,
      scale: 0.9,
      duration: 0.35,
      ease: "back.out(1.7)"
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

    const charsPerSec = 25;
    const duration = Math.max(0.4, fullText.length / charsPerSec);

    const tl = gsap.timeline({
      onComplete: function() {
        const c = element.querySelector('.cursor-blink');
        if (c) c.remove();
        if (callback) callback();
        if (typeof setStatus === 'function') {
          setStatus('tEm dOnE!', 'happy.png');
        }
        scrollToBottom();
      }
    });

    tl.call(function() {
      cursorSpan.style.animation = 'none';
      cursorSpan.style.opacity = '1';
      scrollToBottom();
    }, [], 0);

    tl.to(textSpan, {
      duration: duration,
      text: { value: fullText },
      ease: 'none',
      onUpdate: function() {
        scrollToBottom();
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
    scrollToBottom();
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
          scrollToBottom();
        }
      });
    }
  }

  function detectUserMood(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('hate') || lower.includes('stupid') || lower.includes('dumb') || lower.includes('annoying') || lower.includes('useless') || lower.includes('terrible') || lower.includes('awful') || lower.includes('bad') || lower.includes('mean') || lower.includes('rude') || lower.includes('ugly') || lower.includes('dummy') || lower.includes('idiot')) {
      return 'angry';
    }
    
    if (lower.includes('love') || lower.includes('cute') || lower.includes('adorable') || lower.includes('sweet') || lower.includes('nice') || lower.includes('good') || lower.includes('great') || lower.includes('amazing') || lower.includes('awesome') || lower.includes('best') || lower.includes('cool') || lower.includes('happy')) {
      return 'love';
    }
    
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || lower.includes('annoyed') || lower.includes('irritated') || lower.includes('rage') || lower.includes('grr') || lower.includes('>')) {
      return 'angry';
    }
    
    if (lower.includes('?') || lower.includes('what') || lower.includes('huh') || lower.includes('confused') || lower.includes('why') || lower.includes('how') || lower.includes('when') || lower.includes('where') || lower.includes('who')) {
      return 'confused';
    }
    
    if (lower.includes('lol') || lower.includes('haha') || lower.includes('funny') || lower.includes('joke') || lower.includes('xd') || lower.includes(':D') || lower.includes('hilarious')) {
      return 'laugh';
    }
    
    if (lower.includes('sad') || lower.includes('cry') || lower.includes('depressed') || lower.includes('lonely') || lower.includes('miss') || lower.includes(':(') || lower.includes('crying')) {
      return 'sad';
    }
    
    if (lower.includes('scared') || lower.includes('afraid') || lower.includes('frightened') || lower.includes('panic') || lower.includes('worried') || lower.includes('nervous')) {
      return 'scared';
    }
    
    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('zzz') || lower.includes('nap') || lower.includes('bed')) {
      return 'sleepy';
    }
    
    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see ya') || lower.includes('later') || lower.includes('farewell')) {
      return 'wave';
    }
    
    return 'happy';
  }

  function getMoodImageFromMood(mood) {
    const moodMap = {
      'happy': 'happy.png',
      'laugh': 'laugh.png',
      'love': 'love.png',
      'thinking': 'thinking.png',
      'confused': 'confused.png',
      'sad': 'sad.png',
      'angry': 'angry.png',
      'scared': 'scared.png',
      'sleepy': 'sleepy.png',
      'wave': 'wave.png',
      'typing': 'typing.png'
    };
    return moodMap[mood] || 'happy.png';
  }

  function getMoodFromResponse(text) {
    const lower = text.toLowerCase();
    
    const moodMap = {
      'happy': ['hOI', 'hi', 'hey', 'hello', 'yay', 'yess', 'good', 'great', 'awesome', 'love', 'cute', 'fun', 'nice', 'cool', 'wow', 'omg', 'lol', 'haha', 'xd', ':)', ':D', '^_^', 'happy', 'excited', 'amazing', 'wonderful', 'fantastic', 'glad', 'cheer'],
      'laugh': ['lol', 'haha', 'hehe', 'xd', 'funny', 'hilarious', 'joke', 'lmao', 'rofl', ':D', 'xD', 'laughing', 'cracking', 'dying', 'lolol'],
      'love': ['love', 'heart', 'cute', 'adorable', 'sweet', 'hug', 'kiss', '<3', 'darling', 'baby', 'precious', 'beautiful', 'gorgeous', 'care', 'miss u'],
      'thinking': ['think', 'hmm', 'maybe', 'perhaps', 'wonder', 'guess', 'suppose', 'probably', '?', 'what', 'huh', 'confused', 'consider', 'ponder', 'let me think'],
      'confused': ['what', 'huh', 'confused', 'wut', '??', '???', 'hmm', 'wait', 'really', 'seriously', 'unclear', 'lost', 'perplexed', 'dunno', 'no understand'],
      'sad': ['sad', 'cry', ':-(', ':(', 'depressed', 'lonely', 'miss', 'sorry', 'apologize', 'regret', 'oh no', 'poor', 'unhappy', 'miserable', 'gloomy', 'hurt', 'pain'],
      'angry': ['angry', 'mad', 'grr', '>:-(', '>:(', 'frustrated', 'annoyed', 'irritated', 'rage', 'upset', 'grrr', 'furious', 'enraged', 'livid', 'fight', 'mean', 'rude', 'stop', 'no'],
      'scared': ['scared', 'afraid', 'frightened', 'terrified', 'horrified', 'panic', 'anxious', 'nervous', 'worried', 'oh no', 'help', 'spooked', 'petrified', 'fear'],
      'sleepy': ['sleep', 'tired', 'exhausted', 'zzz', 'bed', 'nap', 'rest', 'yawn', 'dream', 'goodnight', 'slumber', 'dozing', 'drowsy', 'sleepy'],
      'wave': ['bye', 'goodbye', 'see ya', 'later', 'farewell', 'cya', 'adios', 'bOI', 'leave', 'going', 'depart', 'peace out', 'catch u later']
    };

    for (const [mood, keywords] of Object.entries(moodMap)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          return mood;
        }
      }
    }

    const randomMoods = ['happy', 'thinking', 'laugh', 'love'];
    return randomMoods[Math.floor(Math.random() * randomMoods.length)];
  }

  function mixCase(text) {
    let result = '';
    let upper = Math.random() > 0.5;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-zA-Z]/)) {
        if (upper) {
          result += char.toUpperCase();
        } else {
          result += char.toLowerCase();
        }
        if (Math.random() > 0.6) {
          upper = !upper;
        }
      } else {
        result += char;
      }
    }
    return result;
  }

  function setMoodFromMessage(message) {
    const mood = detectUserMood(message);
    const moodImageName = getMoodImageFromMood(mood);
    
    if (typeof setMood === 'function') {
      setMood(moodImageName);
    }
    
    if (moodLabel) {
      moodLabel.textContent = mood;
    }
    
    const statusMessages = {
      'happy': 'tEm hApPy!!! u mAkE tEm SmIlE!!!',
      'laugh': 'tEm lAuGh!!! u fUnNy!!!',
      'love': 'tEm lOvE u!!! <3',
      'thinking': 'tEm tHiNk... wUt u MeAn???',
      'confused': 'tEm cOnFuSeD... wUt???',
      'sad': 'tEm sAd... u hUrT tEm... :(',
      'angry': 'tEm aNgRy!!! u MaKe tEm MaD!!! >:(',
      'scared': 'tEm sCaReD!!! pRoTeCt TeM!!!',
      'sleepy': 'tEm sLeEpY... zZz...',
      'wave': 'tEm sAy gOoDbYe... bOI!!!'
    };
    
    setStatus(statusMessages[mood] || 'tEm rEaDy!', moodImageName);
    
    return mood;
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

  async function sendToOpenRouter(userText) {
    const key = apiInput.value.trim();
    if (!key) {
      setStatus('⚠️ pLs sAvE kEy!', 'angry.png');
      return;
    }

    localStorage.setItem('temmie_key', key);

    isProcessing = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    
    const userMood = setMoodFromMessage(userText);
    
    if (userMood === 'sad' || userMood === 'angry') {
      if (typeof behavior !== 'undefined' && behavior.updateTemmieStats) {
        behavior.updateTemmieStats(userText);
      }
    }

    addMessage(userText, 'user');
    userInput.value = '';
    scrollToBottom();

    if (typeof showTypingIndicator === 'function') {
      showTypingIndicator();
    }

    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'msg bot';
    chatContainer.appendChild(botMsgDiv);
    currentBotMessageEl = botMsgDiv;
    scrollToBottom();

    let fullResponse = '';

    try {
      const prompt = typeof buildTemPrompt === 'function' ? buildTemPrompt(userText) : '';
      
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
              content: 'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. Speak in broken English with random mixed uppercase and lowercase letters (LiKe ThIs or tHiS wAy). Use "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your", "cuz" for "because", "wuz" for "was", "cud" for "could", "shud" for "should", "wud" for "would". Always use "hOI" for hello and "bOI" for goodbye. Make spelling mistakes on purpose. Use "wut" instead of "what". Add extra vowels like "hoooi", "temmmm", "yessss". Never use proper grammar. Keep replies short (1-2 sentences). NEVER use markdown, asterisks, parentheses, or actions. Only reply as Temmie with pure dialogue. If the user is mean to you, act sad or angry and fight back. If the user is nice, act happy and loving. Always respond with random mixed case like ThIs.' 
            },
            { role: 'user', content: userText }
          ],
          temperature: 1.3,
          max_tokens: 200,
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
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!fullResponse) {
        fullResponse = 'hOI! tEm iS hErE!';
      }

      if (fullResponse.length > 200) {
        fullResponse = fullResponse.substring(0, 197) + '...';
      }

      removeTypingIndicator();

      const mood = getMoodFromResponse(fullResponse);
      const moodImageName = getMoodImageFromMood(mood);
      
      if (typeof setMood === 'function') {
        setMood(moodImageName);
      }
      
      if (moodLabel) {
        moodLabel.textContent = mood;
      }

      if (typeof behavior !== 'undefined' && behavior.trackMessage) {
        behavior.trackMessage();
      }

      if (typeof behavior !== 'undefined' && behavior.updateTemmieStats) {
        behavior.updateTemmieStats(fullResponse);
      }

      botMsgDiv.textContent = '';
      typewriteMessage(botMsgDiv, fullResponse, function() {
        isProcessing = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        scrollToBottom();
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
        scrollToBottom();
      } else {
        addMessage(errorText, 'bot');
      }
      
      setStatus('❌ tEm fAiL...', 'angry.png');
      isProcessing = false;
      sendBtn.disabled = false;
      userInput.disabled = false;
      currentBotMessageEl = null;
      retryCount = 0;
      scrollToBottom();
      
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

    if (typeof behavior !== 'undefined' && behavior.trackMessage) {
      behavior.trackMessage();
    }

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

    const greeting = 'hOI!!!! iM tEm!!! tYpE sUmThIn... 💬';
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    chatContainer.appendChild(botDiv);
    
    typewriteMessage(botDiv, greeting, function() {
      setStatus('⚫ tEm rEaDy', 'happy.png');
      scrollToBottom();
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
  window.scrollToBottom = scrollToBottom;
  window.detectUserMood = detectUserMood;
  window.getMoodFromResponse = getMoodFromResponse;
  window.setMoodFromMessage = setMoodFromMessage;
  window.getMoodImageFromMood = getMoodImageFromMood;
  window.mixCase = mixCase;
})();
