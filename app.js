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

  if (openRouterKey) apiInput.value = openRouterKey;

  function setMood(imageName) {
    moodImage.src = 'images/' + imageName;
    moodImage.alt = imageName.replace('.png', '');
  }

  function setStatus(text, mood) {
    statusText.textContent = text;
    if (mood) setMood(mood);
  }

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'msg ' + sender;
    div.textContent = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
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

    const charsPerSec = 18;
    const duration = Math.max(0.4, fullText.length / charsPerSec);

    const tl = gsap.timeline({
      onComplete: function() {
        const c = element.querySelector('.cursor-blink');
        if (c) c.remove();
        if (callback) callback();
        setStatus('tEm dOnE!', 'happy.png');
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
    setStatus('⏳ tEm tHiNkInG...', 'thinking.png');

    addMessage(userText, 'user');
    userInput.value = '';

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
            { role: 'system', content: 'You are Temmie from Undertale. You are VERY DUMB and cute. Speak in broken English with typos, random caps, extra vowels. Use "tem" for "me", "dis" for "this", "dat" for "that". Never use correct grammar. Keep replies short. NEVER use markdown, asterisks, or parentheses.' },
            { role: 'user', content: userText }
          ],
          temperature: 1.1,
          max_tokens: 180,
          stream: false
        })
      });

      if (!response.ok) {
        let errMsg = 'API error ' + response.status;
        try {
          const errJson = await response.json();
          if (errJson.error) errMsg = errJson.error.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        fullResponse = data.choices[0].message.content || '(tem sAiLEnCe...)';
      } else {
        fullResponse = '(tEm nO uNdErStAnD...)';
      }

      fullResponse = fullResponse.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\(/g, '').replace(/\)/g, '').trim();
      if (!fullResponse) fullResponse = 'hOI! tEm iS hErE!';

      const mood = getMoodFromResponse(fullResponse);
      setMood(mood);

      botMsgDiv.textContent = '';
      typewriteMessage(botMsgDiv, fullResponse, function() {
        isProcessing = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
        setStatus('⚫ tEm rEaDy', 'happy.png');
        currentBotMessageEl = null;
      });

    } catch (err) {
      const errorText = '⚠️ tEm eRrOr: ' + (err.message || 'unknown');
      if (currentBotMessageEl) {
        currentBotMessageEl.textContent = errorText;
      } else {
        addMessage(errorText, 'bot');
      }
      setStatus('❌ tEm fAiL...', 'angry.png');
      isProcessing = false;
      sendBtn.disabled = false;
      userInput.disabled = false;
      currentBotMessageEl = null;
    }
  }

  function handleSend() {
    if (isProcessing) return;
    const text = userInput.value.trim();
    if (!text) return;
    sendToOpenRouter(text);
  }

  sendBtn.addEventListener('click', handleSend);

  userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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

  const saved = localStorage.getItem('temmie_key');
  if (saved) apiInput.value = saved;

  window.addEventListener('load', function() {
    const greeting = 'hOI!!!! iM tEm!!!  tYpE sUmThIn...  💬';
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    chatContainer.appendChild(botDiv);
    typewriteMessage(botDiv, greeting, function() {
      setStatus('⚫ tEm rEaDy', 'happy.png');
    });
  });

  window.addEventListener('beforeunload', function() {
    if (typewriterTimeline) typewriterTimeline.kill();
  });

  const moods = ['happy.png', 'thinking.png', 'angry.png', 'sad.png', 'laugh.png', 'confused.png', 'sleepy.png', 'scared.png', 'love.png', 'wave.png', 'typing.png'];
  let moodIndex = 0;

  setInterval(function() {
    if (!isProcessing) {
      moodIndex = (moodIndex + 1) % moods.length;
      setMood(moods[moodIndex]);
    }
  }, 8000);

})();
