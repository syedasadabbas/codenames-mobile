import { StyleSheet, View, useWindowDimensions } from "react-native";
import CardTile from "./CardTile";
import type { RoomView } from "../protocol";
import type { RoomActions } from "../hooks/useRoom";

const GAP = 6;
const H_PADDING = 20; // room screen horizontal padding (10 each side)

export default function Board({ view, actions }: { view: RoomView; actions: RoomActions }) {
  const { width } = useWindowDimensions();
  const cols = view.gridCols || 5;
  const size = Math.floor((width - H_PADDING - GAP * (cols - 1)) / cols);

  const you = view.you;
  const canGuess =
    view.phase === "playing" &&
    view.turnPhase === "guess" &&
    you.role === "operative" &&
    you.team !== null &&
    you.team === view.currentTeam;

  return (
    <View style={styles.grid}>
      {view.board.map((card, i) => (
        <CardTile
          key={i}
          card={card}
          size={size}
          spymaster={you.isSpymaster}
          canGuess={canGuess}
          onGuess={() => actions.guess(i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP, justifyContent: "center" },
});
