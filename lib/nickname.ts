const adjectives = [
  "Swift",
  "Neon",
  "Cosmic",
  "Crimson",
  "Quantum",
  "Electric",
  "Shadow",
  "Blazing",
  "Silver",
  "Golden",
  "Lunar",
  "Solar",
  "Velvet",
  "Turbo",
  "Crystal",
  "Nova",
  "Pixel",
  "Cyber",
  "Alpha",
  "Aurora",
];

const nouns = [
  "Falcon",
  "Panther",
  "Ninja",
  "Viper",
  "Ranger",
  "Phoenix",
  "Samurai",
  "Jaguar",
  "Comet",
  "Knight",
  "Wizard",
  "Voyager",
  "Rocket",
  "Specter",
  "Guardian",
  "Lynx",
  "Drifter",
  "Rogue",
  "Koala",
  "Otter",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generates a short, readable nickname like "Neon Otter 27"
export function generateRandomNickname(): string {
  const part1 = rand(adjectives);
  const part2 = rand(nouns);
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${part1} ${part2} ${num}`;
}

export default generateRandomNickname;

