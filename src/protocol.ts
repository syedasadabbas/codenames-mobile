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
}

export interface SimpleAck {
  ok: boolean;
  error?: string;
}
