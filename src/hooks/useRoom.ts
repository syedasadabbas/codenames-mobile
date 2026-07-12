import { useEffect, useState } from "react";
import { getSocket } from "../socket";
import type { CreateJoinAck, GameVariant, Identity, PlayerRole, RoomView, Team } from "../protocol";

export interface RoomActions {
  setTeam: (team: Team | null) => void;
  setRole: (role: PlayerRole) => void;
  start: () => void;
  giveClue: (word: string, count: number) => void;
  guess: (cardIndex: number) => void;
  endTurn: () => void;
  returnToLobby: () => void;
  sendChat: (text: string) => void;
  leave: () => void;
  // Host lobby controls (mirror the web app).
  setVariant: (variant: GameVariant) => void;
  setWordPack: (packId: string) => void;
  setTimer: (turnSeconds: number | null) => void;
  setPrivate: (isPrivate: boolean) => void;
  resetTeams: () => void;
  randomizeTeams: () => void;
}

/**
 * Connects to the room and keeps its per-viewer state in sync. `identity` is the
 * seat obtained when creating/joining on the Home screen; it's used to reclaim
 * the same seat on reconnect.
 */
export function useRoom(code: string, identity: Identity | null) {
  const [view, setView] = useState<RoomView | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const rejoin = () => {
      if (!identity) return;
      socket.emit(
        "room:rejoin",
        { code, playerId: identity.playerId, token: identity.token },
        (ack: CreateJoinAck) => {
          if (!ack.ok) setError(ack.error ?? "Could not rejoin the room.");
        },
      );
    };

    const onConnect = () => {
      setConnected(true);
      rejoin();
    };
    const onDisconnect = () => setConnected(false);
    const onUpdate = (v: RoomView) => setView(v);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:update", onUpdate);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:update", onUpdate);
    };
  }, [code, identity]);

  const s = getSocket();
  const actions: RoomActions = {
    setTeam: (team) => s.emit("player:setTeam", { team }),
    setRole: (role) => s.emit("player:setRole", { role }),
    start: () => s.emit("game:start"),
    giveClue: (word, count) => s.emit("game:clue", { word, count }),
    guess: (cardIndex) => s.emit("game:guess", { cardIndex }),
    endTurn: () => s.emit("game:endTurn"),
    returnToLobby: () => s.emit("game:newGame"),
    sendChat: (text) => s.emit("chat:send", { text }),
    leave: () => s.emit("room:leave"),
    setVariant: (variant) => s.emit("room:setVariant", { variant }),
    setWordPack: (packId) => s.emit("room:setWordPack", { packId }),
    setTimer: (turnSeconds) => s.emit("settings:update", { turnSeconds }),
    setPrivate: (isPrivate) => s.emit("room:setPrivate", { isPrivate }),
    resetTeams: () => s.emit("teams:reset"),
    randomizeTeams: () => s.emit("teams:randomize"),
  };

  return { view, connected, error, actions };
}
