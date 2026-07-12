import { useCallback, useEffect, useState } from "react";
import { getSocket } from "../socket";
import { useAuthProfile } from "./useAuth";

export interface PublicUser {
  userId: string;
  username: string;
  displayName: string;
}
export interface FriendView extends PublicUser {
  online: boolean;
}
export interface IncomingRequestView {
  id: string;
  from: PublicUser;
}
export interface NotificationView {
  id: string;
  type: "friend_request" | "friend_accepted" | "game_invite" | "message";
  actorId: string | null;
  actorName: string | null;
  roomCode: string | null;
  text: string | null;
  read: boolean;
  at: number;
}

export function useSocial() {
  const profile = useAuthProfile();
  const enabled = !!profile;

  const [friends, setFriends] = useState<FriendView[]>([]);
  const [incoming, setIncoming] = useState<IncomingRequestView[]>([]);
  const [notifications, setNotifications] = useState<NotificationView[]>([]);

  const refreshFriends = useCallback(() => {
    if (!enabled) return;
    getSocket().emit("friend:list", (d: { friends: FriendView[]; incoming: IncomingRequestView[] }) => {
      setFriends(d.friends);
      setIncoming(d.incoming);
    });
  }, [enabled]);

  const refreshNotifications = useCallback(() => {
    if (!enabled) return;
    getSocket().emit("notif:list", (d: { notifications: NotificationView[] }) => setNotifications(d.notifications));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const socket = getSocket();
    const onFriendChanged = () => refreshFriends();
    const onPresence = (p: { userId: string; online: boolean }) =>
      setFriends((fs) => fs.map((f) => (f.userId === p.userId ? { ...f, online: p.online } : f)));
    const onNotif = (n: NotificationView) => setNotifications((ns) => [n, ...ns]);
    const onConnect = () => {
      refreshFriends();
      refreshNotifications();
    };

    socket.on("connect", onConnect);
    socket.on("friend:changed", onFriendChanged);
    socket.on("presence:update", onPresence);
    socket.on("notif:new", onNotif);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("friend:changed", onFriendChanged);
      socket.off("presence:update", onPresence);
      socket.off("notif:new", onNotif);
    };
  }, [enabled, refreshFriends, refreshNotifications]);

  const actions = {
    searchUsers: (query: string) =>
      new Promise<PublicUser[]>((resolve) =>
        getSocket().emit("user:search", { query }, (d: { users: PublicUser[] }) => resolve(d.users)),
      ),
    addFriend: (username: string) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) =>
        getSocket().emit("friend:add", { username }, (a: { ok: boolean; error?: string }) => {
          refreshFriends();
          resolve(a);
        }),
      ),
    respond: (requestId: string, accept: boolean) =>
      getSocket().emit("friend:respond", { requestId, accept }, () => refreshFriends()),
    invite: (toUserId: string) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) =>
        getSocket().emit("game:invite", { toUserId }, resolve),
      ),
    dismissNotification: (id: string) => {
      getSocket().emit("notif:read", { id });
      setNotifications((ns) => ns.filter((n) => n.id !== id));
    },
    refreshAll: () => {
      refreshFriends();
      refreshNotifications();
    },
  };

  const unread = notifications.filter((n) => !n.read).length;

  return { enabled, profile, friends, incoming, notifications, unread, actions };
}
