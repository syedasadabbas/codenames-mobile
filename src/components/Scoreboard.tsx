import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import type { RoomView } from "../protocol";

export default function Scoreboard({ view }: { view: RoomView }) {
  const score = view.score;
  if (!score) return null;
  const coop = view.variant === "coop";

  return (
    <View style={styles.row}>
      <Pill
        label={coop ? "YOUR AGENTS" : "RED"}
        remaining={coop ? score.blue.remaining : score.red.remaining}
        color={coop ? colors.blue : colors.red}
        active={coop || view.currentTeam === "red"}
      />
      <Text style={styles.vs}>vs</Text>
      <Pill
        label={coop ? "ENEMY" : "BLUE"}
        remaining={coop ? score.red.remaining : score.blue.remaining}
        color={coop ? colors.red : colors.blue}
        active={!coop && view.currentTeam === "blue"}
      />
    </View>
  );
}

function Pill({ label, remaining, color, active }: { label: string; remaining: number; color: string; active: boolean }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + "33", borderColor: active ? color : "transparent" }]}>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
      <Text style={styles.pillNum}>{remaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  vs: { color: colors.muted },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: radius.md, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 6 },
  pillLabel: { fontWeight: "800" },
  pillNum: { color: colors.text, fontSize: 22, fontWeight: "900" },
});
