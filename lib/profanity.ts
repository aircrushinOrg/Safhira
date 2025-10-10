// Lightweight profanity filter suitable for nicknames. 
// Keeps the list short and culturally generic; add more as needed.
const bannedWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'slut', 'dick', 'pussy',
  'cunt', 'faggot', 'motherfucker', 'nigger', 'whore', 'retard', 'twat', 'nigga'
];

// Variants handling: leetspeak and common separators
const substitutions: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's'
};

function normalize(input: string): string {
  // lowercase
  let s = input.toLowerCase();
  // replace common obfuscations
  s = s
    .split('')
    .map((ch) => substitutions[ch] ?? ch)
    .join('');
  // collapse separators (spaces, underscores, dots, hyphens)
  s = s.replace(/[\s._-]+/g, '');
  return s;
}

export function containsProfanity(input: string): boolean {
  if (!input) return false;
  const n = normalize(input);
  return bannedWords.some((w) => n.includes(w));
}

export function sanitizeNickname(nickname: string): string {
  const trimmed = nickname.trim();
  return trimmed;
}

export default containsProfanity;


