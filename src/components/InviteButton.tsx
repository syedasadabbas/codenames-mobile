import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import { useSocial } from "../hooks/useSocial";

/**
 * "Invite friends" button for the room. Only shown to signed-in users while
 * there are open team spots (canInvite). Opens a picker of friends to invite.
 */
export default function InviteButton({ canInvite }: { canInvite: boolean }) {
  const social = useSocial();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) social.actions.refreshAll();
  }, [open]);

  if (!social.enabled || !canInvite) return null;

  async function invite(userId: string, name: string) {
    const r = await social.actions.invite(userId);
    setStatus((s) => ({ ...s, [userId]: r.ok ? "Invited" : r.error ?? "Failed" }));
  }

  return (
    <>
      <Pressable style={styles.btn} onPress={() => setOpen(true)}>
        <Text style={styles.btnText}>Invite friends</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Invite friends</Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>
            {social.friends.length === 0 && (
              <Text style={styles.muted}>No friends yet. Add friends from the Friends screen on the home page.</Text>
            )}
            {social.friends.map((f) => (
              <View key={f.userId} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: f.online ? "#34d399" : colors.muted }]} />
                <Text style={styles.name}>{f.displayName}</Text>
                {status[f.userId] ? (
                  <Text style={styles.muted}>{status[f.userId]}</Text>
                ) : (
                  <Pressable style={styles.invite} onPress={() => invite(f.userId, f.displayName)}>
                    <Text style={styles.inviteText}>Invite</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: colors.amber, borderRadius: radius.md, paddingVertical: 10, alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "800" },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 16, gap: 8, maxHeight: "70%" },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  close: { color: colors.sky, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { color: colors.text, flex: 1 },
  invite: { backgroundColor: colors.green, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  inviteText: { color: colors.white, fontWeight: "700" },
  muted: { color: colors.muted },
});
