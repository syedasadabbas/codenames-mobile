import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "../theme";
import type { RoomView } from "../protocol";
import type { RoomActions } from "../hooks/useRoom";

export default function Chat({ view, actions }: { view: RoomView; actions: RoomActions }) {
  const [text, setText] = useState("");
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, [view.chat.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    actions.sendChat(t);
    setText("");
  }

  return (
    <View style={styles.wrap}>
      <ScrollView ref={ref} style={styles.list} contentContainerStyle={{ padding: 8, gap: 3 }}>
        {view.chat.map((m) =>
          m.system ? (
            <Text key={m.id} style={styles.system}>
              {m.text}
            </Text>
          ) : (
            <Text key={m.id} style={styles.msg}>
              <Text style={{ color: m.team === "red" ? colors.red : m.team === "blue" ? colors.blue : colors.muted, fontWeight: "700" }}>
                {m.authorName}:{" "}
              </Text>
              {m.text}
            </Text>
          ),
        )}
      </ScrollView>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Message…"
          placeholderTextColor={colors.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          maxLength={300}
        />
        <Pressable style={styles.send} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, flex: 1, minHeight: 120 },
  list: { maxHeight: 180 },
  system: { color: colors.muted, fontStyle: "italic", fontSize: 12 },
  msg: { color: colors.text, fontSize: 13 },
  row: { flexDirection: "row", gap: 6, padding: 6, borderTopWidth: 1, borderTopColor: colors.border },
  input: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  send: { backgroundColor: colors.sky, borderRadius: radius.sm, paddingHorizontal: 14, justifyContent: "center" },
  sendText: { color: colors.white, fontWeight: "800" },
});
