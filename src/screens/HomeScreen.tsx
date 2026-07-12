import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getSocket } from "../socket";
import { getName, setName as saveName, setIdentity } from "../storage";
import { colors, radius } from "../theme";
import type { CreateJoinAck, GameVariant, Identity } from "../protocol";
import { useAuthProfile } from "../hooks/useAuth";

export default function HomeScreen({
  onEnterRoom,
  onOpenAccount,
}: {
  onEnterRoom: (code: string, identity: Identity | null) => void;
  onOpenAccount: () => void;
}) {
  const profile = useAuthProfile();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    getName().then(setName);
  }, []);

  // While searching, the room is formed asynchronously (paired with another
  // waiting player, or an open room appears). Navigate in when matched.
  useEffect(() => {
    if (!matching) return;
    const socket = getSocket();
    const onFound = (data: { code: string; identity: Identity }) => {
      setMatching(false);
      setIdentity(data.code, data.identity);
      onEnterRoom(data.code, data.identity);
    };
    socket.on("match:found", onFound);
    return () => {
      socket.off("match:found", onFound);
    };
  }, [matching, onEnterRoom]);

  function onNameChange(n: string) {
    setName(n);
    saveName(n);
  }

  function handle(ack: CreateJoinAck) {
    setBusy(false);
    setStatus(null);
    if (ack.ok && ack.code && ack.identity) {
      setIdentity(ack.code, ack.identity);
      onEnterRoom(ack.code, ack.identity);
    } else {
      setError(ack.error ?? "Something went wrong.");
    }
  }

  function create(variant: GameVariant) {
    setBusy(true);
    setError(null);
    setStatus("Creating room…");
    getSocket().emit("room:create", { name: name || "Anonymous", variant }, handle);
  }

  function join() {
    const c = code.trim().toUpperCase();
    if (c.length < 3) {
      setError("Enter a valid room code.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Joining…");
    getSocket().emit("room:join", { code: c, name: name || "Anonymous" }, handle);
  }

  function quickMatch(variant: GameVariant | "any") {
    setError(null);
    setMatching(true);
    getSocket().emit("match:find", { name: name || "Anonymous", variant }, (ack: CreateJoinAck) => {
      if (ack.ok && ack.code && ack.identity) {
        // Joined an already-open public room.
        setMatching(false);
        setIdentity(ack.code, ack.identity);
        onEnterRoom(ack.code, ack.identity);
      } else if (!ack.ok) {
        setMatching(false);
        setError(ack.error ?? "Could not find a match.");
      }
      // else: still searching — the match:found listener navigates when paired.
    });
  }

  function cancelMatch() {
    getSocket().emit("match:cancel");
    setMatching(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.friendsBtn} onPress={onOpenAccount}>
        <Text style={styles.friendsText}>{profile ? profile.displayName : "Sign in / Friends"}</Text>
      </Pressable>

      <Modal visible={matching} transparent animationType="fade" onRequestClose={cancelMatch}>
        <View style={styles.matchBackdrop}>
          <View style={styles.matchCard}>
            <ActivityIndicator size="large" color={colors.sky} />
            <Text style={styles.matchTitle}>Finding a match…</Text>
            <Text style={styles.matchSub}>Waiting for an open room or another player to join.</Text>
            <Pressable style={styles.matchCancel} onPress={cancelMatch}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Text style={styles.title}>
        <Text style={{ color: colors.red }}>CODE</Text>
        <Text style={{ color: colors.blue }}>NAMES</Text>
      </Text>
      <Text style={styles.tagline}>The word game of secret agents</Text>

      <Text style={styles.label}>Your codename</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Agent Nova"
        placeholderTextColor={colors.muted}
        value={name}
        maxLength={20}
        onChangeText={onNameChange}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Match</Text>
        <Text style={styles.cardSub}>Jump into an open public room.</Text>
        <Btn label="Find a match" color={colors.sky} onPress={() => quickMatch("any")} disabled={busy} />
      </View>

      <Text style={styles.section}>Start a game</Text>
      <Btn label="Words (Classic)" color={colors.blue} onPress={() => create("classic")} disabled={busy} />
      <Btn label="Pictures" color={colors.green} onPress={() => create("pictures")} disabled={busy} />
      <Btn label="Co-op (2+)" color="#4338ca" onPress={() => create("coop")} disabled={busy} />

      <Text style={styles.section}>Join a room</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="ABCD"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          value={code}
          maxLength={6}
          onChangeText={(t) => setCode(t.toUpperCase())}
        />
        <Pressable style={[styles.btn, { backgroundColor: colors.green, flex: 1 }]} onPress={join} disabled={busy}>
          <Text style={styles.btnText}>Join</Text>
        </Pressable>
      </View>

      {busy && (
        <View style={styles.statusRow}>
          <ActivityIndicator color={colors.sky} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.footer}>Built by Decodrs · decodrs.com</Text>
    </ScrollView>
  );
}

function Btn({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable style={[styles.btn, { backgroundColor: color, opacity: disabled ? 0.6 : 1 }]} onPress={onPress} disabled={disabled}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  friendsBtn: { alignSelf: "flex-end", backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  friendsText: { color: colors.text, fontWeight: "700" },
  matchBackdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.8)", padding: 24 },
  matchCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 24, alignItems: "center", gap: 12, width: "100%", maxWidth: 340 },
  matchTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  matchSub: { color: colors.muted, textAlign: "center" },
  matchCancel: { backgroundColor: colors.red, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 12, marginTop: 6 },
  title: { fontSize: 40, fontWeight: "900", textAlign: "center", letterSpacing: 4, marginTop: 12 },
  tagline: { color: colors.muted, textAlign: "center", marginBottom: 12 },
  label: { color: colors.muted, fontSize: 13, marginTop: 6 },
  section: { color: colors.muted, fontSize: 13, fontWeight: "700", textTransform: "uppercase", marginTop: 16, letterSpacing: 1 },
  input: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  codeInput: { flex: 1, fontFamily: "monospace", fontSize: 18, letterSpacing: 6, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  cardSub: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  btn: { borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  statusRow: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 12 },
  statusText: { color: colors.muted },
  error: { color: "#f87171", textAlign: "center", marginTop: 10 },
  footer: { color: colors.muted, textAlign: "center", fontSize: 12, marginTop: 24 },
});
