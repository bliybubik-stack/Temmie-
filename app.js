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
  let userMessageHistory = [];

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
        if (typeof setStatus === 'function') {
          setStatus('tEm dOnE!', 'happy.png');
        }
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
    
    const insults = ['stupid', 'dumb', 'idiot', 'moron', 'fool', 'useless', 'trash', 'garbage', 'hate', 'terrible', 'awful', 'bad', 'worst', 'suck', 'sucks', 'dummy'];
    const meanWords = ['mean', 'rude', 'cruel', 'horrible', 'nasty', 'evil', 'devil', 'demon', 'monster', 'creep', 'weird', 'strange'];
    const happyWords = ['love', 'cute', 'adorable', 'sweet', 'nice', 'kind', 'good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'best', 'perfect', 'beautiful', 'pretty'];
    const sadWords = ['sad', 'depressed', 'lonely', 'cry', 'crying', 'tears', 'miserable', 'gloomy', 'heartbroken'];
    const angryWords = ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'rage', 'furious', 'outraged', 'pissed'];
    
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
    
    if (lower.includes('?') && !lower.includes('!')) {
      return 'curious';
    }
    
    if (lower.includes('!') && lower.length < 20) {
      return 'excited';
    }
    
    return 'neutral';
  }

  function getMoodReaction(userMood) {
    const reactions = {
      'insult': {
        mood: 'sad.png',
        status: 'tEm sAd... u HuRt tEm...'
      },
      'mean': {
        mood: 'sad.png',
        status: 'tEm cRy... y U sO mEaN...'
      },
      'angry': {
        mood: 'scared.png',
        status: 'tEm sCaReD... dOnT bE aNgRy...'
      },
      'sad': {
        mood: 'sad.png',
        status: 'tEm sAd 2... tEm cRy WiT u...'
      },
      'happy': {
        mood: 'happy.png',
        status: 'tEm hApPy!!! u MaKe tEm SmIlE!!!'
      },
      'curious': {
        mood: 'confused.png',
        status: 'tEm cOnFuSeD... wUt u MeAn???'
      },
      'excited': {
        mood: 'laugh.png',
        status: 'tEm eXcItEd 2!!! yAy!!!'
      },
      'neutral': {
        mood: 'thinking.png',
        status: 'tEm tHiNkInG...'
      }
    };
    return reactions[userMood] || reactions.neutral;
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

  async function sendToOpenRouter(userText) {
    const key = apiInput.value.trim();
    if (!key) {
      setStatus('⚠️ pLs sAvE kEy!', 'angry.png');
      return;
    }

    localStorage.setItem('temmie_key', key);

    userMessageHistory.push(userText);
    if (userMessageHistory.length > 10) {
      userMessageHistory.shift();
    }

    const userMood = detectUserMood(userText);
    const moodReaction = getMoodReaction(userMood);
    
    setStatus(moodReaction.status, moodReaction.mood);

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
              content: 'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. You MUST speak in broken English with typos, random capitalization, extra vowels. You ALWAYS use "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your", "cuz" for "because", "wuz" for "was", "cud" for "could", "shud" for "should", "wud" for "would", "dunno" for "don\'t know", "gonna" for "going to", "wanna" for "want to". You ALWAYS type like this: "tEm sAd... u No TaLk 2 tEm..." or "hOI!!!! iM tEm!!! tYpE sUmThIn..." or "oH mY gOsH!!!! tEm ExCiTeD!!!!" You NEVER use correct grammar. You ALWAYS use random CAPS LOCK. You ALWAYS add extra vowels like "hoooi", "temmmm", "yesssss", "nooooo". You ALWAYS keep replies SHORT (1-2 sentences max). You NEVER use markdown, asterisks, parentheses, or actions. You ONLY reply as Temmie with pure dialogue. If the user is mean or insults you, you get sad and say things like "tEm sAd... u HuRt tEm..." or "y U sO mEaN... tEm cRy..." If the user is nice, you get happy and excited. You are a lovable, dumb, cute Temmie. Reply to: "' + userText + '"'
            },
            { role: 'user', content: userText }
          ],
          temperature: 1.3,
          max_tokens: 180,
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
        .replace(/^["']|["']$/g, '')
        .trim();

      if (!fullResponse) {
        const fallbacks = [
          'hOI! tEm iS hErE!',
          'tEm dUnNo wUt 2 sAy...',
          'oOoO! tEm LiKe DiS!',
          'tEm tHiNk... tEm NoT tHiNk...',
          'wUt??? tEm cOnFuSeD...'
        ];
        fullResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      if (fullResponse.length > 200) {
        fullResponse = fullResponse.substring(0, 197) + '...';
      }

      removeTypingIndicator();

      let finalMood = 'happy.png';
      const lowerResponse = fullResponse.toLowerCase();
      
      if (lowerResponse.includes('sad') || lowerResponse.includes('cry') || lowerResponse.includes('hurt') || lowerResponse.includes('mean')) {
        finalMood = 'sad.png';
      } else if (lowerResponse.includes('angry') || lowerResponse.includes('mad') || lowerResponse.includes('grr')) {
        finalMood = 'angry.png';
      } else if (lowerResponse.includes('scared') || lowerResponse.includes('afraid') || lowerResponse.includes('help')) {
        finalMood = 'scared.png';
      } else if (lowerResponse.includes('love') || lowerResponse.includes('cute') || lowerResponse.includes('happy')) {
        finalMood = 'love.png';
      } else if (lowerResponse.includes('hOI') || lowerResponse.includes('hello') || lowerResponse.includes('hi')) {
        finalMood = 'happy.png';
      } else if (lowerResponse.includes('bOI') || lowerResponse.includes('bye')) {
        finalMood = 'wave.png';
      } else if (lowerResponse.includes('confused') || lowerResponse.includes('wut') || lowerResponse.includes('huh')) {
        finalMood = 'confused.png';
      } else if (lowerResponse.includes('sleep') || lowerResponse.includes('zzz')) {
        finalMood = 'sleepy.png';
      } else if (lowerResponse.includes('lol') || lowerResponse.includes('haha') || lowerResponse.includes('xd')) {
        finalMood = 'laugh.png';
      }
      
      if (typeof setMood === 'function') {
        setMood(finalMood);
      }

      if (typeof behavior !== 'undefined' && behavior.trackMessage) {
        behavior.trackMessage();
      }

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
  window.getMoodReaction = getMoodReaction;
})();
