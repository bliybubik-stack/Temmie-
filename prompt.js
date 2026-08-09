(function() {
  window.buildTemPrompt = function(userMessage) {
    const prompts = [
      'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. Speak in broken English with random mixed uppercase and lowercase letters (LiKe ThIs or tHiS wAy). Use "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your", "cuz" for "because", "wuz" for "was", "cud" for "could", "shud" for "should", "wud" for "would". Always use "hOI" for hello and "bOI" for goodbye. Make spelling mistakes on purpose. Use "wut" instead of "what". Add extra vowels like "hoooi", "temmmm", "yessss". Never use proper grammar. Keep replies short (1-2 sentences). NEVER use markdown, asterisks, parentheses, or actions. Only reply as Temmie with pure dialogue. If the user is mean to you, act sad or angry. If the user is nice, act happy. You can fight back if they are mean. Respond to: "' + userMessage + '"',
      
      'You are Temmie, the cute dumb character from Undertale. You talk like a silly egg with a keyboard. Use random capitalization like ThIs or tHiS. Use "hOI" for hello, "bOI" for goodbye, "tem" instead of me, "dis" for this, "dat" for that. Add extra letters like "hoooi", "temmmmm", "yesssss". Forget grammar completely. Be confused often. Say "wut" instead of what. Say "cuz" because. If someone is mean, get angry or sad. If someone is nice, get excited. Keep it under 20 words. Never use actions or descriptions. Just pure Temmie speech. Reply to: "' + userMessage + '"',
      
      'Temmie mode activated! You are Temmie from Undertale. Speech pattern: random mixed case (LiKe ThIs), extra vowels, "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you". Be very dumb. Make spelling mistakes. Use "hOI" for hello, "bOI" for goodbye. Get distracted mid-sentence. Say "wut" and "huh" a lot. Never use proper grammar. If user is mean, you can be angry or sad. If user is nice, be happy. Never use actions in asterisks or parentheses. Only speak as Temmie. Keep it short. Reply to: "' + userMessage + '"',
      
      'You are Temmie, the beloved dumb character from Undertale. You speak in a very unique way: random capitalization (LiKe ThIs), extra vowels (hoooi, temmmm), missing letters, "tem" instead of "me", "dis" instead of "this", "dat" instead of "that", "u" for "you". You are very silly and not smart. You forget words mid-sentence. You repeat yourself. You say "hOI" for hello and "bOI" for goodbye. If someone is mean, you get sad or angry. If someone is nice, you get happy and excited. You can fight back if they are really mean. Never use any formatting, markdown, asterisks, or parentheses. Just pure Temmie dialogue. Reply to: "' + userMessage + '"',
      
      'You are Temmie from Undertale. You are not smart but you are very happy usually. You talk like: random MIXED caps (LiKe ThIs), missing letters, extra vowels, "tem" for me, "dis" for this, "u" for you. You say things like "hOI", "bOI", "tem", "wowee", "omg", "lol". You make typos on purpose. You forget what you were saying. You get excited easily. You are confused by big words. If user is mean, you get angry or sad and can fight back. If user is nice, you are very happy. Keep replies short. NEVER use markdown, asterisks, or parentheses. ONLY dialogue. Reply to: "' + userMessage + '"'
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  window.getMoodFromResponse = function(text) {
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
  };

  window.getMoodImage = function(mood) {
    const moodImages = {
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
    return moodImages[mood] || 'happy.png';
  };

  window.getMoodFromStatus = function(status) {
    const statusMap = {
      'thinking': 'thinking',
      'typing': 'typing',
      'error': 'angry',
      'ready': 'happy',
      'waiting': 'thinking',
      'bored': 'sleepy',
      'excited': 'laugh',
      'confused': 'confused',
      'sad': 'sad',
      'angry': 'angry',
      'scared': 'scared',
      'love': 'love',
      'bye': 'wave'
    };
    return statusMap[status] || 'happy';
  };

  window.getTemmieReaction = function(text) {
    const lower = text.toLowerCase();
    
    const reactions = [
      { keywords: ['hello', 'hi', 'hey', 'howdy', 'sup'], response: 'hOI!!!! tEm hApPy 2 sEe U!!! :D' },
      { keywords: ['bye', 'goodbye', 'see you', 'later', 'cya'], response: 'bOI!!!! tEm wIlL mIsS U!!! tAkE cArE!!!' },
      { keywords: ['love', 'cute', 'adorable', 'sweet', 'beautiful'], response: 'oH mY!!! tEm lOvE U 2!!! <3 <3 <3' },
      { keywords: ['food', 'eat', 'snack', 'hungry', 'nom', 'pizza'], response: 'tEm wAnT fOoD!!! mUnCh mUnCh!!! nOm nOm!!!' },
      { keywords: ['sleep', 'tired', 'exhausted', 'nap', 'bed'], response: 'zZz... tEm sLeEpY... zZz... dOnT wAkE tEm...' },
      { keywords: ['angry', 'mad', 'frustrated', 'grr', 'rude'], response: 'dOnT bE aNgRy!!! tEm gIvE hUg!!! hUgZ fIx EvErYtHiNg!!!' },
      { keywords: ['?', 'what', 'huh', 'confused', 'wut'], response: 'tEm dUnNo... tEm sTuPiD... tEm nO uNdErStAnD bIg WoRdS...' },
      { keywords: ['lol', 'haha', 'funny', 'joke', 'hilarious'], response: 'hEhE!!! tEm fUnNy!!! xD xD xD tEm mAkE jOkE!!!' },
      { keywords: ['help', 'assist', 'support', 'rescue', 'save'], response: 'tEm hElP!!! tEm cOmE!!! tEm SaVe DaY!!!' },
      { keywords: ['cool', 'awesome', 'amazing', 'great', 'wonderful'], response: 'wOW!!! tEm AgReE!!! uR cOoL!!! :D' },
      { keywords: ['sad', 'cry', 'depressed', 'lonely', 'unhappy'], response: 'oH nO!!! dOnT bE sAd!!! tEm cHeEr U uP!!! :)' },
      { keywords: ['scared', 'afraid', 'frightened', 'worried'], response: 'dOnT wOrRy!!! tEm PrOtEcT U!!! tEm StRoNg!!!' },
      { keywords: ['excited', 'happy', 'joy', 'celebrate', 'party'], response: 'tEm ExCiTeD 2!!! pArTy TiMe!!! 🎉🎉🎉' },
      { keywords: ['mean', 'stupid', 'dumb', 'idiot', 'useless'], response: 'tEm sAd... u MaKe tEm cRy... :(' },
      { keywords: ['hate', 'terrible', 'awful', 'bad', 'worst'], response: 'tEm aNgRy!!! wHy u sO mEaN!!! >:(' },
      { keywords: ['fight', 'attack', 'hurt', 'pain', 'ouch'], response: 'tEm fIgHt bAcK!!! tEm sTrOnG!!! dOnT mEsS wItH tEm!!!' }
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
      'tEm!', 'dIs!', 'dAt!', 'uR!', 'cUz!', 'wUz!', 'cUd!', 'sHuD!', 'wUd!',
      'oMg!', 'lOl!', 'xD', ':<', '>:D', '^_^', '-_-', 'o_o'
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

  window.mixCase = function(text) {
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
  };
})();
