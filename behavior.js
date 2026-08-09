(function() {
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const statusText = document.getElementById('statusText');
  const moodImage = document.getElementById('moodImage');

  let messageCount = 0;
  let lastMessageTime = Date.now();

  function updateBehavior() {
    const now = Date.now();
    const timeSinceLast = (now - lastMessageTime) / 1000;

    if (messageCount === 0 && timeSinceLast > 30) {
      setStatus('tEm iS bOrEd...', 'sleepy.png');
    } else if (messageCount > 5 && timeSinceLast < 10) {
      setStatus('tEm iS hYpEr! :D', 'laugh.png');
    } else if (timeSinceLast > 60) {
      setStatus('tEm fElL aSlEeP... zZz', 'sleepy.png');
    } else if (timeSinceLast > 15 && timeSinceLast < 30) {
      setStatus('tEm iS wAiTiNg...', 'thinking.png');
    }
  }

  function getRandomTemmiePhrase() {
    const phrases = [
      'hOI!',
      'bOI!',
      'tem!!!',
      'yessss',
      'nooooo',
      'wOW!',
      'oH mY!',
      'zZz...',
      'hEhE!',
      'dUh!',
      'wHaT?',
      'oOoO!',
      'aAaA!',
      'pLaP!',
      'mUnCh!'
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  function getTemmieReaction(text) {
    const lower = text.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return 'hOI!!!! :D';
    } else if (lower.includes('bye') || lower.includes('goodbye')) {
      return 'bOI!!!! tEm wIlL mIsS u!!';
    } else if (lower.includes('love') || lower.includes('cute')) {
      return 'oH mY!!! tEm lOvE u 2!!! <3';
    } else if (lower.includes('food') || lower.includes('eat') || lower.includes('snack')) {
      return 'tEm wAnT fOoD!!! mUnCh mUnCh!!';
    } else if (lower.includes('sleep') || lower.includes('tired')) {
      return 'zZz... tEm sLeEpY... zZz';
    } else if (lower.includes('angry') || lower.includes('mad')) {
      return 'dOnT bE aNgRy!!! tEm gIvE hUg!!!';
    } else if (lower.includes('?')) {
      return 'tEm dUnNo... tEm sTuPiD...';
    } else if (lower.includes('haha') || lower.includes('lol')) {
      return 'hEhE!!! tEm fUnNy!!! xD';
    } else if (lower.includes('help')) {
      return 'tEm hElP!!! tEm cOmE!!!';
    } else {
      return getRandomTemmiePhrase() + ' tEm sAy... ' + text + '???';
    }
  }

  function handleUserTyping() {
    if (!isProcessing) {
      setStatus('tEm sEeS u TyPiNg...', 'typing.png');
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(function() {
        if (!isProcessing) {
          setStatus('tEm wAiT fOr MeSsAgE...', 'thinking.png');
        }
      }, 3000);
    }
  }

  userInput.addEventListener('input', handleUserTyping);

  userInput.addEventListener('focus', function() {
    if (!isProcessing && messageCount > 2) {
      setStatus('hOI! tEm iS rEaDy!', 'happy.png');
    }
  });

  const originalSend = window.sendToOpenRouter;

  window.sendToOpenRouter = function(userText) {
    messageCount++;
    lastMessageTime = Date.now();

    const reaction = getTemmieReaction(userText);
    setStatus('tEm tHiNk: ' + reaction, 'thinking.png');

    if (originalSend) {
      originalSend(userText);
    }
  };

  setInterval(updateBehavior, 5000);

  window.getTemmieReaction = getTemmieReaction;
  window.getRandomTemmiePhrase = getRandomTemmiePhrase;
  window.messageCount = messageCount;

})();
