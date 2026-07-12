// Wire protocol shared with the backend (mirror of the server's shared/protocol.ts,
// limited to what the mobile client needs). Keep in sync with the backend.

export type Team = "red" | "blue";
export type GameVariant = "classic" | "pictures" | "coop";
export type CardRole = "red" | "blue" | "neutral" | "assassin";
export type PlayerRole = "spymaster" | "operative";
export type GamePhase = "lobby" | "playing" | "finished";
export type TurnPhase = "clue" | "guess";
export type WinReason = "all-agents-found" | "assassin-revealed" | "opponent-assassin";

export interface PlayerView {
  id: string;
  name: string;
  team: Team | null;
  role: PlayerRole;
  isHost: boolean;
  connected: boolean;
}

export interface CardView {
  word: string;
  image: string | null;
  revealed: boolean;
  role: CardRole | null;
}

export interface ClueView {
  word: string;
  count: number;
  guessesMade: number;
  guessesRemaining: number | null;
}

export interface TeamScore {
  total: number;
  found: number;
  remaining: number;
}
export interface ScoreView {
  red: TeamScore;
  blue: TeamScore;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  team: Team | null;
  text: string;
  at: number;
  system: boolean;
}

export interface RoomSettings {
  turnSeconds: number | null;
}

export interface RoomView {
  code: string;
  phase: GamePhase;
  variant: GameVariant;
  gridCols: number;
  teamsLocked: boolean;
  isPublic: boolean;
  wordPack: string;
  hostId: string;
  players: PlayerView[];
  settings: RoomSettings;
  chat: ChatMessage[];
  board: CardView[];
  startingTeam: Team | null;
  currentTeam: Team | null;
  turnPhase: TurnPhase | null;
  clue: ClueView | null;
  score: ScoreView | null;
  winner: Team | null;
  winReason: WinReason | null;
  turnDeadline: number | null;
  you: {
    id: string;
    team: Team | null;
    role: PlayerRole;
    isHost: boolean;
    isSpymaster: boolean;
  };
}

export interface Identity {
  playerId: string;
  token: string;
}

export interface CreateJoinAck {
  ok: boolean;
  error?: string;
  code?: string;
  identity?: Identity;
  /** Quick Match only: true when a new public room was created (none open to join). */
  created?: boolean;
}

export interface SimpleAck {
  ok: boolean;
  error?: string;
}

/** Selectable word packs (word-based variants). Mirror of the backend metadata. */
export const WORD_PACK_META: { id: string; name: string; difficulty: "easy" | "medium" | "hard" }[] = [
  { id: "mixed", name: "Mixed", difficulty: "medium" },
  { id: "everyday", name: "Everyday", difficulty: "easy" },
  { id: "animals", name: "Animals", difficulty: "easy" },
  { id: "food", name: "Food & Drink", difficulty: "easy" },
  { id: "geography", name: "Geography", difficulty: "medium" },
  { id: "movies", name: "Movies & TV", difficulty: "medium" },
  { id: "sports", name: "Sports", difficulty: "medium" },
  { id: "science", name: "Science & Tech", difficulty: "hard" },
];

/** Per-turn timer options offered to the host (seconds; null = off). */
export const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Off", value: null },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "120s", value: 120 },
];

// --- Social (accounts only) ----------------------------------------------

export interface PublicUser {
  userId: string;
  username: string;
  displayName: string;
}

export interface DMView {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  at: number;
  deliveredAt: number | null;
  seenAt: number | null;
}

export interface ConversationView {
  user: PublicUser;
  online: boolean;
  lastMessage: DMView | null;
  unread: number;
}
