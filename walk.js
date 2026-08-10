(function() {
  const canvas = document.getElementById('temCanvas');
  const chatWrapper = document.getElementById('chatWrapper');
  const walkToggle = document.getElementById('walkToggle');
  const walkLabel = document.getElementById('walkLabel');
  const moodImage = document.getElementById('moodImage');
  const statusText = document.getElementById('statusText');
  const chatContainer = document.getElementById('chatContainer');

  let isWalking = false;
  let ctx = null;
  let temX = 50;
  let temY = 50;
  let targetX = 50;
  let targetY = 50;
  let speed = 1.2;
  let animationFrame = null;
  let lastMessage = '';
  let messageCount = 0;
  let isMoving = false;
  let currentDirection = 'down';
  let idleTimer = 0;
  let isIdle = true;
  let walkHistory = [];
  let reactionCooldown = 0;

  const TEM_SIZE = 40;
  const PADDING = 20;

  function initCanvas() {
    const rect = chatWrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx = canvas.getContext('2d');
    
    temX = canvas.width / 2;
    temY = canvas.height / 2;
    targetX = temX;
    targetY = temY;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = chatWrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
    }
  }

  function drawTemmie() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const x = temX;
    const y = temY;
    const size = TEM_SIZE;
    
    ctx.save();
    
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + size/2 + 6, size/2.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    const isFacing = currentDirection === 'left' ? -1 : 1;
    
    ctx.save();
    if (currentDirection === 'left') {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }
    
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    
    const bodyColor = '#7a7a7a';
    const bodyColorLight = '#9a9a9a';
    const bodyColorDark = '#5a5a5a';
    
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x, y + 4, size/2.2, size/2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = bodyColorLight;
    ctx.beginPath();
    ctx.ellipse(x - 4, y - 2, size/4, size/3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 6, size/4.5, size/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(x - 6, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(x + 6, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x - 5, y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 7, y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x, y + 4, 3, 0, Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(x - 2, y + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(x + 2, y + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.ellipse(x - 10, y + 10, 3, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 10, 3, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    ctx.shadowBlur = 0;
    
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText('🐾', x, y + size/2 + 18);
    
    ctx.restore();
  }

  function updateTemmie() {
    if (!ctx) return;
    
    const dx = targetX - temX;
    const dy = targetY - temY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 2) {
      isMoving = true;
      isIdle = false;
      idleTimer = 0;
      
      const step = Math.min(speed, distance);
      temX += (dx / distance) * step;
      temY += (dy / distance) * step;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        currentDirection = dx > 0 ? 'right' : 'left';
      } else {
        currentDirection = dy > 0 ? 'down' : 'up';
      }
      
      walkHistory.push({ x: temX, y: temY, time: Date.now() });
      if (walkHistory.length > 50) walkHistory.shift();
      
    } else {
      isMoving = false;
      idleTimer++;
      
      if (idleTimer > 180) {
        isIdle = true;
        if (Math.random() > 0.97) {
          pickNewTarget();
        }
      }
    }
    
    drawTemmie();
  }

  function pickNewTarget() {
    const padding = PADDING + TEM_SIZE/2;
    targetX = padding + Math.random() * (canvas.width - padding * 2);
    targetY = padding + Math.random() * (canvas.height - padding * 2);
    
    const mood = Math.floor(Math.random() * 5);
    switch(mood) {
      case 0: currentDirection = 'up'; break;
      case 1: currentDirection = 'down'; break;
      case 2: currentDirection = 'left'; break;
      case 3: currentDirection = 'right'; break;
      default: currentDirection = 'down';
    }
  }

  function startWalking() {
    if (animationFrame) return;
    isWalking = true;
    isIdle = false;
    pickNewTarget();
    
    function loop() {
      if (!isWalking) {
        animationFrame = null;
        return;
      }
      updateTemmie();
      animationFrame = requestAnimationFrame(loop);
    }
    loop();
  }

  function stopWalking() {
    isWalking = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function toggleWalking() {
    if (isWalking) {
      stopWalking();
      walkLabel.textContent = 'Off';
      walkToggle.classList.remove('active');
      statusText.textContent = 'tEm sToPpEd...';
      canvas.style.opacity = '0.3';
    } else {
      initCanvas();
      startWalking();
      walkLabel.textContent = 'On';
      walkToggle.classList.add('active');
      statusText.textContent = 'tEm iS wAlKiNg!!!';
      canvas.style.opacity = '1';
    }
  }

  function reactToMessage(text) {
    if (!isWalking) return;
    
    const lower = text.toLowerCase();
    const badWords = ['stupid', 'dumb', 'idiot', 'moron', 'fool', 'useless', 'trash', 'garbage', 'hate', 'terrible', 'awful', 'bad', 'worst', 'suck', 'sucks', 'dummy', 'loser', 'pathetic', 'mean', 'rude', 'cruel', 'horrible', 'nasty', 'evil'];
    
    let isBad = false;
    for (const word of badWords) {
      if (lower.includes(word)) {
        isBad = true;
        break;
      }
    }
    
    if (isBad) {
      targetX = canvas.width / 2 + (Math.random() - 0.5) * 100;
      targetY = canvas.height / 2 + (Math.random() - 0.5) * 100;
      speed = 2.5;
      
      setTimeout(() => {
        speed = 1.2;
      }, 3000);
      
      statusText.textContent = 'tEm sAd... u HuRt tEm...';
      
      if (typeof setMood === 'function') {
        setMood('sad.png');
      }
      
      return;
    }
    
    const happyWords = ['love', 'cute', 'adorable', 'sweet', 'nice', 'kind', 'good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'best', 'perfect', 'beautiful', 'pretty'];
    let isHappy = false;
    for (const word of happyWords) {
      if (lower.includes(word)) {
        isHappy = true;
        break;
      }
    }
    
    if (isHappy) {
      targetX = 50 + Math.random() * (canvas.width - 100);
      targetY = 50 + Math.random() * (canvas.height - 100);
      speed = 2.0;
      
      setTimeout(() => {
        speed = 1.2;
      }, 2000);
      
      statusText.textContent = 'tEm hApPy!!! ^_^';
      
      if (typeof setMood === 'function') {
        setMood('happy.png');
      }
      
      return;
    }
    
    if (lower.includes('play') || lower.includes('game') || lower.includes('fun')) {
      targetX = 30 + Math.random() * (canvas.width - 60);
      targetY = 30 + Math.random() * (canvas.height - 60);
      speed = 3.0;
      
      setTimeout(() => {
        speed = 1.2;
      }, 1500);
      
      statusText.textContent = 'tEm WaNnA pLaY!!! :D';
      
      if (typeof setMood === 'function') {
        setMood('laugh.png');
      }
    }
    
    if (lower.includes('bye') || lower.includes('goodbye')) {
      targetX = canvas.width - 60;
      targetY = 20;
      speed = 2.0;
      
      setTimeout(() => {
        targetX = canvas.width / 2;
        targetY = canvas.height / 2;
      }, 3000);
      
      statusText.textContent = 'bOI!!!! tEm WiLl MiSs U!!!';
      
      if (typeof setMood === 'function') {
        setMood('wave.png');
      }
    }
  }

  walkToggle.addEventListener('click', toggleWalking);

  window.addEventListener('resize', function() {
    if (isWalking) {
      resizeCanvas();
    }
  });

  const originalSend = window.sendToOpenRouter;
  if (originalSend) {
    window.sendToOpenRouter = function(text) {
      if (isWalking) {
        reactToMessage(text);
      }
      return originalSend(text);
    };
  }

  window.toggleWalking = toggleWalking;
  window.reactToMessage = reactToMessage;
  window.isWalking = function() { return isWalking; };

  setTimeout(function() {
    initCanvas();
    canvas.style.opacity = '0.3';
  }, 500);

  const style = document.createElement('style');
  style.textContent = `
    #walkToggle.active {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.12);
      color: #f0f0f0;
    }
    #temCanvas {
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
  `;
  document.head.appendChild(style);

})();
