export const STATS = [
  { label: "Rounds sprinted today", target: 18420 },
  { label: "Players online now", target: 4281 },
  { label: "Words in the dataset", target: 340 },
  { label: "Model accuracy %", target: 97 },
];

export const FEATURES = [
  {
    icon: "⚡",
    title: "On-device recognition",
    desc: "Your model runs locally the moment you draw — no round trip to a server, no lag between a good line and a win.",
  },
  {
    icon: "◈",
    title: "Everyone races the same clock",
    desc: "All players get the same word at the same instant. Skill and speed decide it, not connection quality.",
  },
  {
    icon: "◐",
    title: "Confidence you can watch",
    desc: "Your prediction panel updates stroke by stroke, so you always know exactly how close you are to the win.",
  },
  {
    icon: "▣",
    title: "Rooms built for real matches",
    desc: "Custom difficulty, round counts, and privacy settings — practice solo or run a private sprint with friends.",
  },
  {
    icon: "◆",
    title: "Ranked seasons",
    desc: "Climb a real leaderboard with season resets, badges, and a history you can look back on.",
  },
  {
    icon: "✦",
    title: "340+ trained words",
    desc: "From house to hurricane — a growing, community-tested word set keeps every sprint unpredictable.",
  },
];

export const STEPS = [
  {
    num: "01",
    title: "You get a word",
    desc: "Every player in the room receives the same secret word at the same moment. The timer starts immediately.",
  },
  {
    num: "02",
    title: "Your AI watches you draw",
    desc: "A model running in your own browser scores your sketch continuously, stroke by stroke, live.",
  },
  {
    num: "03",
    title: "First correct call wins",
    desc: "The moment any player's AI crosses the confidence threshold, the round ends and XP is awarded instantly.",
  },
];

export const LEADERBOARD = [
  { rank: 1, name: "nova.exe", tier: "Diamond III", xp: "28,410 XP", wr: "72% WR", grad: "from-warning to-danger" },
  { rank: 2, name: "quickpen", tier: "Diamond II", xp: "26,980 XP", wr: "69% WR", grad: "from-secondary to-primary" },
  { rank: 3, name: "sketchbolt", tier: "Diamond II", xp: "25,120 XP", wr: "65% WR", grad: "from-accent to-success" },
  { rank: 4, name: "inkling_ai", tier: "Platinum I", xp: "23,760 XP", wr: "63% WR", grad: "from-danger to-accent" },
  { rank: 5, name: "rapidraw", tier: "Platinum I", xp: "22,310 XP", wr: "61% WR", grad: "from-success to-secondary" },
];

export const TESTIMONIALS = [
  {
    quote:
      "The confidence meter is what got me hooked. Watching it climb while you're still drawing is a completely different feeling than a normal guessing game.",
    name: "Maren K.",
    role: "Diamond II",
    grad: "from-primary to-secondary",
  },
  {
    quote:
      "I've played every drawing game out there. This is the first one where speed actually matters more than luck.",
    name: "Diego R.",
    role: "Platinum III",
    grad: "from-danger to-warning",
  },
  {
    quote:
      "Ran a private room with 8 friends for two hours straight. Nobody wanted to stop — the rounds are just that fast.",
    name: "Priya S.",
    role: "Gold I",
    grad: "from-success to-accent",
  },
];

export const FAQS = [
  {
    q: "Does the AI run on my device or on a server?",
    a: "Fully on your device. The recognition model loads into your browser once, then scores your drawing locally — nothing about your sketch is sent anywhere until the round ends.",
  },
  {
    q: "What happens if two players get recognized at the same time?",
    a: "The server timestamps each recognition event as it arrives, so ties are broken by whoever's confidence crossed the threshold first, down to the millisecond.",
  },
  {
    q: "Can I practice without joining a live room?",
    a: "Yes — Practice Mode gives you unlimited words and no opponents, so you can get a feel for how your model reads your drawing style.",
  },
  {
    q: "Is InkSprint free to play?",
    a: "Yes. Ranked play, practice mode, and private rooms are all free. Cosmetic profile items may come later, but nothing that affects the game itself.",
  },
];

// Simple stroke paths (normalized 0-1 coords) used by the hero's live
// self-drawing demo. Each word maps to an array of line segments.
export const DEMO_WORDS = ["ROCKET", "MOUNTAIN", "OCTOPUS", "LIGHTNING"];

export const DEMO_PATHS = {
  ROCKET: [
    [[0.5, 0.15], [0.42, 0.35], [0.42, 0.62], [0.58, 0.62], [0.58, 0.35], [0.5, 0.15]],
    [[0.42, 0.55], [0.28, 0.72], [0.42, 0.68]],
    [[0.58, 0.55], [0.72, 0.72], [0.58, 0.68]],
    [[0.46, 0.62], [0.46, 0.8], [0.54, 0.8], [0.54, 0.62]],
  ],
  MOUNTAIN: [
    [[0.12, 0.75], [0.35, 0.32], [0.5, 0.55], [0.65, 0.25], [0.88, 0.75], [0.12, 0.75]],
    [[0.6, 0.35], [0.65, 0.25], [0.7, 0.35]],
  ],
  OCTOPUS: [
    [
      [0.32, 0.4], [0.32, 0.28], [0.42, 0.2], [0.58, 0.2],
      [0.68, 0.28], [0.68, 0.4], [0.6, 0.5], [0.4, 0.5], [0.32, 0.4],
    ],
    [[0.35, 0.5], [0.25, 0.7]],
    [[0.42, 0.52], [0.36, 0.75]],
    [[0.5, 0.53], [0.5, 0.78]],
    [[0.58, 0.52], [0.64, 0.75]],
    [[0.65, 0.5], [0.75, 0.7]],
  ],
  LIGHTNING: [
    [[0.55, 0.15], [0.32, 0.5], [0.48, 0.5], [0.4, 0.85], [0.68, 0.42], [0.5, 0.42], [0.55, 0.15]],
  ],
};
