import * as Clipboard from "expo-clipboard";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import type { PlayerView, RoomView, Team } from "../protocol";
import type { RoomActions } from "../hooks/useRoom";

export default function Lobby({ view, actions }: { view: RoomView; actions: RoomActions }) {
  const coop = view.variant === "coop";
  const spectators = view.players.filter((p) => p.team === null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.codeRow}>
        <Text style={styles.code}>{view.code}</Text>
        <Pressable style={styles.copy} onPress={() => Clipboard.setStringAsync(view.code)}>
          <Text style={styles.copyText}>Copy code</Text>
        </Pressable>
      </View>
      <Text style={styles.variant}>
        {coop ? "Co-op" : view.variant === "pictures" ? "Pictures" : "Words"} · {view.wordPack}
      </Text>

      <TeamCol team="blue" label={coop ? "YOUR TEAM" : "BLUE TEAM"} view={view} actions={actions} />
      {!coop && <TeamCol team="red" label="RED TEAM" view={view} actions={actions} />}

      <Text style={styles.secLabel}>SPECTATORS</Text>
      <View style={styles.panel}>
        {spectators.map((p) => (
          <PlayerRow key={p.id} p={p} youId={view.you.id} />
        ))}
        {view.you.team !== null && (
          <Pressable style={styles.joinNeutral} onPress={() => actions.setTeam(null)}>
            <Text style={styles.joinText}>Spectate</Text>
          </Pressable>
        )}
      </View>

      {view.you.isHost ? (
        <Pressable style={styles.start} onPress={actions.start}>
          <Text style={styles.startText}>START GAME</Text>
        </Pressable>
      ) : (
        <Text style={styles.muted}>Waiting for the host to start…</Text>
      )}
      <Text style={styles.hint}>
        {coop ? "Your team needs a spymaster and an operative (2+)." : "Each team needs a spymaster and an operative (4+)."}
      </Text>
    </ScrollView>
  );
}

function TeamCol({ team, label, view, actions }: { team: Team; label: string; view: RoomView; actions: RoomActions }) {
  const color = team === "blue" ? colors.blue : colors.red;
  const players = view.players.filter((p) => p.team === team);
  const spymasters = players.filter((p) => p.role === "spymaster");
  const operatives = players.filter((p) => p.role === "operative");

  return (
    <View style={[styles.teamCol, { borderColor: color }]}>
      <Text style={[styles.teamHeader, { backgroundColor: color }]}>{label}</Text>

      <Text style={styles.roleLabel}>OPERATIVES</Text>
      {operatives.map((p) => (
        <PlayerRow key={p.id} p={p} youId={view.you.id} />
      ))}
      <Pressable
        style={styles.join}
        onPress={() => {
          actions.setTeam(team);
          actions.setRole("operative");
        }}
      >
        <Text style={styles.joinText}>Join as operative</Text>
      </Pressable>

      <Text style={styles.roleLabel}>SPYMASTERS</Text>
      {spymasters.map((p) => (
        <PlayerRow key={p.id} p={p} youId={view.you.id} />
      ))}
      <Pressable
        style={styles.join}
        onPress={() => {
          actions.setTeam(team);
          actions.setRole("spymaster");
        }}
      >
        <Text style={styles.joinText}>Join as spymaster</Text>
      </Pressable>
    </View>
  );
}

function PlayerRow({ p, youId }: { p: PlayerView; youId: string }) {
  return (
    <View style={styles.playerRow}>
      <View style={[styles.pdot, { backgroundColor: p.connected ? "#34d399" : colors.muted }]} />
      <Text style={[styles.pname, p.id === youId && { fontWeight: "900" }]}>{p.name}</Text>
      {p.isHost && <Text style={styles.host}>host</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 6, gap: 10, paddingBottom: 40 },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  code: { color: colors.text, fontFamily: "monospace", fontSize: 26, letterSpacing: 8, backgroundColor: colors.surface2, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.md },
  copy: { backgroundColor: colors.sky, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8 },
  copyText: { color: colors.white, fontWeight: "800" },
  variant: { color: colors.muted, textAlign: "center", textTransform: "capitalize" },
  teamCol: { borderWidth: 2, borderRadius: radius.md, padding: 8, gap: 6 },
  teamHeader: { color: colors.white, fontWeight: "900", textAlign: "center", paddingVertical: 6, borderRadius: radius.sm, letterSpacing: 2 },
  roleLabel: { color: colors.muted, fontWeight: "800", fontSize: 12, marginTop: 4 },
  panel: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 8, gap: 6 },
  secLabel: { color: colors.muted, fontWeight: "800", fontSize: 12, textAlign: "center", marginTop: 4 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface2, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 6 },
  pdot: { width: 8, height: 8, borderRadius: 4 },
  pname: { color: colors.text, flex: 1 },
  host: { color: colors.amber, fontSize: 12, fontWeight: "700" },
  join: { backgroundColor: colors.green, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center" },
  joinNeutral: { backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 10, alignItems: "center" },
  joinText: { color: colors.white, fontWeight: "800" },
  start: { backgroundColor: colors.green, borderRadius: radius.md, paddingVertical: 16, alignItems: "center", marginTop: 6 },
  startText: { color: colors.white, fontWeight: "900", fontSize: 18, letterSpacing: 1 },
  muted: { color: colors.muted, textAlign: "center", marginTop: 6 },
  hint: { color: colors.muted, textAlign: "center", fontSize: 12 },
});
