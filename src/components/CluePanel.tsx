import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../theme";
import type { RoomView } from "../protocol";
import type { RoomActions } from "../hooks/useRoom";

export default function CluePanel({ view, actions }: { view: RoomView; actions: RoomActions }) {
  const [word, setWord] = useState("");
  const [count, setCount] = useState("1");

  const you = view.you;
  const myTurn = you.team === view.currentTeam;
  const isSpymasterTurn = you.isSpymaster && myTurn && view.turnPhase === "clue";
  const isOperativeTurn = myTurn && you.role === "operative" && you.team !== null && view.turnPhase === "guess";
  const teamColor = view.currentTeam === "red" ? colors.red : colors.blue;

  function submit() {
    const n = parseInt(count, 10);
    if (!word.trim() || Number.isNaN(n)) return;
    actions.giveClue(word.trim(), n);
    setWord("");
    setCount("1");
  }

  return (
    <View style={styles.panel}>
      <Text style={[styles.turn, { color: teamColor }]}>
        {(view.currentTeam ?? "").toUpperCase()} TEAM&apos;S TURN
      </Text>

      {view.turnPhase === "clue" && !isSpymasterTurn && (
        <Text style={styles.muted}>Waiting for the spymaster to give a clue…</Text>
      )}

      {isSpymasterTurn && (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="CLUE"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            value={word}
            onChangeText={setWord}
          />
          <TextInput
            style={[styles.input, styles.num]}
            keyboardType="number-pad"
            value={count}
            onChangeText={setCount}
            maxLength={1}
          />
          <Pressable style={styles.give} onPress={submit}>
            <Text style={styles.btnText}>Give</Text>
          </Pressable>
        </View>
      )}

      {view.turnPhase === "guess" && view.clue && (
        <View style={styles.clueBox}>
          <Text style={styles.clueText}>
            {view.clue.word.toUpperCase()}{"  "}
            <Text style={{ color: colors.amber }}>{view.clue.count === 0 ? "∞" : view.clue.count}</Text>
          </Text>
          <Text style={styles.muted}>
            Guesses left: {view.clue.guessesRemaining === null ? "unlimited" : view.clue.guessesRemaining}
          </Text>
          {isOperativeTurn ? (
            <Pressable
              style={[styles.end, { opacity: view.clue.guessesMade < 1 ? 0.5 : 1 }]}
              disabled={view.clue.guessesMade < 1}
              onPress={actions.endTurn}
            >
              <Text style={styles.btnText}>{view.clue.guessesMade < 1 ? "Make a guess first" : "End turn"}</Text>
            </Pressable>
          ) : (
            <Text style={styles.muted}>Tap a card to guess.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 12, gap: 8 },
  turn: { fontWeight: "900", textAlign: "center" },
  muted: { color: colors.muted, textAlign: "center" },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  num: { width: 54, textAlign: "center" },
  give: { backgroundColor: colors.green, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: "center" },
  clueBox: { alignItems: "center", gap: 6 },
  clueText: { color: colors.text, fontSize: 24, fontWeight: "900", letterSpacing: 1 },
  end: { backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 10, marginTop: 4 },
  btnText: { color: colors.white, fontWeight: "800" },
});
