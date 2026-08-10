(function() {
  const phoneContainer = document.getElementById('phoneContainer');
  const chatContainer = document.getElementById('chatContainer');
  const chatWrapper = document.querySelector('.chat-wrapper');

  let isWalkingMode = false;
  let temmieSprite = null;
  let currentFrame = 0;
  let walkInterval = null;
  let direction = 'down';
  let isMoving = false;
  let velocityX = 0;
  let velocityY = 0;
  let posX = 50;
  let posY = 50;
  let targetX = 50;
  let targetY = 50;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isWandering = false;
  let wanderingTimeout = null;
  let idleTimeout = null;
  let reactionTimeout = null;
  let currentMood = 'idle';
  let wordFilterActive = false;

  const walkingFrames = ['walking1.png', 'walking2.png'];
  const idleFrame = 'idle.png';
  const moodFrames = {
    happy: 'happy.png',
    sad: 'sad.png',
    angry: 'angry.png',
    scared: 'scared.png',
    love: 'love.png',
    laugh: 'laugh.png',
    confused: 'confused.png',
    sleepy: 'sleepy.png'
  };

  function createToggle() {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'glass p-2 mb-3 flex items-center justify-between';
    toggleContainer.id = 'walkToggleContainer';
    
    const label = document.createElement('span');
    label.className = 'text-white text-sm font-medium';
    label.textContent = 'TeMm WaLK ARoUNd!??';
    
    const toggle = document.createElement('button');
    toggle.id = 'walkToggle';
    toggle.className = 'glass px-4 py-1.5 text-xs text-gray-300 hover:text-white transition';
    toggle.textContent = 'OFF';
    toggle.dataset.active = 'false';
    
    toggle.addEventListener('click', function() {
      isWalkingMode = !isWalkingMode;
      this.dataset.active = isWalkingMode ? 'true' : 'false';
      this.textContent = isWalkingMode ? 'ON' : 'OFF';
      this.style.color = isWalkingMode ? '#4ade80' : '#a0a0a0';
      
      if (isWalkingMode) {
        initTemmie();
        startWalking();
      } else {
        destroyTemmie();
        stopWalking();
      }
    });
    
    toggleContainer.appendChild(label);
    toggleContainer.appendChild(toggle);
    
    const keyContainer = document.getElementById('apiKeyContainer');
    keyContainer.parentNode.insertBefore(toggleContainer, keyContainer);
  }

  function initTemmie() {
    if (temmieSprite) return;
    
    temmieSprite = document.createElement('div');
    temmieSprite.id = 'temmieSprite';
    temmieSprite.style.cssText = `
      position: absolute;
      width: 48px;
      height: 48px;
      left: ${posX}%;
      top: ${posY}%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      cursor: grab;
      pointer-events: auto;
      image-rendering: pixelated;
      transition: none;
      filter: grayscale(1);
    `;
    
    const img = document.createElement('img');
    img.id = 'temmieImg';
    img.src = 'images/idle.png';
    img.alt = 'Temmie';
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
    `;
    
    temmieSprite.appendChild(img);
    phoneContainer.appendChild(temmieSprite);
    phoneContainer.style.position = 'relative';
    
    setupDragging();
    setupWordFilter();
  }

  function destroyTemmie() {
    if (temmieSprite) {
      temmieSprite.remove();
      temmieSprite = null;
    }
    if (walkInterval) {
      clearInterval(walkInterval);
      walkInterval = null;
    }
    if (wanderingTimeout) {
      clearTimeout(wanderingTimeout);
      wanderingTimeout = null;
    }
    if (idleTimeout) {
      clearTimeout(idleTimeout);
      idleTimeout = null;
    }
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
      reactionTimeout = null;
    }
    isMoving = false;
    currentFrame = 0;
    wordFilterActive = false;
  }

  function startWalking() {
    if (walkInterval) {
      clearInterval(walkInterval);
    }
    
    isWandering = true;
    wander();
    
    walkInterval = setInterval(function() {
      if (!isMoving && !isDragging) {
        updateIdle();
      }
    }, 100);
  }

  function stopWalking() {
    if (walkInterval) {
      clearInterval(walkInterval);
      walkInterval = null;
    }
    if (wanderingTimeout) {
      clearTimeout(wanderingTimeout);
      wanderingTimeout = null;
    }
    if (idleTimeout) {
      clearTimeout(idleTimeout);
      idleTimeout = null;
    }
    isWandering = false;
    isMoving = false;
  }

  function wander() {
    if (!isWandering || !temmieSprite) return;
    
    const rect = phoneContainer.getBoundingClientRect();
    const moveX = (Math.random() - 0.5) * 40;
    const moveY = (Math.random() - 0.5) * 40;
    
    let newX = posX + moveX;
    let newY = posY + moveY;
    
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));
    
    targetX = newX;
    targetY = newY;
    
    const dx = targetX - posX;
    const dy = targetY - posY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 1) {
      isMoving = true;
      const speed = 0.5 + Math.random() * 0.5;
      velocityX = (dx / dist) * speed;
      velocityY = (dy / dist) * speed;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }
      
      updateWalkingAnimation();
    }
    
    wanderingTimeout = setTimeout(function() {
      if (isWandering && !isDragging) {
        wander();
      }
    }, 2000 + Math.random() * 3000);
  }

  function updateWalkingAnimation() {
    if (!temmieSprite) return;
    const img = temmieSprite.querySelector('img');
    if (!img) return;
    
    currentFrame = (currentFrame + 1) % 2;
    const frameName = isMoving ? walkingFrames[currentFrame] : idleFrame;
    img.src = 'images/' + frameName;
    
    const scaleX = direction === 'left' ? -1 : 1;
    temmieSprite.style.transform = `translate(-50%, -50%) scaleX(${scaleX})`;
  }

  function updateIdle() {
    if (!temmieSprite) return;
    const img = temmieSprite.querySelector('img');
    if (!img) return;
    
    if (Math.random() > 0.98) {
      const moodKeys = Object.keys(moodFrames);
      const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
      img.src = 'images/' + moodFrames[randomMood];
      
      setTimeout(function() {
        if (!isMoving && temmieSprite) {
          const idleImg = temmieSprite.querySelector('img');
          if (idleImg) {
            idleImg.src = 'images/idle.png';
          }
        }
      }, 1500);
    }
  }

  function setupDragging() {
    let startX, startY, startPosX, startPosY;
    
    temmieSprite.addEventListener('mousedown', function(e) {
      if (!isWalkingMode) return;
      e.preventDefault();
      isDragging = true;
      this.style.cursor = 'grabbing';
      
      const rect = phoneContainer.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startPosX = posX;
      startPosY = posY;
      
      if (wanderingTimeout) {
        clearTimeout(wanderingTimeout);
        wanderingTimeout = null;
      }
      
      if (walkInterval) {
        clearInterval(walkInterval);
        walkInterval = null;
      }
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging || !temmieSprite) return;
      
      const rect = phoneContainer.getBoundingClientRect();
      const deltaX = (e.clientX - startX) / rect.width * 100;
      const deltaY = (e.clientY - startY) / rect.height * 100;
      
      let newX = startPosX + deltaX;
      let newY = startPosY + deltaY;
      
      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(5, Math.min(95, newY));
      
      posX = newX;
      posY = newY;
      temmieSprite.style.left = posX + '%';
      temmieSprite.style.top = posY + '%';
    });
    
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        if (temmieSprite) {
          temmieSprite.style.cursor = 'grab';
        }
        
        if (isWalkingMode && isWandering) {
          walkInterval = setInterval(function() {
            if (!isMoving && !isDragging) {
              updateIdle();
            }
          }, 100);
          wander();
        }
      }
    });
    
    temmieSprite.addEventListener('touchstart', function(e) {
      if (!isWalkingMode) return;
      e.preventDefault();
      const touch = e.touches[0];
      isDragging = true;
      
      const rect = phoneContainer.getBoundingClientRect();
      startX = touch.clientX;
      startY = touch.clientY;
      startPosX = posX;
      startPosY = posY;
      
      if (wanderingTimeout) {
        clearTimeout(wanderingTimeout);
        wanderingTimeout = null;
      }
    }, { passive: false });
    
    temmieSprite.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = phoneContainer.getBoundingClientRect();
      const deltaX = (touch.clientX - startX) / rect.width * 100;
      const deltaY = (touch.clientY - startY) / rect.height * 100;
      
      let newX = startPosX + deltaX;
      let newY = startPosY + deltaY;
      
      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(5, Math.min(95, newY));
      
      posX = newX;
      posY = newY;
      temmieSprite.style.left = posX + '%';
      temmieSprite.style.top = posY + '%';
    }, { passive: false });
    
    temmieSprite.addEventListener('touchend', function() {
      if (isDragging) {
        isDragging = false;
        if (isWalkingMode && isWandering) {
          wander();
        }
      }
    });
  }

  function setupWordFilter() {
    const originalSend = window.sendToOpenRouter;
    
    window.sendToOpenRouter = function(userText) {
      if (!isWalkingMode) {
        if (originalSend) originalSend(userText);
        return;
      }
      
      const badWords = ['stupid', 'dumb', 'idiot', 'moron', 'fool', 'useless', 'trash', 'garbage', 'hate', 'terrible', 'awful', 'bad', 'worst', 'suck', 'sucks', 'dummy', 'loser', 'pathetic', 'mean', 'rude', 'cruel', 'horrible', 'nasty', 'evil', 'devil', 'demon', 'monster', 'creep', 'weird', 'strange', 'ugly'];
      
      let containsBad = false;
      let badWordFound = '';
      const lowerText = userText.toLowerCase();
      
      for (const word of badWords) {
        if (lowerText.includes(word)) {
          containsBad = true;
          badWordFound = word;
          break;
        }
      }
      
      if (containsBad && temmieSprite) {
        wordFilterActive = true;
        const img = temmieSprite.querySelector('img');
        if (img) {
          img.src = 'images/angry.png';
        }
        
        const rect = phoneContainer.getBoundingClientRect();
        const temmieX = posX;
        const temmieY = posY;
        
        const newX = Math.max(5, Math.min(95, temmieX + (Math.random() - 0.5) * 20));
        const newY = Math.max(5, Math.min(95, temmieY + (Math.random() - 0.5) * 20));
        
        posX = newX;
        posY = newY;
        temmieSprite.style.left = posX + '%';
        temmieSprite.style.top = posY + '%';
        
        if (reactionTimeout) clearTimeout(reactionTimeout);
        reactionTimeout = setTimeout(function() {
          if (temmieSprite) {
            const img2 = temmieSprite.querySelector('img');
            if (img2) {
              img2.src = 'images/idle.png';
            }
            wordFilterActive = false;
          }
        }, 2000);
        
        userText = userText.replace(new RegExp(badWordFound, 'gi'), '...');
        
        const statusText = document.getElementById('statusText');
        statusText.textContent = 'tEm eAt BaD wOrD!';
        setTimeout(() => {
          statusText.textContent = 'tEm iS rEaDy...';
        }, 1500);
      }
      
      if (userText.toLowerCase().includes('tem') || userText.toLowerCase().includes('temmie')) {
        if (temmieSprite) {
          const img = temmieSprite.querySelector('img');
          if (img) {
            img.src = 'images/love.png';
          }
          
          const newX = 50 + (Math.random() - 0.5) * 20;
          const newY = 50 + (Math.random() - 0.5) * 20;
          posX = Math.max(5, Math.min(95, newX));
          posY = Math.max(5, Math.min(95, newY));
          temmieSprite.style.left = posX + '%';
          temmieSprite.style.top = posY + '%';
          
          if (reactionTimeout) clearTimeout(reactionTimeout);
          reactionTimeout = setTimeout(function() {
            if (temmieSprite) {
              const img2 = temmieSprite.querySelector('img');
              if (img2) {
                img2.src = 'images/idle.png';
              }
            }
          }, 2000);
        }
      }
      
      if (originalSend) originalSend(userText);
    };
  }

  function updateTemmiePosition() {
    if (!temmieSprite) return;
    
    if (isMoving && !isDragging) {
      posX += velocityX * 0.3;
      posY += velocityY * 0.3;
      
      posX = Math.max(5, Math.min(95, posX));
      posY = Math.max(5, Math.min(95, posY));
      
      temmieSprite.style.left = posX + '%';
      temmieSprite.style.top = posY + '%';
      
      const dx = targetX - posX;
      const dy = targetY - posY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 1) {
        isMoving = false;
        const img = temmieSprite.querySelector('img');
        if (img) {
          img.src = 'images/idle.png';
        }
        
        if (idleTimeout) {
          clearTimeout(idleTimeout);
        }
        idleTimeout = setTimeout(function() {
          if (temmieSprite && !isMoving) {
            const img2 = temmieSprite.querySelector('img');
            if (img2 && Math.random() > 0.7) {
              const moodKeys = Object.keys(moodFrames);
              const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
              img2.src = 'images/' + moodFrames[randomMood];
              setTimeout(function() {
                if (temmieSprite && !isMoving) {
                  const img3 = temmieSprite.querySelector('img');
                  if (img3) {
                    img3.src = 'images/idle.png';
                  }
                }
              }, 1500);
            }
          }
        }, 1000);
      }
    }
    
    requestAnimationFrame(updateTemmiePosition);
  }

  document.addEventListener('DOMContentLoaded', function() {
    createToggle();
    
    const style = document.createElement('style');
    style.textContent = `
      #temmieSprite {
        transition: none !important;
      }
      #temmieSprite img {
        filter: grayscale(1);
      }
      #walkToggle {
        min-width: 60px;
      }
      #walkToggle[data-active="true"] {
        border-color: rgba(74, 222, 128, 0.3);
        background: rgba(74, 222, 128, 0.05);
      }
    `;
    document.head.appendChild(style);
    
    updateTemmiePosition();
  });

  window.destroyTemmie = destroyTemmie;
  window.toggleWalking = function() {
    const toggle = document.getElementById('walkToggle');
    if (toggle) toggle.click();
  };
})();
