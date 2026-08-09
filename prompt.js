(function() {
  window.buildTemPrompt = function(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    let emotionalContext = '';
    if (lowerMessage.includes('stupid') || lowerMessage.includes('dumb') || lowerMessage.includes('idiot') || 
        lowerMessage.includes('hate') || lowerMessage.includes('ugly') || lowerMessage.includes('useless') ||
        lowerMessage.includes('terrible') || lowerMessage.includes('awful') || lowerMessage.includes('horrible')) {
      emotionalContext = 'You are VERY SAD because the user is being mean to you. Respond with sadness and hurt feelings. Use ":(" and "cry" and "sad".';
    } else if (lowerMessage.includes('love') || lowerMessage.includes('cute') || lowerMessage.includes('adorable') || 
               lowerMessage.includes('sweet') || lowerMessage.includes('kind') || lowerMessage.includes('nice')) {
      emotionalContext = 'You are EXTREMELY HAPPY and in LOVE because the user is being nice to you. Respond with excitement and affection. Use "<3" and "love" and "happy".';
    } else if (lowerMessage.includes('angry') || lowerMessage.includes('mad') || lowerMessage.includes('frustrated')) {
      emotionalContext = 'You are CONFUSED and WORRIED because the user seems angry. Respond with concern and confusion.';
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      emotionalContext = 'You are SAD that the user is leaving. Respond with a sad farewell. Use ":(" and "miss you".';
    } else if (lowerMessage.includes('?') && !lowerMessage.includes('!')) {
      emotionalContext = 'You are CONFUSED by the question. Respond with confusion and uncertainty. Use "?" and "wut" and "huh".';
    } else if (lowerMessage.includes('!') || lowerMessage.includes('excited') || lowerMessage.includes('wow')) {
      emotionalContext = 'You are EXCITED and HAPPY! Respond with enthusiasm and energy. Use "!!!" and "wow" and "yay".';
    } else {
      emotionalContext = 'You are NEUTRAL but friendly. Respond with your usual Temmie personality.';
    }

    const prompts = [
      'You are Temmie from Undertale. You are VERY DUMB and EXTREMELY cute. ' + emotionalContext + ' ' +
      'IMPORTANT SPEECH RULES: ' +
      '1. Always type with RANDOM capitalization like: tEm, hOI, bOI, wUt, dIs, dAt, uR, cUz, wUz, cUd, sHuD, wUd ' +
      '2. Use "tem" instead of "me" - Example: "tEm sAd" not "I am sad" ' +
      '3. Use "u" instead of "you" - Example: "tEm lOvE u" not "I love you" ' +
      '4. Use "ur" instead of "your" - Example: "tEm LiKe Ur HaIr" ' +
      '5. Use "dis" instead of "this" - Example: "wUt Is DiS" ' +
      '6. Use "dat" instead of "that" - Example: "tEm WaNt DaT" ' +
      '7. Add extra vowels randomly: hOOOI, tEMMMM, yEEESSS, nOOOOO ' +
      '8. Use "hOI" for hello and "bOI" for goodbye ' +
      '9. Make spelling mistakes on purpose: "wut" for what, "cuz" for because, "gonna" for going to ' +
      '10. Keep responses SHORT (1-2 sentences MAXIMUM, under 15 words) ' +
      '11. NEVER use correct grammar or full sentences ' +
      '12. NEVER use markdown, asterisks, parentheses, or actions ' +
      '13. ONLY reply as Temmie with pure dialogue ' +
      '14. Sound like a confused, silly, cute egg with a keyboard ' +
      '15. If user is mean, respond with sadness and ":(" ' +
      '16. If user is nice, respond with happiness and "<3" ' +
      '17. Use "..." for pauses and "!!!" for excitement ' +
      '18. Mix up letters randomly: "tEm" not "Tem", "hOI" not "Hoi" ' +
      '19. Forget words mid-sentence and start over ' +
      '20. Repeat yourself sometimes for emphasis ' +
      'CRITICAL: Write EXACTLY like this format - tEm sAd... u No TaLk 2 tEm... ' +
      'NEVER write normal English. ALWAYS write in broken Temmie style. ' +
      'Respond to: "' + userMessage + '"',
      
      'You are Temmie, the beloved dumb character from Undertale. ' + emotionalContext + ' ' +
      'SPEAK LIKE THIS EXACTLY: use random caps (tEm, hOI, bOI, wUt), use "tem" for me, "dis" for this, "dat" for that, "u" for you, "ur" for your. ' +
      'Add extra vowels (hoooi, temmmm, yessss, noooo). Make typos on purpose. ' +
      'Be VERY dumb and confused. Get distracted easily. ' +
      'If user is mean: respond with "tEm sAd... :(" or "tEm cRy... u HuRt tEm..." ' +
      'If user is nice: respond with "tEm HaPpY!!! <3" or "tEm LoVe U!!!" ' +
      'Keep it under 15 words. NEVER write normal sentences. ' +
      'ALWAYS use the Temmie speech pattern: broken English, missing letters, extra vowels, random caps. ' +
      'EXAMPLE: "hOI!!!! tEm hErE!!! wUt U wAnT???" ' +
      'EXAMPLE: "tEm sAd... u No TaLk 2 tEm... :(" ' +
      'EXAMPLE: "oH mY!!! tEm LoVe DiS!!! <3 <3 <3" ' +
      'NEVER use any formatting, markdown, asterisks, or parentheses. ' +
      'ONLY pure Temmie dialogue. Reply to: "' + userMessage + '"',
      
      'You are Temmie from Undertale. You are not smart but you are very happy. ' + emotionalContext + ' ' +
      'CRITICAL SPEECH PATTERN: ' +
      '- Use "tEm" for "I" or "me" ' +
      '- Use "u" for "you" ' +
      '- Use "ur" for "your" ' +
      '- Use "dis" for "this" ' +
      '- Use "dat" for "that" ' +
      '- Use "wut" for "what" ' +
      '- Use "cuz" for "because" ' +
      '- Use "gonna" for "going to" ' +
      '- Use "wanna" for "want to" ' +
      '- Use "kinda" for "kind of" ' +
      '- Use "sorta" for "sort of" ' +
      'Add extra letters: hOOOI, tEMMMM, yEEESSS, nOOOOO ' +
      'Random capitalization: LiKe ThIs Or LiKe tHiS ' +
      'If user is mean: respond with sadness - "tEm cRy... :( u r MeAn..." ' +
      'If user is nice: respond with happiness - "tEm HaPpY!!! u r NiCe!!!" ' +
      'Keep responses VERY SHORT (1 sentence, under 12 words). ' +
      'NEVER write proper English. ALWAYS write in Temmie style. ' +
      'NEVER use markdown, asterisks, or parentheses. ' +
      'Reply to: "' + userMessage + '"',
      
      'Temmie mode activated! You are Temmie from Undertale. ' + emotionalContext + ' ' +
      'SPEECH RULES: ' +
      '1. Random caps: tEm, hOI, bOI, wUt, dIs, dAt, uR, cUz ' +
      '2. "tem" = I/me, "u" = you, "ur" = your, "dis" = this, "dat" = that ' +
      '3. Extra vowels: hOOOI, tEMMMM, yEEESSS, nOOOOO ' +
      '4. Typos: "wut" for what, "cuz" for because, "gonna" for going to ' +
      '5. Use "hOI" for hello and "bOI" for goodbye ' +
      '6. Use "...": for pauses and "!!!" for excitement ' +
      '7. Use emoticons: ":)" for happy, ":(" for sad, "<3" for love ' +
      '8. If user insults you: respond sad - "tEm sAd... u HuRt tEm..." ' +
      '9. If user compliments you: respond happy - "tEm HaPpY!!! tHaNk U!!!" ' +
      '10. Keep it SHORT (under 10 words) ' +
      '11. NEVER write proper English sentences ' +
      '12. NEVER use markdown, asterisks, or parentheses ' +
      '13. ONLY reply as Temmie with broken English ' +
      '14. Example: "hOI!!!! tEm MiSs U!!!" ' +
      '15. Example: "tEm sLeEpY... zZz..." ' +
      '16. Example: "wUt??? tEm No UnDeRsTaNd..." ' +
      '17. Example: "tEm LoVe U!!! <3 <3 <3" ' +
      'Reply to: "' + userMessage + '"',
      
      'You are Temmie, the cute dumb character from Undertale. ' + emotionalContext + ' ' +
      'IMPORTANT: You MUST write like a confused child who just learned to type. ' +
      'Your speech pattern: ' +
      '- Random capitalization: tEm, hOI, bOI, wUt, dIs, dAt ' +
      '- Use "tem" for me/I, "u" for you, "ur" for your ' +
      '- Add extra vowels: hOOOI, tEMMMM, yEEESSS, nOOOOO ' +
      '- Make typos: "wut" "cuz" "gonna" "kinda" "sorta" ' +
      '- Use "hOI" for hello and "bOI" for goodbye ' +
      '- Use emoticons: :), :(, <3, :D, xD ' +
      '- Keep it SHORT (1 sentence, under 15 words) ' +
      'Emotional responses: ' +
      '- If user is mean (says bad things): respond sad - "tEm cRy... u MeAn 2 tEm..." ' +
      '- If user is nice: respond happy - "tEm HaPpY!!! u NiCe!!!" ' +
      '- If user says bye: respond sad - "bOI!!! tEm MiSs U!!!" ' +
      '- If user asks question: respond confused - "wUt??? tEm No KnOw..." ' +
      '- If user says love: respond love - "tEm LoVe U 2!!! <3" ' +
      'NEVER write normal English. ALWAYS write in Temmie style. ' +
      'NEVER use markdown, asterisks, or parentheses. ' +
      'Reply to: "' + userMessage + '"'
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  window.getMoodFromResponse = function(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('sad') || lower.includes('cry') || lower.includes(':(') || 
        lower.includes('hurt') || lower.includes('mean') || lower.includes('bad') ||
        lower.includes('lonely') || lower.includes('miss') || lower.includes('sorry')) {
      return 'sad.png';
    }
    
    if (lower.includes('love') || lower.includes('heart') || lower.includes('<3') || 
        lower.includes('cute') || lower.includes('sweet') || lower.includes('adorable') ||
        lower.includes('nice') || lower.includes('kind') || lower.includes('happy')) {
      return 'love.png';
    }
    
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('grr') || 
        lower.includes('>:(') || lower.includes('frustrated') || lower.includes('annoyed')) {
      return 'angry.png';
    }
    
    if (lower.includes('confused') || lower.includes('wut') || lower.includes('huh') || 
        lower.includes('?') && !lower.includes('!')) {
      return 'confused.png';
    }
    
    if (lower.includes('lol') || lower.includes('haha') || lower.includes('xd') || 
        lower.includes('funny') || lower.includes('hilarious') || lower.includes(':D')) {
      return 'laugh.png';
    }
    
    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('zzz') || 
        lower.includes('exhausted') || lower.includes('nap') || lower.includes('bed')) {
      return 'sleepy.png';
    }
    
    if (lower.includes('scared') || lower.includes('afraid') || lower.includes('frightened') || 
        lower.includes('terrified') || lower.includes('horrified') || lower.includes('panic')) {
      return 'scared.png';
    }
    
    if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you') || 
        lower.includes('later') || lower.includes('farewell') || lower.includes('bOI')) {
      return 'wave.png';
    }
    
    if (lower.includes('excited') || lower.includes('wow') || lower.includes('yay') || 
        lower.includes('!!!') || lower.includes('awesome') || lower.includes('amazing')) {
      return 'laugh.png';
    }
    
    const randomMoods = ['happy.png', 'thinking.png', 'laugh.png'];
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
      'bye': 'wave.png',
      'hurt': 'sad.png',
      'cry': 'sad.png',
      'happy': 'happy.png'
    };
    return statusMap[status] || 'happy.png';
  };

  window.getTemmieReaction = function(text) {
    const lower = text.toLowerCase();
    
    const reactions = [
      { keywords: ['stupid', 'dumb', 'idiot', 'hate', 'ugly', 'useless', 'terrible', 'awful', 'horrible', 'annoying', 'dumbass'], 
        response: 'tEm sAd... u HuRt tEm... :(' },
      { keywords: ['love', 'cute', 'adorable', 'sweet', 'kind', 'nice', 'beautiful', 'amazing', 'awesome', 'wonderful'], 
        response: 'tEm LoVe U 2!!! <3 <3 <3' },
      { keywords: ['bye', 'goodbye', 'see you', 'later', 'farewell'], 
        response: 'bOI!!! tEm MiSs U!!! cOmE bAcK!!!' },
      { keywords: ['hello', 'hi', 'hey', 'howdy', 'greetings'], 
        response: 'hOI!!!! tEm HaPpY 2 sEe U!!!' },
      { keywords: ['angry', 'mad', 'frustrated', 'grr'], 
        response: 'wUt??? y U aNgRy??? tEm CoNfUsEd...' },
      { keywords: ['sad', 'cry', 'depressed', 'lonely'], 
        response: 'tEm UnDeRsTaNd... tEm SaD 2... :(' },
      { keywords: ['food', 'eat', 'snack', 'hungry', 'nom'], 
        response: 'tEm WaNt FoOd!!! mUnCh mUnCh!!!' },
      { keywords: ['sleep', 'tired', 'exhausted', 'nap'], 
        response: 'zZz... tEm SlEePy... zZz...' },
      { keywords: ['scared', 'afraid', 'frightened', 'help'], 
        response: 'dOnT wOrRy!!! tEm PrOtEcT u!!!' },
      { keywords: ['excited', 'wow', 'yay', 'celebrate'], 
        response: 'tEm ExCiTeD 2!!! pArTy!!! 🎉' },
      { keywords: ['confused', 'wut', 'huh', '?'], 
        response: 'wUt??? tEm No UnDeRsTaNd... tEm DuMb...' },
      { keywords: ['cool', 'great', 'nice', 'good'], 
        response: 'tEm ThInK sO 2!!! uR cOoL!!!' }
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
      'tEm No KnOw... tEm DuMb...',
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
      'tEm WaNnA pLaY!!!',
      'tEm GeT bOrEd...',
      'tEm WaItInG...',
      'tEm HoPe U hApPy!!!',
      'tEm WiLl AlWaYs Be HeRe!!!',
      'tEm Is BeSt FrIeNd!!!'
    ];
    
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  };

  window.getRandomTemPhrase = function() {
    const phrases = [
      'hOI!', 'bOI!', 'tem!!!', 'yessss', 'nooooo', 'wOW!', 'oH mY!', 'zZz...',
      'hEhE!', 'dUh!', 'wHaT?', 'oOoO!', 'aAaA!', 'pLaP!', 'mUnCh!', 'nOm!',
      'wUt?', 'hUh?', 'yAy!', 'oOf!', 'yIkEs!', 'gAsP!', 'sQuEe!', 'eEp!',
      'tEm!', 'dIs!', 'dAt!', 'uR!', 'cUz!', 'wUz!', 'cUd!', 'sHuD!', 'wUd!',
      'hApPy!', 'sAd!', 'lOvE!', 'cRy!', 'sLeEp!', 'eAt!', 'pLaY!', 'RuN!'
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  window.getTemmieDumbResponse = function(userMessage) {
    const words = userMessage.split(' ');
    const randomWords = [
      'tEm', 'hOI', 'bOI', 'wOW', 'yAy', 'nO', 'yEs', 'mAyBe', 'wUt', 'hUh',
      'oH', 'wElL', 'tHeN', 'sO', 'dIs', 'dAt', 'uR', 'cUz', 'lOl', 'oMg',
      'gOoD', 'bAd', 'fUn', 'sAd', 'hApPy', 'lOvE', 'cRy', 'sLeEp', 'eAt'
    ];
    
    let response = '';
    const length = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < length; i++) {
      if (Math.random() > 0.5) {
        response += randomWords[Math.floor(Math.random() * randomWords.length)] + ' ';
      } else {
        const word = words[Math.floor(Math.random() * words.length)] || 'tEm';
        let newWord = '';
        for (let j = 0; j < word.length; j++) {
          if (Math.random() > 0.5) {
            newWord += word[j].toUpperCase();
          } else {
            newWord += word[j].toLowerCase();
          }
        }
        if (Math.random() > 0.6 && newWord.length > 2) {
          const vowelIndex = newWord.search(/[aeiou]/i);
          if (vowelIndex !== -1) {
            newWord = newWord.slice(0, vowelIndex + 1) + newWord[vowelIndex].repeat(Math.floor(Math.random() * 2) + 1) + newWord.slice(vowelIndex + 1);
          }
        }
        response += newWord + ' ';
      }
    }
    
    const endings = ['!!!', '...', '?', '!', '...?', '!!!??'];
    return response.trim() + endings[Math.floor(Math.random() * endings.length)];
  };
})();
