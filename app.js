(function() {
  const chatContainer = document.getElementById('chatContainer');
  const chatWrapper = document.querySelector('.chat-wrapper');
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
  let messageCount = 0;
  let lastScrollHeight = 0;
  let autoScrollEnabled = true;
  let userScrolledUp = false;
  let scrollTimeout = null;

  if (openRouterKey) apiInput.value = openRouterKey;

  function setStatus(text, mood) {
    statusText.textContent = text;
    if (mood && typeof setMood === 'function') {
      setMood(mood);
    }
  }

  function setMood(imageName) {
    if (!imageName) return;
    moodImage.src = 'images/' + imageName;
    moodImage.alt = imageName.replace('.png', '');
    moodImage.style.transition = 'all 0.3s ease';
    
    gsap.to(moodImage, {
      scale: 0.9,
      duration: 0.15,
      ease: "power2.out",
      onComplete: function() {
        gsap.to(moodImage, {
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.7)"
        });
      }
    });
  }

  function scrollToBottom(smooth = true) {
    if (!autoScrollEnabled || userScrolledUp) return;
    
    const wrapper = chatWrapper;
    const targetScroll = wrapper.scrollHeight - wrapper.clientHeight;
    
    if (smooth) {
      gsap.to(wrapper, {
        scrollTop: targetScroll,
        duration: 0.4,
        ease: "power2.out",
        onComplete: function() {
          lastScrollHeight = wrapper.scrollHeight;
        }
      });
    } else {
      wrapper.scrollTop = targetScroll;
      lastScrollHeight = wrapper.scrollHeight;
    }
  }

  function handleScroll() {
    const wrapper = chatWrapper;
    const isAtBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight < 10;
    
    if (isAtBottom) {
      userScrolledUp = false;
      autoScrollEnabled = true;
    } else {
      userScrolledUp = true;
      autoScrollEnabled = false;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        userScrolledUp = false;
        autoScrollEnabled = true;
        scrollToBottom(true);
      }, 5000);
    }
  }

  function addMessage(text, sender, mood = null) {
    messageCount++;
    
    const container = document.createElement('div');
    container.className = 'msg-container';
    
    const div = document.createElement('div');
    div.className = 'msg ' + sender + ' message-enter';
    div.textContent = text;
    
    if (sender === 'bot' && mood) {
      div.classList.add('tem-' + mood);
    }
    
    const time = document.createElement('span');
    time.className = 'msg-time';
    const now = new Date();
    time.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    div.appendChild(time);
    
    container.appendChild(div);
    chatContainer.appendChild(container);
    
    setTimeout(function() {
      scrollToBottom(true);
    }, 50);
    
    gsap.from(div, {
      opacity: 0,
      y: 12,
      scale: 0.96,
      duration: 0.3,
      ease: "power2.out"
    });
    
    return div;
  }

  function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'msg bot typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatContainer.appendChild(indicator);
    
    setTimeout(function() {
      scrollToBottom(true);
    }, 50);
    
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

  function typewriteMessage(element, fullText, callback) {
    if (typewriterTimeline) {
      typewriterTimeline.kill();
      typewriterTimeline = null;
    }

    const oldCursor = element.querySelector('.cursor-blink');
    if (oldCursor) oldCursor.remove();

    const textSpan = document.createElement('span');
    textSpan.className = 'typewriter-text';
    element.prepend(textSpan);

    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor-blink';
    element.prepend(cursorSpan);

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
        setStatus('tEm dOnE!', 'happy.png');
        scrollToBottom(true);
      },
      onUpdate: function() {
        scrollToBottom(true);
      }
    });

    tl.call(function() {
      cursorSpan.style.animation = 'none';
      cursorSpan.style.opacity = '1';
    }, [], 0);

    tl.to(textSpan, {
      duration: duration,
      text: { value: fullText },
      ease: 'none'
    }, 0);

    typewriterTimeline = tl;
    return tl;
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

  function getEmotionalMood(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('stupid') || lower.includes('dumb') || lower.includes('idiot') || 
        lower.includes('hate') || lower.includes('ugly') || lower.includes('useless') ||
        lower.includes('terrible') || lower.includes('awful') || lower.includes('horrible') ||
        lower.includes('annoying') || lower.includes('dumbass') || lower.includes('moron')) {
      return 'sad';
    }
    
    if (lower.includes('love') || lower.includes('cute') || lower.includes('adorable') || 
        lower.includes('sweet') || lower.includes('kind') || lower.includes('nice') ||
        lower.includes('beautiful') || lower.includes('amazing') || lower.includes('wonderful') ||
        lower.includes('great') || lower.includes('awesome')) {
      return 'love';
    }
    
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || 
        lower.includes('grr') || lower.includes('>:(') || lower.includes('rage')) {
      return 'angry';
    }
    
    if (lower.includes('?') && !lower.includes('!')) {
      return 'confused';
    }
    
    if (lower.includes('!!') || lower.includes('excited') || lower.includes('wow') || 
        lower.includes('yay') || lower.includes('awesome') || lower.includes('amazing')) {
      return 'excited';
    }
    
    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you') || 
        lower.includes('later') || lower.includes('farewell')) {
      return 'wave';
    }
    
    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('zzz') || 
        lower.includes('exhausted') || lower.includes('nap')) {
      return 'sleepy';
    }
    
    if (lower.includes('scared') || lower.includes('afraid') || lower.includes('frightened') || 
        lower.includes('terrified') || lower.includes('horrified') || lower.includes('panic')) {
      return 'scared';
    }
    
    return 'happy';
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
    
    const mood = getEmotionalMood(userText);
    const moodImageMap = {
      'sad': 'sad.png',
      'love': 'love.png',
      'angry': 'angry.png',
      'confused': 'confused.png',
      'excited': 'laugh.png',
      'wave': 'wave.png',
      'sleepy': 'sleepy.png',
      'scared': 'scared.png',
      'happy': 'happy.png'
    };
    
    setStatus('⏳ tEm tHiNkInG...', moodImageMap[mood] || 'thinking.png');

    const userMsgDiv = addMessage(userText, 'user');
    
    if (typeof behavior !== 'undefined' && behavior.trackMessage) {
      behavior.trackMessage();
    }

    userInput.value = '';

    const typingIndicator = addTypingIndicator();

    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'msg bot';
    chatContainer.appendChild(botMsgDiv);
    currentBotMessageEl = botMsgDiv;

    let fullResponse = '';

    try {
      const prompt = typeof buildTemPrompt === 'function' ? buildTemPrompt(userText) : 
        'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. Speak in broken English with typos, random caps, extra vowels. Use "tem" for "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your". Never use correct grammar. Keep replies short. NEVER use markdown, asterisks, or parentheses. Only reply as Temmie with pure dialogue. Respond to: "' + userText + '"';

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
              content: 'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. Speak in broken English with typos, random caps, extra vowels. Use "tem" for "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your". Never use correct grammar. Keep replies short (1-2 sentences). NEVER use markdown, asterisks, or parentheses. Only reply as Temmie with pure dialogue. If user is mean, respond with sadness. If user is nice, respond with love and happiness.' 
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
        .trim();

      if (!fullResponse) {
        fullResponse = 'hOI! tEm iS hErE!';
      }

      if (fullResponse.length > 200) {
        fullResponse = fullResponse.substring(0, 197) + '...';
      }

      removeTypingIndicator();

      const responseMood = typeof getMoodFromResponse === 'function' ? getMoodFromResponse(fullResponse) : 'happy.png';
      if (typeof setMood === 'function') {
        setMood(responseMood);
      }

      const emotionalClass = getEmotionalMood(fullResponse);
      botMsgDiv.classList.add('tem-' + emotionalClass);

      const timeSpan = document.createElement('span');
      timeSpan.className = 'msg-time';
      const now = new Date();
      timeSpan.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                            now.getMinutes().toString().padStart(2, '0');
      
      botMsgDiv.textContent = '';
      botMsgDiv.appendChild(timeSpan);
      
      typewriteMessage(botMsgDiv, fullResponse, function() {
        isProcessing = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        setStatus('⚫ tEm rEaDy', 'happy.png');
        currentBotMessageEl = null;
        retryCount = 0;
        
        scrollToBottom(true);
        
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

  chatWrapper.addEventListener('scroll', handleScroll);

  sendBtn.addEventListener('click', handleSend);

  userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.repeat) return;
      handleSend();
    }
  });

  userInput.addEventListener('input', function() {
    if (typeof handleUserTyping === 'function') {
      handleUserTyping();
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
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'msg-time';
    const now = new Date();
    timeSpan.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
    botDiv.appendChild(timeSpan);
    
    typewriteMessage(botDiv, greeting, function() {
      setStatus('⚫ tEm rEaDy', 'happy.png');
      scrollToBottom(true);
    });
    
    setTimeout(function() {
      scrollToBottom(true);
    }, 100);
  });

  window.addEventListener('beforeunload', function() {
    if (typewriterTimeline) {
      typewriterTimeline.kill();
      typewriterTimeline = null;
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  });

  window.sendToOpenRouter = sendToOpenRouter;
  window.handleSend = handleSend;
  window.addMessage = addMessage;
  window.typewriteMessage = typewriteMessage;
  window.setStatus = setStatus;
  window.setMood = setMood;
  window.addTypingIndicator = addTypingIndicator;
  window.removeTypingIndicator = removeTypingIndicator;
  window.processQueue = processQueue;
  window.scrollToBottom = scrollToBottom;
  window.getEmotionalMood = getEmotionalMood;
})();
