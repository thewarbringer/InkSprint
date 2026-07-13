export const CURRENT_USER = {
  username: "quickpen",
  tag: "Diamond II",
  level: 34,
  xp: 26980,
  xpToNext: 30000,
  avatarGrad: "from-secondary to-primary",
  winRate: 69,
  gamesPlayed: 842,
  favoriteCategory: "Animals",
};

export const DASHBOARD_STATS = [
  { label: "Games played", value: "842", icon: "Target" },
  { label: "Win rate", value: "69%", icon: "Flame" },
  { label: "Avg. recognition", value: "1.1s", icon: "Clock" },
  { label: "Current streak", value: "5", icon: "Sparkles" },
];

export const RECENT_MATCHES = [
  { word: "ROCKET", result: "win", xp: "+120 XP", time: "0.8s", ago: "12m ago" },
  { word: "OCTOPUS", result: "win", xp: "+95 XP", time: "1.3s", ago: "40m ago" },
  { word: "MOUNTAIN", result: "loss", xp: "+10 XP", time: "—", ago: "1h ago" },
  { word: "LIGHTNING", result: "win", xp: "+140 XP", time: "0.6s", ago: "2h ago" },
];

export const FRIENDS = [
  { name: "nova.exe", status: "online", activity: "In a sprint" },
  { name: "sketchbolt", status: "online", activity: "In lobby" },
  { name: "inkling_ai", status: "offline", activity: "Last seen 3h ago" },
];

export const DAILY_CHALLENGE = {
  title: "Win 3 rounds in under 1 second",
  progress: 1,
  target: 3,
  reward: "500 XP + Speedster badge",
};

export const PUBLIC_ROOMS = [
  { code: "SPRT-42A", name: "Casual Fridays", players: "4/8", difficulty: "Medium", mode: "Classic" },
  { code: "SPRT-19K", name: "Speedrun Only", players: "6/6", difficulty: "Hard", mode: "Blitz" },
  { code: "SPRT-77Q", name: "New Players Welcome", players: "2/8", difficulty: "Easy", mode: "Classic" },
  { code: "SPRT-03Z", name: "Diamond Lobby", players: "5/6", difficulty: "Hard", mode: "Ranked" },
];

export const LOBBY_PLAYERS = [
  { name: "quickpen", grad: "from-secondary to-primary", ready: true, isHost: true, isYou: true },
  { name: "nova.exe", grad: "from-warning to-danger", ready: true, isHost: false },
  { name: "sketchbolt", grad: "from-accent to-success", ready: false, isHost: false },
  { name: "inkling_ai", grad: "from-danger to-accent", ready: true, isHost: false },
];

export const LOBBY_CHAT = [
  { name: "nova.exe", text: "gl everyone 🔥" },
  { name: "sketchbolt", text: "ready in a sec" },
  { name: "inkling_ai", text: "let's go" },
];

export const GAME_OPPONENTS = [
  { name: "nova.exe", grad: "from-warning to-danger", score: 3 },
  { name: "sketchbolt", grad: "from-accent to-success", score: 2 },
  { name: "inkling_ai", grad: "from-danger to-accent", score: 1 },
];

export const RESULTS_DATA = {
  winner: "quickpen",
  isYou: true,
  word: "ROCKET",
  recognitionTime: "0.8s",
  xpGained: 140,
  newXpTotal: 27120,
  achievementsUnlocked: [{ title: "Speedster", desc: "Won a round in under 1 second" }],
  standings: [
    { rank: 1, name: "quickpen", score: 4, isYou: true },
    { rank: 2, name: "nova.exe", score: 3 },
    { rank: 3, name: "sketchbolt", score: 2 },
    { rank: 4, name: "inkling_ai", score: 1 },
  ],
};

export const PROFILE_BADGES = [
  { title: "Speedster", desc: "Won a round in under 1 second", earned: true },
  { title: "Century", desc: "Played 100 rounds", earned: true },
  { title: "Perfectionist", desc: "10 win streak", earned: true },
  { title: "Night Owl", desc: "Played 20 rounds after midnight", earned: false },
  { title: "Socialite", desc: "Played with 50 different players", earned: false },
  { title: "Champion", desc: "Won a ranked season", earned: false },
];

export const PROFILE_HISTORY = [
  { word: "ROCKET", result: "win", ago: "12m ago" },
  { word: "OCTOPUS", result: "win", ago: "40m ago" },
  { word: "MOUNTAIN", result: "loss", ago: "1h ago" },
  { word: "LIGHTNING", result: "win", ago: "2h ago" },
  { word: "GUITAR", result: "win", ago: "5h ago" },
];

export const LEADERBOARD_FULL = [
  { rank: 1, name: "nova.exe", tier: "Diamond III", xp: "28,410 XP", wr: "72% WR", grad: "from-warning to-danger" },
  { rank: 2, name: "quickpen", tier: "Diamond II", xp: "26,980 XP", wr: "69% WR", grad: "from-secondary to-primary" },
  { rank: 3, name: "sketchbolt", tier: "Diamond II", xp: "25,120 XP", wr: "65% WR", grad: "from-accent to-success" },
  { rank: 4, name: "inkling_ai", tier: "Platinum I", xp: "23,760 XP", wr: "63% WR", grad: "from-danger to-accent" },
  { rank: 5, name: "rapidraw", tier: "Platinum I", xp: "22,310 XP", wr: "61% WR", grad: "from-success to-secondary" },
  { rank: 6, name: "linework", tier: "Platinum II", xp: "20,905 XP", wr: "58% WR", grad: "from-primary to-warning" },
  { rank: 7, name: "doodlefast", tier: "Gold I", xp: "19,340 XP", wr: "56% WR", grad: "from-secondary to-accent" },
  { rank: 8, name: "pixelpaws", tier: "Gold I", xp: "18,220 XP", wr: "54% WR", grad: "from-danger to-success" },
];

export const SIDEBAR_LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: "LayoutDashboard" },
  { label: "Play", to: "/play", icon: "Swords" },
  
  { label: "Profile", to: "/profile", icon: "User" },
  { label: "Settings", to: "/settings", icon: "Settings" },
];
