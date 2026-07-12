import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../theme";
import { accountsAvailable, login, logout, register } from "../auth";
import { applyAuthToken } from "../socket";
import { useSocial, type PublicUser } from "../hooks/useSocial";

export default function AccountScreen({
  onClose,
  onJoinRoom,
}: {
  onClose: () => void;
  onJoinRoom: (code: string) => void;
}) {
  const social = useSocial();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Pressable onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>
      {social.enabled ? (
        <SignedIn social={social} onJoinRoom={onJoinRoom} />
      ) : (
        <AuthForm />
      )}
    </View>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = mode === "login" ? await login(username, password) : await register(username, password);
    setBusy(false);
    if (res.ok) applyAuthToken();
    else setError(res.error ?? "Failed.");
  }

  if (!accountsAvailable()) {
    return (
      <Text style={styles.muted}>
        Accounts need the web app URL. Set EXPO_PUBLIC_WEB_URL to your deployed site to enable friends and invites.
      </Text>
    );
  }

  return (
    <View style={styles.form}>
      <Text style={styles.muted}>Sign in to add friends and receive game invites.</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.primary} onPress={submit} disabled={busy}>
        <Text style={styles.primaryText}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
        <Text style={styles.link}>{mode === "login" ? "Create an account" : "I already have an account"}</Text>
      </Pressable>
    </View>
  );
}

function SignedIn({ social, onJoinRoom }: { social: ReturnType<typeof useSocial>; onJoinRoom: (code: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [sent, setSent] = useState<Record<string, string>>({});
  const friendIds = new Set(social.friends.map((f) => f.userId));

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => social.actions.searchUsers(q).then(setResults), 250);
    return () => clearTimeout(t);
  }, [query, social.actions]);

  const invites = social.notifications.filter((n) => n.type === "game_invite" && n.roomCode);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.rowBetween}>
        <Text style={styles.name}>{social.profile?.displayName}</Text>
        <Pressable onPress={() => { logout(); applyAuthToken(); }}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>

      {invites.length > 0 && (
        <>
          <Text style={styles.section}>INVITES</Text>
          {invites.map((n) => (
            <View key={n.id} style={styles.item}>
              <Text style={styles.itemText}>{n.text}</Text>
              <Pressable
                style={styles.accept}
                onPress={() => {
                  social.actions.dismissNotification(n.id);
                  onJoinRoom(n.roomCode!);
                }}
              >
                <Text style={styles.smallBtnText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.decline} onPress={() => social.actions.dismissNotification(n.id)}>
                <Text style={styles.smallBtnText}>Decline</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}

      <Text style={styles.section}>ADD FRIENDS</Text>
      <TextInput
        style={styles.input}
        placeholder="Search players by username"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        value={query}
        onChangeText={setQuery}
      />
      {results.map((u) => (
        <View key={u.userId} style={styles.item}>
          <Text style={styles.itemText}>
            {u.displayName} <Text style={styles.muted}>@{u.username}</Text>
          </Text>
          {friendIds.has(u.userId) ? (
            <Text style={styles.muted}>Friend</Text>
          ) : sent[u.userId] ? (
            <Text style={styles.muted}>{sent[u.userId]}</Text>
          ) : (
            <Pressable
              style={styles.accept}
              onPress={async () => {
                const r = await social.actions.addFriend(u.username);
                setSent((s) => ({ ...s, [u.userId]: r.ok ? "Sent" : r.error ?? "Failed" }));
              }}
            >
              <Text style={styles.smallBtnText}>Add</Text>
            </Pressable>
          )}
        </View>
      ))}

      {social.incoming.length > 0 && (
        <>
          <Text style={styles.section}>REQUESTS</Text>
          {social.incoming.map((r) => (
            <View key={r.id} style={styles.item}>
              <Text style={styles.itemText}>{r.from.displayName}</Text>
              <Pressable style={styles.accept} onPress={() => social.actions.respond(r.id, true)}>
                <Text style={styles.smallBtnText}>Accept</Text>
              </Pressable>
              <Pressable style={styles.decline} onPress={() => social.actions.respond(r.id, false)}>
                <Text style={styles.smallBtnText}>Decline</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}

      <Text style={styles.section}>FRIENDS ({social.friends.length})</Text>
      {social.friends.length === 0 && <Text style={styles.muted}>No friends yet. Search above to add someone.</Text>}
      {social.friends.map((f) => (
        <View key={f.userId} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: f.online ? "#34d399" : colors.muted }]} />
          <Text style={styles.itemText}>{f.displayName}</Text>
          <Text style={styles.muted}>{f.online ? "online" : "offline"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  close: { backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  closeText: { color: colors.text, fontWeight: "700" },
  form: { gap: 10 },
  body: { gap: 8, paddingBottom: 40 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { color: colors.text, fontSize: 18, fontWeight: "800" },
  section: { color: colors.muted, fontWeight: "800", fontSize: 12, marginTop: 12 },
  input: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  itemText: { color: colors.text, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  accept: { backgroundColor: colors.green, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  decline: { backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  smallBtnText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  primary: { backgroundColor: colors.sky, borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: colors.white, fontWeight: "800" },
  link: { color: colors.sky, textAlign: "center", fontWeight: "700" },
  muted: { color: colors.muted },
  error: { color: "#f87171" },
});
