(function() {
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const statusText = document.getElementById('statusText');
  const moodImage = document.getElementById('moodImage');
  const apiInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveKeyBtn');
  const heartIcon = document.getElementById('heartIcon');
  const energyIcon = document.getElementById('energyIcon');
  const moodLabel = document.getElementById('moodLabel');
  const temName = document.getElementById('temName');

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
  let temmieEnergy = 100;
  let temmieHappiness = 100;
  let temmieAnger = 0;
  let temmieSadness = 0;
  let temmieLove = 50;

  const moodImages = [
    'happy.png', 'thinking.png', 'angry.png', 'sad.png', 
    'laugh.png', 'confused.png', 'sleepy.png', 'scared.png', 
    'love.png', 'wave.png', 'typing.png'
  ];

  function setMood(imageName) {
    if (!imageName) return;
    moodImage.src = 'images/' + imageName;
    moodImage.alt = imageName.replace('.png', '');
    moodImage.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    const mood = imageName.replace('.png', '');
    moodLabel.textContent = mood;
    
    gsap.to(moodImage, {
      scale: 0.8,
      rotation: -5,
      duration: 0.15,
      ease: "power2.out",
      onComplete: function() {
        gsap.to(moodImage, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    });

    if (mood === 'happy' || mood === 'love' || mood === 'laugh') {
      gsap.to(heartIcon, {
        scale: 1.2,
        color: '#ff6b6b',
        duration: 0.3,
        ease: "power2.out",
        onComplete: function() {
          gsap.to(heartIcon, {
            scale: 1,
            color: '#a0a0a0',
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    }

    if (mood === 'angry') {
      gsap.to(energyIcon, {
        rotation: 30,
        color: '#ff6b6b',
        duration: 0.2,
        ease: "power2.out",
        onComplete: function() {
          gsap.to(energyIcon, {
            rotation: 0,
            color: '#a0a0a0',
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    }
  }

  function setStatus(text, mood) {
    statusText.textContent = text;
    if (mood) {
      setMood(mood);
    }
    
    gsap.to(statusText, {
      opacity: 0.6,
      duration: 0.1,
      onComplete: function() {
        gsap.to(statusText, {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out"
        });
      }
    });
  }

  function updateMoodLabel(mood) {
    moodLabel.textContent = mood || 'happy';
  }

  function updateTemmieStats(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('love') || lower.includes('cute') || lower.includes('adorable') || lower.includes('sweet') || lower.includes('nice')) {
      temmieLove = Math.min(100, temmieLove + 15);
      temmieHappiness = Math.min(100, temmieHappiness + 10);
      temmieAnger = Math.max(0, temmieAnger - 10);
      temmieSadness = Math.max(0, temmieSadness - 10);
    } else if (lower.includes('hate') || lower.includes('stupid') || lower.includes('dumb') || lower.includes('useless') || lower.includes('terrible') || lower.includes('mean') || lower.includes('rude')) {
      temmieAnger = Math.min(100, temmieAnger + 20);
      temmieSadness = Math.min(100, temmieSadness + 15);
      temmieHappiness = Math.max(0, temmieHappiness - 15);
      temmieLove = Math.max(0, temmieLove - 10);
    } else if (lower.includes('lol') || lower.includes('haha') || lower.includes('funny') || lower.includes('joke')) {
      temmieHappiness = Math.min(100, temmieHappiness + 10);
      temmieAnger = Math.max(0, temmieAnger - 5);
    } else if (lower.includes('sad') || lower.includes('cry') || lower.includes('depressed') || lower.includes('lonely')) {
      temmieSadness = Math.min(100, temmieSadness + 10);
      temmieHappiness = Math.max(0, temmieHappiness - 5);
    } else if (lower.includes('scared') || lower.includes('afraid') || lower.includes('worried')) {
      temmieHappiness = Math.max(0, temmieHappiness - 5);
      temmieAnger = Math.min(100, temmieAnger + 5);
    } else {
      temmieHappiness = Math.min(100, temmieHappiness + 2);
      temmieLove = Math.min(100, temmieLove + 1);
    }

    temmieEnergy = Math.max(0, Math.min(100, temmieEnergy + (Math.random() * 2 - 1)));

    updateTemmieDisplay();
  }

  function updateTemmieDisplay() {
    const avg = (temmieHappiness + temmieLove) / 2;
    let mood = 'happy';
    let status = 'tEm iS hApPy!!!';

    if (temmieAnger > 70) {
      mood = 'angry';
      status = 'tEm aNgRy!!! >:(';
    } else if (temmieSadness > 70) {
      mood = 'sad';
      status = 'tEm sAd... :(';
    } else if (temmieLove > 80 && temmieHappiness > 70) {
      mood = 'love';
      status = 'tEm lOvE u!!! <3';
    } else if (temmieHappiness > 80 && temmieAnger < 30) {
      mood = 'laugh';
      status = 'tEm hApPy!!! :D';
    } else if (temmieEnergy < 20) {
      mood = 'sleepy';
      status = 'zZz... tEm tIrEd...';
    } else if (temmieHappiness < 30 && temmieSadness > 50) {
      mood = 'sad';
      status = 'tEm sAd... u hUrT tEm...';
    } else if (temmieAnger > 50 && temmieAnger < 70) {
      mood = 'confused';
      status = 'tEm cOnFuSeD... wHy u mEaN...';
    } else if (temmieLove > 60 && temmieHappiness > 60) {
      mood = 'love';
      status = 'tEm lOvE u!!! <3';
    } else if (temmieHappiness > 60) {
      mood = 'happy';
      status = 'tEm hApPy!!! :D';
    }

    setMood(mood + '.png');
    updateMoodLabel(mood);
    
    if (statusText.textContent === 'tEm iS rEaDy...' || statusText.textContent.includes('tEm')) {
      setStatus(status, mood + '.png');
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

  function updateBehavior() {
    const now = Date.now();
    const timeSinceLast = (now - lastMessageTime) / 1000;
    const idleTime = timeSinceLast;

    if (isProcessing) {
      return;
    }

    if (temmieEnergy < 20 && idleTime > 10) {
      setStatus('zZz... tEm sLeEpY... zZz...', 'sleepy.png');
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
      if (temmieAnger > 50) {
        setStatus('tEm sTiLl aNgRy...', 'angry.png');
      } else if (temmieSadness > 50) {
        setStatus('tEm sAd... u No TaLk 2 tEm...', 'sad.png');
      } else {
        setStatus('tEm wAiT fOr MeSsAgE...', 'thinking.png');
      }
    } else if (messageCount > 2 && messageCount < 6 && idleTime > 20) {
      if (temmieAnger > 60) {
        setStatus('tEm aNgRy!!! u MaKe tEm MaD!!!', 'angry.png');
      } else if (temmieSadness > 60) {
        setStatus('tEm sAd... tEm cRy... :(', 'sad.png');
      } else {
        setStatus('tEm sAd... u No TaLk 2 tEm...', 'sad.png');
      }
    } else if (messageCount > 5 && idleTime > 25) {
      if (temmieLove > 70 && temmieHappiness > 60) {
        setStatus('tEm lOvE u!!! wHeRe u Go???', 'love.png');
      } else {
        setStatus('tEm gOnA cRy... tEm lOnElY...', 'sad.png');
      }
    } else if (messageCount > 8 && idleTime > 30) {
      setStatus('tEm tHiNk U fOrGoT tEm...', 'sad.png');
    } else if (idleTime > 10 && idleTime < 15) {
      const randomMood = ['thinking', 'confused', 'happy'];
      const mood = randomMood[Math.floor(Math.random() * randomMood.length)];
      setStatus('tEm iS hErE...', mood + '.png');
    }

    if (temmieEnergy > 0) {
      temmieEnergy = Math.max(0, temmieEnergy - 0.1);
    }

    if (temmieSadness > 0 && temmieHappiness < 50) {
      temmieSadness = Math.max(0, temmieSadness - 0.05);
    }

    if (temmieAnger > 0 && temmieHappiness < 40) {
      temmieAnger = Math.max(0, temmieAnger - 0.03);
    }

    if (idleTime > 5 && idleTime < 10 && Math.random() > 0.7) {
      const randomPhrases = [
        'hOI!!!',
        'tEm hErE!!!',
        'wUtS uP???',
        'tEm wAnT tAlK!!!',
        'pLaY wItH tEm!!!'
      ];
      if (temmieHappiness > 50) {
        setStatus(randomPhrases[Math.floor(Math.random() * randomPhrases.length)], 'happy.png');
      }
    }
  }

  function rotateMood() {
    if (isProcessing) return;
    if (document.hidden) return;
    
    if (temmieAnger > 70) {
      setMood('angry.png');
      updateMoodLabel('angry');
      return;
    }
    
    if (temmieSadness > 70) {
      setMood('sad.png');
      updateMoodLabel('sad');
      return;
    }
    
    if (temmieLove > 80 && temmieHappiness > 70) {
      setMood('love.png');
      updateMoodLabel('love');
      return;
    }
    
    currentMoodIndex = (currentMoodIndex + 1) % moodImages.length;
    const mood = moodImages[currentMoodIndex];
    
    if (Math.random() > 0.3) {
      setMood(mood);
      updateMoodLabel(mood.replace('.png', ''));
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
      if (temmieAnger > 50) {
        setStatus('tEm sTiLl aNgRy...', 'angry.png');
      } else if (temmieSadness > 50) {
        setStatus('tEm sAd... u bAcK...', 'sad.png');
      } else {
        setStatus('tEm hApPy 2 sEe U!!!', 'laugh.png');
      }
    } else if (messageCount > 5) {
      if (temmieLove > 70) {
        setStatus('tEm lOvE u!!! mIsS u!!!', 'love.png');
      } else {
        setStatus('tEm bEsT fRiEnD!!!', 'love.png');
      }
    }
  }

  function handleUserBlur() {
    if (isProcessing) return;
    setTimeout(function() {
      if (!document.activeElement || document.activeElement !== userInput) {
        if (temmieAnger > 60) {
          setStatus('tEm aNgRy... u LeAvE...', 'angry.png');
        } else if (temmieSadness > 60) {
          setStatus('tEm sAd... u LeAvE tEm...', 'sad.png');
        } else {
          setStatus('tEm wAiT...', 'thinking.png');
        }
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
      gsap.to(indicator, {
        opacity: 0,
        duration: 0.2,
        onComplete: function() {
          indicator.remove();
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
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

  window.addEventListener('load', function() {
    behaviorInterval = setInterval(updateBehavior, 5000);
    moodRotationInterval = setInterval(rotateMood, 8000);
    
    userInput.addEventListener('input', handleUserTyping);
    userInput.addEventListener('focus', handleUserFocus);
    userInput.addEventListener('blur', handleUserBlur);
    
    setStatus('tEm iS rEaDy...', 'happy.png');
    updateMoodLabel('happy');
    
    temName.textContent = 'tEm';
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
    showTypingIndicator: showTypingIndicator,
    removeTypingIndicator: removeTypingIndicator,
    setStatus: setStatus,
    setMood: setMood,
    updateBehavior: updateBehavior,
    detectUserMood: detectUserMood,
    updateTemmieStats: updateTemmieStats,
    getTemmieStats: function() {
      return {
        energy: temmieEnergy,
        happiness: temmieHappiness,
        anger: temmieAnger,
        sadness: temmieSadness,
        love: temmieLove
      };
    }
  };
})();
