// Lightweight persistence via AsyncStorage: the player's preferred name and a
// per-room identity (so a reconnect can reclaim the same seat).

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Identity } from "./protocol";

const NAME_KEY = "codenames:name";

export async function getName(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(NAME_KEY)) ?? "";
  } catch {
    return "";
  }
}

export async function setName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

export async function getIdentity(code: string): Promise<Identity | null> {
  try {
    const raw = await AsyncStorage.getItem(`codenames:id:${code.toUpperCase()}`);
    return raw ? (JSON.parse(raw) as Identity) : null;
  } catch {
    return null;
  }
}

export async function setIdentity(code: string, id: Identity): Promise<void> {
  try {
    await AsyncStorage.setItem(`codenames:id:${code.toUpperCase()}`, JSON.stringify(id));
  } catch {
    /* ignore */
  }
}
