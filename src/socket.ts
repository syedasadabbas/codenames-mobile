import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

let socket: Socket | null = null;

/**
 * Shared Socket.IO client. React Native works best over the pure websocket
 * transport. Pass an auth token later for account features; guest play needs none.
 */
export function getSocket(token?: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      auth: token ? { token } : {},
    });
  }
  return socket;
}
