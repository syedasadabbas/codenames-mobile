import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import { assetUrl } from "../config";
import type { CardView } from "../protocol";

const fill: Record<string, string> = {
  red: colors.red,
  blue: colors.blue,
  neutral: colors.neutral,
  assassin: colors.assassin,
};

export default function CardTile({
  card,
  size,
  spymaster,
  canGuess,
  onGuess,
}: {
  card: CardView;
  size: number;
  spymaster: boolean;
  canGuess: boolean;
  onGuess: () => void;
}) {
  const revealed = card.revealed;
  const role = card.role;
  const isImage = !!card.image;
  const showKey = !revealed && spymaster && role;

  return (
    <Pressable
      onPress={onGuess}
      disabled={!canGuess || revealed}
      style={[
        styles.card,
        { width: size, height: isImage ? size : size * 0.62 },
        !isImage && styles.wordCard,
        showKey ? { borderWidth: 3, borderColor: fill[role!] } : null,
      ]}
    >
      {isImage && card.image ? (
        <Image source={{ uri: assetUrl(card.image) }} style={styles.image} resizeMode="cover" />
      ) : null}

      {!revealed && !isImage && (
        <Text style={styles.word} numberOfLines={2} adjustsFontSizeToFit>
          {card.word}
        </Text>
      )}

      {revealed && role && (
        <View style={[styles.overlay, { backgroundColor: fill[role] + (isImage ? "cc" : "ff") }]}>
          {!isImage && (
            <Text style={[styles.word, { color: role === "neutral" ? "#1c1917" : colors.white }]} numberOfLines={2} adjustsFontSizeToFit>
              {card.word}
            </Text>
          )}
          {role === "assassin" && <Text style={styles.skull}>X</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.sm, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "#292524" },
  wordCard: { backgroundColor: "#e7e5e4" },
  image: { position: "absolute", width: "100%", height: "100%" },
  word: { color: "#1c1917", fontWeight: "800", fontSize: 12, textAlign: "center", paddingHorizontal: 2 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  skull: { position: "absolute", top: 2, right: 4, color: colors.white, fontWeight: "900" },
});
