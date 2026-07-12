import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import type { GameVariant } from "../protocol";

// Mirror of the web app's RulesModal content so both clients teach the same rules.
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Setup and roles",
    body: [
      "Players split into two teams: Blue and Red.",
      "Each team has at least one Spymaster and one Operative.",
      "Classic shows a 5×5 grid of 25 codename cards; Pictures shows a 5×4 grid of 20 picture cards.",
    ],
  },
  {
    title: "Spymasters — giving clues",
    body: [
      "Only the spymasters see the key card (who each card belongs to).",
      "On your turn, give a one-word clue and a number.",
      "The clue relates to cards your team should guess; the number says how many.",
    ],
  },
  {
    title: "Valid clues",
    body: [
      "The clue must be a single word.",
      "It cannot be, contain, or be contained by a word currently on the board.",
    ],
  },
  {
    title: "Special clue numbers",
    body: [
      "0 (∞) means unlimited guesses this turn.",
      "Otherwise, operatives may make exactly that many guesses.",
    ],
  },
  {
    title: "Operatives — guessing & end of turn",
    body: [
      "Tap a card to reveal who it belongs to.",
      "Correct (your agent): keep guessing, or end the turn.",
      "Bystander or enemy agent: your turn ends immediately.",
      "You must make at least one guess before ending your turn.",
    ],
  },
  {
    title: "Winning and losing",
    body: [
      "First team to reveal all their agents wins.",
      "Reveal the assassin and your team loses instantly.",
    ],
  },
];

export default function RulesModal({ visible, variant, onClose }: { visible: boolean; variant: GameVariant; onClose: () => void }) {
  const [open, setOpen] = useState(0);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>How to play — {variant === "pictures" ? "Pictures" : "Codenames"}</Text>
          <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.intro}>
          A game of word association and teamwork for two teams — Blue and Red. Guess your own cards before the other
          team, and never touch the assassin.
        </Text>
        <ScrollView contentContainerStyle={styles.list}>
          {SECTIONS.map((s, i) => (
            <View key={s.title} style={styles.section}>
              <Pressable style={styles.sectionHead} onPress={() => setOpen(open === i ? -1 : i)}>
                <Text style={styles.sectionTitle}>{s.title}</Text>
                <Text style={styles.chevron}>{open === i ? "▾" : "›"}</Text>
              </Pressable>
              {open === i && (
                <View style={styles.sectionBody}>
                  {s.body.map((b, j) => (
                    <Text key={j} style={styles.bullet}>
                      • {b}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { color: colors.text, fontSize: 20, fontWeight: "900", flex: 1 },
  close: { paddingHorizontal: 10, paddingVertical: 6 },
  closeText: { color: colors.muted, fontSize: 18, fontWeight: "800" },
  intro: { color: colors.muted, marginBottom: 12 },
  list: { gap: 8, paddingBottom: 24 },
  section: { backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  sectionTitle: { color: colors.text, fontWeight: "800", fontSize: 15 },
  chevron: { color: colors.muted, fontSize: 16 },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  bullet: { color: colors.muted, fontSize: 14, lineHeight: 20 },
});
