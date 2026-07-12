// Account auth for the mobile app. Talks to the web app's REST endpoints
// (API_URL) and caches the JWT + profile in memory (for synchronous access by
// the socket) and AsyncStorage (to persist across launches). Guest play needs none.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

export interface Profile {
  userId: string;
  username: string;
  displayName: string;
}

let token: string | null = null;
let profile: Profile | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeAuth(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getAuthToken(): string | null {
  return token;
}
export function getAuthProfile(): Profile | null {
  return profile;
}
export function accountsAvailable(): boolean {
  return !!API_URL;
}

export async function loadAuth(): Promise<void> {
  if (loaded) return;
  try {
    token = await AsyncStorage.getItem("codenames:token");
    const p = await AsyncStorage.getItem("codenames:profile");
    profile = p ? (JSON.parse(p) as Profile) : null;
  } catch {
    /* ignore */
  }
  loaded = true;
  notify();
}

async function persist(): Promise<void> {
  try {
    if (token) await AsyncStorage.setItem("codenames:token", token);
    else await AsyncStorage.removeItem("codenames:token");
    if (profile) await AsyncStorage.setItem("codenames:profile", JSON.stringify(profile));
    else await AsyncStorage.removeItem("codenames:profile");
  } catch {
    /* ignore */
  }
}

async function authRequest(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string; profile?: Profile }> {
  if (!API_URL) return { ok: false, error: "Accounts unavailable — set EXPO_PUBLIC_WEB_URL." };
  try {
    const res = await fetch(API_URL + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Failed." };
    token = data.token;
    profile = data.profile;
    await persist();
    notify();
    return { ok: true, profile: data.profile };
  } catch {
    return { ok: false, error: "Network error." };
  }
}

export const login = (username: string, password: string) =>
  authRequest("/api/auth/login", { username, password });

export const register = (username: string, password: string, displayName?: string) =>
  authRequest("/api/auth/register", { username, password, displayName });

export async function logout(): Promise<void> {
  token = null;
  profile = null;
  await persist();
  notify();
}
