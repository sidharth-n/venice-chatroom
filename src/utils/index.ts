// Extract character names from Venice URLs
export const getCharacterName = (url: string): string => {
  if (!url) return 'Character';
  const match = url.match(/\/c\/([^?]+)/);
  if (match) {
    return match[1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'Character';
};

// Extract character slug from Venice URLs
export const getCharacterSlug = (url: string): string => {
  if (!url) return '';
  const match = url.match(/\/c\/([^?&#]+)/);
  return match ? match[1] : '';
};

// Enhanced dummy responses for more realistic conversation
export const dummyResponses = [
  "That's a fascinating perspective. I've been contemplating this from a different angle entirely.",
  "Your point resonates with me, though I wonder if we should consider the broader implications.",
  "I find myself both agreeing and questioning that statement. Let me elaborate on why.",
  "That's an intriguing way to frame it. In my experience, I've noticed something quite different.",
  "You've touched on something important there. It reminds me of a principle I hold dear.",
  "I appreciate your insight, but I feel compelled to offer a counterpoint to that idea.",
  "Your reasoning is sound, yet I can't help but think there's more to unpack here.",
  "That observation strikes at the heart of the matter. Allow me to build upon it.",
  "I'm curious about your perspective on this. It challenges some of my core beliefs.",
  "You raise an excellent point. However, I've always approached this differently.",
];
