(function() {
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const statusText = document.getElementById('statusText');
  const moodImage = document.getElementById('moodImage');
  const apiInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveKeyBtn');

  let messageCount = 0;
  let lastMessageTime = Date.now();
  let isProcessing = false;
  let typingTimeout = null;
  let idleInterval = null;
  let behaviorInterval = null;
  let moodRotationInterval = null;
  let currentMoodIndex = 0;
  let isFirstMessage = true;
  let conversationHistory = [];
  let userTypingTimer = null;
  let botResponseTimer = null;

  const moodImages = [
    'happy.png', 'thinking.png', 'angry.png', 'sad.png', 
    'laugh.png', 'confused.png', 'sleepy.png', 'scared.png', 
    'love.png', 'wave.png', 'typing.png'
  ];

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

  function setStatus(text, mood) {
    statusText.textContent = text;
    if (mood) {
      setMood(mood);
    }
    
    gsap.to(statusText, {
      opacity: 0.7,
      duration: 0.1,
      onComplete: function() {
        gsap.to(statusText, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    });
  }

  function updateBehavior() {
    const now = Date.now();
    const timeSinceLast = (now - lastMessageTime) / 1000;
    const idleTime = timeSinceLast;

    if (isProcessing) {
      return;
    }

    if (messageCount === 0 && idleTime > 20) {
      setStatus('tEm iS bOrEd... pLaY wItH tEm?', 'sleepy.png');
    } else if (messageCount === 0 && idleTime > 40) {
      setStatus('zZz... tEm fElL aSlEeP... zZz', 'sleepy.png');
    } else if (messageCount === 0 && idleTime > 60) {
      setStatus('hOI!!! wAkE uP!!! tEm mIsS u!!!', 'happy.png');
      lastMessageTime = now;
    } else if (messageCount > 0 && messageCount < 3 && idleTime > 15) {
      setStatus('tEm wAiT fOr MeSsAgE...', 'thinking.png');
    } else if (messageCount > 2 && messageCount < 6 && idleTime > 20) {
      setStatus('tEm sAd... u No TaLk 2 tEm...', 'sad.png');
    } else if (messageCount > 5 && idleTime > 25) {
      setStatus('tEm gOnA cRy... tEm lOnElY...', 'cry.png');
    } else if (messageCount > 8 && idleTime > 30) {
      setStatus('tEm tHiNk U fOrGoT tEm...', 'sad.png');
    } else if (idleTime > 10 && idleTime < 15) {
      const randomMood = ['thinking.png', 'confused.png', 'happy.png'];
      setStatus('tEm iS hErE...', randomMood[Math.floor(Math.random() * randomMood.length)]);
    }

    if (idleTime > 5 && idleTime < 10 && Math.random() > 0.7) {
      const randomPhrases = [
        'hOI!!!',
        'tEm hErE!!!',
        'wUtS uP???',
        'tEm wAnT tAlK!!!',
        'pLaY wItH tEm!!!'
      ];
      setStatus(randomPhrases[Math.floor(Math.random() * randomPhrases.length)], 'happy.png');
    }
  }

  function rotateMood() {
    if (isProcessing) return;
    if (document.hidden) return;
    
    currentMoodIndex = (currentMoodIndex + 1) % moodImages.length;
    const mood = moodImages[currentMoodIndex];
    
    if (Math.random() > 0.3) {
      setMood(mood);
    }
  }

  function handleUserTyping() {
    if (isProcessing) return;
    
    clearTimeout(userTypingTimer);
    setStatus('tEm sEeS u TyPiNg...', 'typing.png');
    
    userTypingTimer = setTimeout(function() {
      if (!isProcessing) {
        const randomStatus = [
          'tEm wAiT...',
          'tEm pAtIeNt...',
          'tEm nO rUsH...',
          'tEm cAn WaIt...',
          'tEm sItTiNg...'
        ];
        setStatus(randomStatus[Math.floor(Math.random() * randomStatus.length)], 'thinking.png');
      }
    }, 2000);
  }

  function handleUserFocus() {
    if (isProcessing) return;
    if (messageCount === 0) {
      setStatus('hOI!!! tEm rEaDy 2 pLaY!!!', 'happy.png');
    } else if (messageCount > 2 && messageCount < 5) {
      setStatus('tEm hApPy 2 sEe U!!!', 'laugh.png');
    } else if (messageCount > 5) {
      setStatus('tEm bEsT fRiEnD!!!', 'love.png');
    }
  }

  function handleUserBlur() {
    if (isProcessing) return;
    setTimeout(function() {
      if (!document.activeElement || document.activeElement !== userInput) {
        setStatus('tEm wAiT...', 'thinking.png');
      }
    }, 3000);
  }

  function trackMessage() {
    messageCount++;
    lastMessageTime = Date.now();
    isFirstMessage = false;
    
    conversationHistory.push({
      time: new Date().toISOString(),
      count: messageCount
    });
    
    if (conversationHistory.length > 50) {
      conversationHistory.shift();
    }
  }

  function getConversationStats() {
    const now = Date.now();
    const recentMessages = conversationHistory.filter(function(msg) {
      return (now - new Date(msg.time).getTime()) < 60000;
    });
    
    return {
      total: messageCount,
      recent: recentMessages.length,
      first: isFirstMessage
    };
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'msg bot typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatContainer.appendChild(indicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return indicator;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function getTemmieEnergy() {
    const stats = getConversationStats();
    if (stats.recent > 5) return 'hyper';
    if (stats.recent > 3) return 'excited';
    if (stats.recent > 1) return 'happy';
    if (stats.total < 3) return 'shy';
    return 'normal';
  }

  function getTemmieResponseStyle(energy) {
    const styles = {
      'hyper': {
        exclamation: '!!!',
        extraVowels: 3,
        capsChance: 0.8
      },
      'excited': {
        exclamation: '!!',
        extraVowels: 2,
        capsChance: 0.6
      },
      'happy': {
        exclamation: '!',
        extraVowels: 1,
        capsChance: 0.4
      },
      'shy': {
        exclamation: '...',
        extraVowels: 0,
        capsChance: 0.2
      },
      'normal': {
        exclamation: '!',
        extraVowels: 1,
        capsChance: 0.5
      }
    };
    return styles[energy] || styles.normal;
  }

  function addEmotionToText(text, energy) {
    const style = getTemmieResponseStyle(energy);
    let result = text;
    
    if (Math.random() < style.capsChance) {
      const words = result.split(' ');
      const randomIndex = Math.floor(Math.random() * words.length);
      if (words[randomIndex]) {
        const word = words[randomIndex];
        let newWord = '';
        for (let i = 0; i < word.length; i++) {
          if (Math.random() > 0.5) {
            newWord += word[i].toUpperCase();
          } else {
            newWord += word[i].toLowerCase();
          }
        }
        words[randomIndex] = newWord;
        result = words.join(' ');
      }
    }
    
    if (style.extraVowels > 0 && Math.random() > 0.5) {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const words = result.split(' ');
      const randomIndex = Math.floor(Math.random() * words.length);
      if (words[randomIndex]) {
        let word = words[randomIndex];
        for (let i = 0; i < word.length; i++) {
          if (vowels.includes(word[i].toLowerCase()) && Math.random() > 0.7) {
            word = word.slice(0, i + 1) + word[i].repeat(style.extraVowels) + word.slice(i + 1);
            break;
          }
        }
        words[randomIndex] = word;
        result = words.join(' ');
      }
    }
    
    if (!result.endsWith('!') && !result.endsWith('?') && !result.endsWith('...')) {
      result += style.exclamation;
    }
    
    return result;
  }

  function getTemmieGreeting() {
    const greetings = [
      'hOI!!!! tEm hErE!!!',
      'hElLo!!! iM tEm!!!',
      'hOI!!!! wUtS uP???',
      'hEy!!!! tEm Is HeRe!!!',
      'hOI!!!! tEm WaS wAiTiNg!!!',
      'hElLo!!!! tEm MiSsEd U!!!'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  function getTemmieFarewell() {
    const farewells = [
      'bOI!!!! tAkE cArE!!!',
      'gOoDbYe!!!! tEm WiLl MiSs U!!!',
      'bOI!!!! cOmE bAcK sOoN!!!',
      'sEe Ya!!!! tEm LoVe U!!!',
      'bOI!!!! tEm GoTtA gO!!!'
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  function getTemmieConfusion() {
    const confusions = [
      'wUt??? tEm No UnDeRsTaNd...',
      'hUh??? tEm CoNfUsEd...',
      'wHaT??? tEm DuMb...',
      'oH??? tEm No GeT iT...',
      'wUt??? tEm NeEd HeLp...'
    ];
    return confusions[Math.floor(Math.random() * confusions.length)];
  }

  function getTemmieExcitement() {
    const excitements = [
      'oH mY gOsH!!!! tEm ExCiTeD!!!!',
      'wOw!!!! tEm HaPpY!!!!',
      'yAy!!!! tEm LoVe DiS!!!!',
      'aAaA!!!! tEm GoInG cRaZy!!!!',
      'sQuEe!!!! tEm So HaPpY!!!!'
    ];
    return excitements[Math.floor(Math.random() * excitements.length)];
  }

  window.addEventListener('load', function() {
    behaviorInterval = setInterval(updateBehavior, 5000);
    moodRotationInterval = setInterval(rotateMood, 8000);
    
    userInput.addEventListener('input', handleUserTyping);
    userInput.addEventListener('focus', handleUserFocus);
    userInput.addEventListener('blur', handleUserBlur);
    
    const greeting = 'hOI!!!! iM tEm!!! tYpE sUmThIn... 💬';
    const botDiv = document.createElement('div');
    botDiv.className = 'msg bot';
    chatContainer.appendChild(botDiv);
    
    if (typeof typewriteMessage === 'function') {
      typewriteMessage(botDiv, greeting, function() {
        setStatus('⚫ tEm rEaDy', 'happy.png');
      });
    } else {
      botDiv.textContent = greeting;
      setStatus('⚫ tEm rEaDy', 'happy.png');
    }
  });

  window.addEventListener('beforeunload', function() {
    if (behaviorInterval) clearInterval(behaviorInterval);
    if (moodRotationInterval) clearInterval(moodRotationInterval);
    if (userTypingTimer) clearTimeout(userTypingTimer);
    if (typingTimeout) clearTimeout(typingTimeout);
    if (botResponseTimer) clearTimeout(botResponseTimer);
  });

  window.behavior = {
    trackMessage: trackMessage,
    getConversationStats: getConversationStats,
    getTemmieEnergy: getTemmieEnergy,
    getTemmieResponseStyle: getTemmieResponseStyle,
    addEmotionToText: addEmotionToText,
    getTemmieGreeting: getTemmieGreeting,
    getTemmieFarewell: getTemmieFarewell,
    getTemmieConfusion: getTemmieConfusion,
    getTemmieExcitement: getTemmieExcitement,
    showTypingIndicator: showTypingIndicator,
    removeTypingIndicator: removeTypingIndicator,
    setStatus: setStatus,
    setMood: setMood,
    updateBehavior: updateBehavior
  };
})();
