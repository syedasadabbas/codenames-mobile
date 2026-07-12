import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import RoomScreen from "./src/screens/RoomScreen";
import AccountScreen from "./src/screens/AccountScreen";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { colors } from "./src/theme";
import type { CreateJoinAck, Identity } from "./src/protocol";
import { loadAuth } from "./src/auth";
import { applyAuthToken, getSocket } from "./src/socket";
import { getName } from "./src/storage";
import { useAuthProfile } from "./src/hooks/useAuth";

type Nav =
  | { screen: "home" }
  | { screen: "account" }
  | { screen: "room"; code: string; identity: Identity | null };

export default function App() {
  const [nav, setNav] = useState<Nav>({ screen: "home" });
  const profile = useAuthProfile();

  // Load persisted auth, then reconnect the socket so the server sees our token.
  useEffect(() => {
    loadAuth().then(() => applyAuthToken());
  }, []);

  // Join a room by code (used when accepting an invite).
  async function joinByCode(code: string) {
    const name = (await getName()) || "Anonymous";
    getSocket().emit("room:join", { code, name }, (ack: CreateJoinAck) => {
      if (ack.ok && ack.code && ack.identity) {
        setNav({ screen: "room", code: ack.code, identity: ack.identity });
      } else {
        Alert.alert("Couldn't join", ack.error ?? "The room may be full or closed.");
      }
    });
  }

  // Global game-invite notifications (work on any screen while signed in).
  useEffect(() => {
    if (!profile) return;
    const socket = getSocket();
    const onNotif = (n: {
      id: string;
      type: string;
      actorName: string | null;
      roomCode: string | null;
      text: string | null;
    }) => {
      if (n.type === "game_invite" && n.roomCode) {
        Alert.alert("Game invite", n.text ?? `${n.actorName ?? "A friend"} invited you to a game`, [
          { text: "Decline", style: "cancel", onPress: () => socket.emit("notif:read", { id: n.id }) },
          {
            text: "Accept",
            onPress: () => {
              socket.emit("notif:read", { id: n.id });
              joinByCode(n.roomCode!);
            },
          },
        ]);
      }
    };
    socket.on("notif:new", onNotif);
    return () => {
      socket.off("notif:new", onNotif);
    };
  }, [profile]);

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {nav.screen === "home" && (
        <HomeScreen
          onEnterRoom={(code, identity) => setNav({ screen: "room", code, identity })}
          onOpenAccount={() => setNav({ screen: "account" })}
        />
      )}
      {nav.screen === "account" && (
        <AccountScreen onClose={() => setNav({ screen: "home" })} onJoinRoom={joinByCode} />
      )}
      {nav.screen === "room" && (
        <RoomScreen code={nav.code} identity={nav.identity} onLeave={() => setNav({ screen: "home" })} />
      )}
    </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
