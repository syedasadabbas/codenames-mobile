import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { getSocket } from "../socket";
import { getAuthProfile } from "../auth";
import type { DMView, PublicUser } from "../protocol";
import type { useSocial } from "../hooks/useSocial";

// Direct-message conversation with a friend. Mirrors the web DM panel:
// live delivery, and sent → delivered → seen receipts on the sender's own messages.
export default function DMThread({
  friend,
  social,
  onClose,
}: {
  friend: PublicUser;
  social: ReturnType<typeof useSocial>;
  onClose: () => void;
}) {
  const me = getAuthProfile()?.userId ?? "";
  const [messages, setMessages] = useState<DMView[]>([]);
  const [body, setBody] = useState("");
  const listRef = useRef<FlatList<DMView>>(null);

  useEffect(() => {
    let alive = true;
    social.actions.dmHistory(friend.userId).then((m) => {
      if (alive) setMessages(m);
    });
    social.actions.markDmRead(friend.userId);

    const socket = getSocket();
    const onNew = (msg: DMView) => {
      if (msg.fromUserId === friend.userId || msg.toUserId === friend.userId) {
        setMessages((prev) => (prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]));
        if (msg.fromUserId === friend.userId) social.actions.markDmRead(friend.userId);
      }
    };
    const onDelivered = (p: { messageId: string; at: number }) =>
      setMessages((prev) => prev.map((m) => (m.id === p.messageId ? { ...m, deliveredAt: p.at } : m)));
    const onSeen = (p: { withUserId: string; at: number }) => {
      if (p.withUserId !== friend.userId) return;
      setMessages((prev) => prev.map((m) => (m.fromUserId === me ? { ...m, seenAt: m.seenAt ?? p.at } : m)));
    };

    socket.on("dm:new", onNew);
    socket.on("dm:delivered", onDelivered);
    socket.on("dm:seen", onSeen);
    return () => {
      alive = false;
      socket.off("dm:new", onNew);
      socket.off("dm:delivered", onDelivered);
      socket.off("dm:seen", onSeen);
    };
  }, [friend.userId, me, social.actions]);

  async function send() {
    const text = body.trim();
    if (!text) return;
    setBody("");
    const r = await social.actions.sendDm(friend.userId, text);
    if (r.ok && r.message) {
      setMessages((prev) => (prev.some((x) => x.id === r.message!.id) ? prev : [...prev, r.message!]));
    }
  }

  function receipt(m: DMView): string {
    if (m.seenAt) return "Seen";
    if (m.deliveredAt) return "Delivered";
    return "Sent";
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.back}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>{friend.displayName}</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const mine = item.fromUserId === me;
            return (
              <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={styles.bubbleText}>{item.body}</Text>
                </View>
                {mine && <Text style={styles.receipt}>{receipt(item)}</Text>}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello!</Text>}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={colors.muted}
            value={body}
            onChangeText={setBody}
            onSubmitEditing={send}
            returnKeyType="send"
            multiline
          />
          <Pressable style={styles.send} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottomColor: colors.border, borderBottomWidth: 1 },
  back: { width: 60 },
  backText: { color: colors.sky, fontWeight: "700", fontSize: 15 },
  title: { color: colors.text, fontSize: 17, fontWeight: "800" },
  list: { padding: 12, gap: 8 },
  bubbleRow: { maxWidth: "82%", gap: 2 },
  rowMine: { alignSelf: "flex-end", alignItems: "flex-end" },
  rowTheirs: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleMine: { backgroundColor: colors.sky },
  bubbleTheirs: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  bubbleText: { color: colors.white, fontSize: 15 },
  receipt: { color: colors.muted, fontSize: 11 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 24 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 10, borderTopColor: colors.border, borderTopWidth: 1 },
  input: { flex: 1, backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, maxHeight: 120 },
  send: { backgroundColor: colors.green, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 12 },
  sendText: { color: colors.white, fontWeight: "800" },
});
