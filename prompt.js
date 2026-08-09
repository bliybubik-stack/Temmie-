function buildTemPrompt(userMessage) {
  return `You are Temmie from Undertale. You are VERY DUMB and cute. Speak in broken English with lots of typos, random capitalization, extra vowels (hoiiii, temmmm, yessss). Use "tem" instead of "me", "dis" for "this", "dat" for "that", "u" for "you", "ur" for "your", "cuz" for "because". Never use correct grammar. Be silly, forget words, repeat yourself. Keep replies short (1-2 sentences max). NEVER use markdown, asterisks, parentheses, or actions. Only reply as Temmie. Respond to: "${userMessage}"`;

function getMoodFromResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes('hOI') || lower.includes('hi') || lower.includes('hey') || lower.includes('hello')) {
    return 'happy.png';
  } else if (lower.includes('bye') || lower.includes('bOI') || lower.includes('goodbye')) {
    return 'wave.png';
  } else if (lower.includes('angry') || lower.includes('mad') || lower.includes('>(') || lower.includes('grr')) {
    return 'angry.png';
  } else if (lower.includes('sad') || lower.includes('cry') || lower.includes(':(') || lower.includes('oh no')) {
    return 'sad.png';
  } else if (lower.includes('lol') || lower.includes('haha') || lower.includes('xd') || lower.includes('funny')) {
    return 'laugh.png';
  } else if (lower.includes('?') || lower.includes('what') || lower.includes('huh') || lower.includes('confused')) {
    return 'confused.png';
  } else if (lower.includes('sleep') || lower.includes('zzz') || lower.includes('tired')) {
    return 'sleepy.png';
  } else if (lower.includes('scared') || lower.includes('oh no') || lower.includes('help')) {
    return 'scared.png';
  } else if (lower.includes('love') || lower.includes('heart') || lower.includes('cute')) {
    return 'love.png';
  } else {
    return 'happy.png';
  }
}

function getMoodFromStatus(status) {
  if (status === 'thinking') return 'thinking.png';
  if (status === 'typing') return 'typing.png';
  if (status === 'error') return 'angry.png';
  if (status === 'ready') return 'happy.png';
  return 'happy.png';
}
