import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRoom } from "../hooks/useRoom";
import { colors, radius } from "../theme";
import type { Identity } from "../protocol";
import Lobby from "../components/Lobby";
import Scoreboard from "../components/Scoreboard";
import Board from "../components/Board";
import CluePanel from "../components/CluePanel";
import Chat from "../components/Chat";

export default function RoomScreen({
  code,
  identity,
  onLeave,
}: {
  code: string;
  identity: Identity | null;
  onLeave: () => void;
}) {
  const { view, connected, error, actions } = useRoom(code, identity);

  function leave() {
    actions.leave();
    onLeave();
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={{ color: colors.red }}>CODE</Text>
          <Text style={{ color: colors.blue }}>NAMES</Text>
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.code}>{code}</Text>
          <View style={[styles.dot, { backgroundColor: connected ? "#34d399" : "#f87171" }]} />
          <Pressable style={styles.exitBtn} onPress={leave}>
            <Text style={styles.exitText}>Exit</Text>
          </Pressable>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {!view ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.sky} />
          <Text style={styles.loading}>Connecting to {code}…</Text>
        </View>
      ) : view.phase === "lobby" ? (
        <Lobby view={view} actions={actions} />
      ) : (
        <Game view={view} actions={actions} />
      )}
    </View>
  );
}

function Game({ view, actions }: { view: NonNullable<ReturnType<typeof useRoom>["view"]>; actions: ReturnType<typeof useRoom>["actions"] }) {
  const finished = view.phase === "finished";
  return (
    <View style={styles.game}>
      {finished && (
        <View style={[styles.banner, { backgroundColor: (view.winner === "red" ? colors.red : colors.blue) + "55" }]}>
          <Text style={styles.bannerText}>
            {view.variant === "coop"
              ? view.winner === "blue"
                ? "MISSION ACCOMPLISHED"
                : "MISSION FAILED"
              : `${view.winner?.toUpperCase()} TEAM WINS`}
          </Text>
          <Pressable style={styles.rematch} onPress={actions.returnToLobby}>
            <Text style={styles.btnText}>Return to lobby</Text>
          </Pressable>
        </View>
      )}
      <Scoreboard view={view} />
      <Board view={view} actions={actions} />
      {!finished && <CluePanel view={view} actions={actions} />}
      <Chat view={view} actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10, paddingTop: 6 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  logo: { fontSize: 18, fontWeight: "900", letterSpacing: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: {
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: "monospace",
    letterSpacing: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  exitBtn: { backgroundColor: colors.red, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  exitText: { color: colors.white, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loading: { color: colors.muted },
  error: { color: "#f87171", textAlign: "center", marginVertical: 6 },
  game: { flex: 1, gap: 10 },
  banner: { borderRadius: radius.md, padding: 12, alignItems: "center", gap: 8 },
  bannerText: { color: colors.white, fontWeight: "900", fontSize: 18 },
  rematch: { backgroundColor: colors.green, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 8 },
  btnText: { color: colors.white, fontWeight: "800" },
});
