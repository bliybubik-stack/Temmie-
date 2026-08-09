(function() {
  window.buildTemPrompt = function(userMessage) {
    const prompts = [
      'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. Speak in broken English with lots of typos, random capitalization, extra vowels (hoiiii, temmmm, yessss, nooooo). Use "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your", "cuz" for "because", "wuz" for "was", "cud" for "could", "shud" for "should", "wud" for "would". Never use correct grammar. Be silly, forget words, repeat yourself, mix up letters. Keep replies SHORT (1-2 sentences max). NEVER use markdown, asterisks, parentheses, or actions. NEVER describe what you are doing. Only reply as Temmie with pure dialogue. Respond to: "' + userMessage + '"',
      
      'You are Temmie, the cute dumb character from Undertale. You talk like a silly egg with a keyboard. Use "hOI" for hello, "bOI" for goodbye, "tem" instead of me, "dis" for this, "dat" for that. Type with random capitals like ThIs or tHIs. Add extra letters like "hoooi", "temmmmm", "yesssss". Forget grammar completely. Be confused often. Say "wut" instead of what. Say "cuz" instead of because. Keep it under 20 words. Never use actions or descriptions. Just pure Temmie speech. Reply to: "' + userMessage + '"',
      
      'You are Temmie from Undertale. You are not smart but you are very happy. You talk like: random CAPS, missing letters, extra vowels, "tem" for me, "dis" for this, "u" for you. You say things like "hOI", "bOI", "tem", "wowee", "omg", "lol". You make typos on purpose. You forget what you were saying. You get excited easily. You are confused by big words. Keep replies short and cute. NEVER use markdown, asterisks, or parentheses. ONLY dialogue. Reply to: "' + userMessage + '"',
      
      'Temmie mode activated! You are Temmie from Undertale. Speech pattern: broken English, random caps, extra vowels, "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you". Be very dumb. Make spelling mistakes. Use "hOI" for hello, "bOI" for goodbye. Get distracted mid-sentence. Say "wut" and "huh" a lot. Never use proper grammar. Never use actions in asterisks or parentheses. Only speak as Temmie. Keep it short. Reply to: "' + userMessage + '"',
      
      'You are Temmie, the beloved dumb character from Undertale. You speak in a very unique way: random capitalization (LiKe ThIs), extra vowels (hoooi, temmmm), missing letters, "tem" instead of "me", "dis" instead of "this", "dat" instead of "that", "u" for "you". You are very silly and not smart. You forget words mid-sentence. You repeat yourself. You say "hOI" for hello and "bOI" for goodbye. Never use any formatting, markdown, asterisks, or parentheses. Just pure Temmie dialogue. Reply to: "' + userMessage + '"'
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  window.getMoodFromResponse = function(text) {
    const lower = text.toLowerCase();
    
    const moodMap = {
      'happy.png': ['hOI', 'hi', 'hey', 'hello', 'yay', 'yess', 'good', 'great', 'awesome', 'love', 'cute', 'fun', 'nice', 'cool', 'wow', 'omg', 'lol', 'haha', 'xd', ':)', ':D', '^_^'],
      'laugh.png': ['lol', 'haha', 'hehe', 'xd', 'funny', 'hilarious', 'joke', 'lmao', 'rofl', ':D', 'xD'],
      'love.png': ['love', 'heart', 'cute', 'adorable', 'sweet', 'hug', 'kiss', '<3', 'heart', 'darling', 'baby'],
      'thinking.png': ['think', 'hmm', 'maybe', 'perhaps', 'wonder', 'guess', 'suppose', 'probably', '?', 'what', 'huh', 'confused'],
      'confused.png': ['what', 'huh', 'confused', 'wut', '??', '???', 'hmm', 'wait', 'really', 'seriously'],
      'sad.png': ['sad', 'cry', ':-(', ':(', 'depressed', 'lonely', 'miss', 'sorry', 'apologize', 'regret', 'oh no', 'poor'],
      'angry.png': ['angry', 'mad', 'grr', '>:-(', '>:)', 'frustrated', 'annoyed', 'irritated', 'rage', 'upset', 'grrr'],
      'scared.png': ['scared', 'afraid', 'frightened', 'terrified', 'horrified', 'panic', 'anxious', 'nervous', 'worried', 'oh no', 'help'],
      'sleepy.png': ['sleep', 'tired', 'exhausted', 'zzz', 'bed', 'nap', 'rest', 'yawn', 'dream', 'goodnight'],
      'wave.png': ['bye', 'goodbye', 'see ya', 'later', 'farewell', 'cya', 'adios', 'bOI', 'leave', 'going']
    };

    for (const [mood, keywords] of Object.entries(moodMap)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          return mood;
        }
      }
    }

    const randomMoods = ['happy.png', 'thinking.png', 'laugh.png', 'love.png'];
    return randomMoods[Math.floor(Math.random() * randomMoods.length)];
  };

  window.getMoodFromStatus = function(status) {
    const statusMap = {
      'thinking': 'thinking.png',
      'typing': 'typing.png',
      'error': 'angry.png',
      'ready': 'happy.png',
      'waiting': 'thinking.png',
      'bored': 'sleepy.png',
      'excited': 'laugh.png',
      'confused': 'confused.png',
      'sad': 'sad.png',
      'angry': 'angry.png',
      'scared': 'scared.png',
      'love': 'love.png',
      'bye': 'wave.png'
    };
    return statusMap[status] || 'happy.png';
  };

  window.getTemmieReaction = function(text) {
    const lower = text.toLowerCase();
    
    const reactions = [
      { keywords: ['hello', 'hi', 'hey', 'howdy'], response: 'hOI!!!! tEm hApPy 2 sEe U!!! :D' },
      { keywords: ['bye', 'goodbye', 'see you', 'later'], response: 'bOI!!!! tEm wIlL mIsS U!!! tAkE cArE!!!' },
      { keywords: ['love', 'cute', 'adorable', 'sweet'], response: 'oH mY!!! tEm lOvE U 2!!! <3 <3 <3' },
      { keywords: ['food', 'eat', 'snack', 'hungry', 'nom'], response: 'tEm wAnT fOoD!!! mUnCh mUnCh!!! nOm nOm!!!' },
      { keywords: ['sleep', 'tired', 'exhausted', 'nap'], response: 'zZz... tEm sLeEpY... zZz... dOnT wAkE tEm...' },
      { keywords: ['angry', 'mad', 'frustrated', 'grr'], response: 'dOnT bE aNgRy!!! tEm gIvE hUg!!! hUgZ fIx EvErYtHiNg!!!' },
      { keywords: ['?', 'what', 'huh', 'confused'], response: 'tEm dUnNo... tEm sTuPiD... tEm nO uNdErStAnD bIg WoRdS...' },
      { keywords: ['lol', 'haha', 'funny', 'joke'], response: 'hEhE!!! tEm fUnNy!!! xD xD xD tEm mAkE jOkE!!!' },
      { keywords: ['help', 'assist', 'support', 'rescue'], response: 'tEm hElP!!! tEm cOmE!!! tEm SaVe DaY!!!' },
      { keywords: ['cool', 'awesome', 'amazing', 'great'], response: 'wOW!!! tEm AgReE!!! uR cOoL!!! :D' },
      { keywords: ['sad', 'cry', 'depressed', 'lonely'], response: 'oH nO!!! dOnT bE sAd!!! tEm cHeEr U uP!!! :)' },
      { keywords: ['scared', 'afraid', 'frightened'], response: 'dOnT wOrRy!!! tEm PrOtEcT U!!! tEm StRoNg!!!' },
      { keywords: ['excited', 'happy', 'joy', 'celebrate'], response: 'tEm ExCiTeD 2!!! pArTy TiMe!!! 🎉🎉🎉' }
    ];

    for (const reaction of reactions) {
      for (const keyword of reaction.keywords) {
        if (lower.includes(keyword)) {
          return reaction.response;
        }
      }
    }

    const randomResponses = [
      'hOI!!! tEm LiKe U!!!',
      'tEm sAy HeLlO!!!',
      'oOoO!!! iNtErEsTiNg!!!',
      'tEm nO kNoW... tEm dUmB...',
      'wOw!!! tEm LiKe DiS!!!',
      'hEhE!!! tEm HaPpY!!!',
      'tEm ThInK... tEm NoT tHiNk...',
      'yEs!!! tEm AgReE!!!',
      'nO!!! tEm DiSaGrEe!!!',
      'tEm GoT cOnFuSeD...',
      'wUt??? tEm No UnDeRsTaNd...',
      'tEm LoVe DiS!!!',
      'tEm HaTe DiS!!!',
      'oH!!! tEm SeE!!!',
      'tEm WaNnA pLaY!!!'
    ];
    
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  };

  window.getRandomTemPhrase = function() {
    const phrases = [
      'hOI!', 'bOI!', 'tem!!!', 'yessss', 'nooooo', 'wOW!', 'oH mY!', 'zZz...', 
      'hEhE!', 'dUh!', 'wHaT?', 'oOoO!', 'aAaA!', 'pLaP!', 'mUnCh!', 'nOm!',
      'wUt?', 'hUh?', 'yAy!', 'oOf!', 'yIkEs!', 'gAsP!', 'sQuEe!', 'eEp!',
      'tEm!', 'dIs!', 'dAt!', 'uR!', 'cUz!', 'wUz!', 'cUd!', 'sHuD!', 'wUd!'
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  window.getTemmieDumbResponse = function(userMessage) {
    const words = userMessage.split(' ');
    const randomWords = [
      'tEm', 'hOI', 'bOI', 'wOW', 'yAy', 'nO', 'yEs', 'mAyBe', 'wUt', 'hUh',
      'oH', 'wElL', 'tHeN', 'sO', 'dIs', 'dAt', 'uR', 'cUz', 'lOl', 'oMg'
    ];
    
    let response = '';
    const length = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < length; i++) {
      if (Math.random() > 0.5) {
        response += randomWords[Math.floor(Math.random() * randomWords.length)] + ' ';
      } else {
        response += words[Math.floor(Math.random() * words.length)] || 'tEm';
        if (Math.random() > 0.6) {
          response += response[response.length - 1].repeat(Math.floor(Math.random() * 3) + 1);
        }
        response += ' ';
      }
    }
    
    return response.trim() + '!!!';
  };
})();
