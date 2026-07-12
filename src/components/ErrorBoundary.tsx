import { Component, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

// Surfaces runtime errors on screen instead of leaving a blank/loading view —
// useful when debugging in Expo Go.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("App error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.root} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
          <Text style={styles.stack}>{this.state.error.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 10 },
  title: { color: "#f87171", fontSize: 20, fontWeight: "900" },
  msg: { color: colors.text, fontSize: 14 },
  stack: { color: colors.muted, fontSize: 11, fontFamily: "monospace" },
});
