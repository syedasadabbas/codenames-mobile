import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import RoomScreen from "./src/screens/RoomScreen";
import { colors } from "./src/theme";
import type { Identity } from "./src/protocol";

type Nav =
  | { screen: "home" }
  | { screen: "room"; code: string; identity: Identity | null };

export default function App() {
  const [nav, setNav] = useState<Nav>({ screen: "home" });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {nav.screen === "home" ? (
        <HomeScreen onEnterRoom={(code, identity) => setNav({ screen: "room", code, identity })} />
      ) : (
        <RoomScreen code={nav.code} identity={nav.identity} onLeave={() => setNav({ screen: "home" })} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
