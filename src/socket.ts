import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";
import { getAuthToken } from "./auth";

let socket: Socket | null = null;

function authObject() {
  const token = getAuthToken();
  return token ? { token } : {};
}

/**
 * Shared Socket.IO client. React Native works best over the pure websocket
 * transport. The auth token (if signed in) is read from the auth module.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      auth: authObject(),
    });
  }
  return socket;
}

/** Reconnect the socket so the server re-reads the (updated) auth token. */
export function applyAuthToken(): void {
  const s = getSocket();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (s as any).auth = authObject();
  s.disconnect().connect();
}
